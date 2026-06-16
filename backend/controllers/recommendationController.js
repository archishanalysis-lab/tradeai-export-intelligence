import {
    countryProductScores,
    recommendationCountries,
    recommendationProductCategories,
} from "../data/countryRecommendationScores.js";
import {
    buildRecommendationReason,
    buildRiskNotes,
    scoreCountryRecommendation,
} from "../services/countryRecommendationService.js";
import { checkFeatureAccess, consumeUsageLimit } from "../services/usageLimitService.js";

const normalize = (value = "") => String(value || "").trim().toLowerCase();

const normalizeCategory = (value = "") => {
    const category = normalize(value);

    if (["food", "agri", "agriculture", "spices", "rice", "tea"].includes(category)) return "food/agri";
    if (["textile", "garment", "garments"].includes(category)) return "textiles";
    if (["electronics", "electronic"].includes(category)) return "electronics";
    if (["machinery parts", "machine", "machines"].includes(category)) return "machinery";
    if (["chemical"].includes(category)) return "chemicals";
    if (["pharmaceuticals", "medicine", "medicines"].includes(category)) return "pharma";

    return category;
};

const getCountryRecommendations = async (req, res) => {
    const query = req.cleanQuery || req.query;
    const access = req.user
        ? await consumeUsageLimit(req, "countryComparison").catch((error) => ({
            allowed: false,
            plan: error.plan || "free",
            feature: "countryComparison",
            limit: error.limit,
            used: error.used,
            reason: error.code || "limit_reached",
            message: error.message,
        }))
        : await checkFeatureAccess(req, "countryComparison");
    const filters = {
        productCategory: normalizeCategory(query.productCategory || "General goods"),
        hsCode: String(query.hsCode || "").trim(),
        exporterExperience: normalize(query.exporterExperience || "beginner"),
        shipmentSize: normalize(query.shipmentSize || "small"),
        budgetLevel: normalize(query.budgetLevel || "medium"),
        direction: normalize(query.direction || "export from India"),
    };

    const productCategory = recommendationProductCategories.find(
        (category) => normalize(category) === filters.productCategory,
    ) || "General goods";

    const recommendations = countryProductScores
        .filter((item) => item.productCategory === productCategory)
        .map((item) => {
            const finalScore = scoreCountryRecommendation(item, filters);

            return {
                ...item,
                finalScore,
                scoreBreakdown: {
                    demandScore: item.demandScore,
                    competitionScore: item.competitionScore,
                    complianceComplexity: item.complianceComplexity,
                    paymentRisk: item.paymentRisk,
                    logisticsEase: item.logisticsEase,
                    tariffRisk: item.tariffRisk,
                    marketEntryDifficulty: item.marketEntryDifficulty,
                },
                whyRecommended: buildRecommendationReason(item, filters),
                risks: buildRiskNotes(item),
                links: {
                    documents: `/pages/document-checklist.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}`,
                    compliance: `/pages/country-compliance.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}`,
                    tariffs: `/pages/duty-tariff.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}`,
                    report: `/pages/export-opportunity-report.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}`,
                },
            };
        })
        .sort((a, b) => b.finalScore - a.finalScore);
    const isPaidPlan = ["growth", "pro", "enterprise"].includes(access.plan);
    const visibleLimit = access.plan === "guest" ? 1 : 3;
    const visibleRecommendations = isPaidPlan ? recommendations : recommendations.slice(0, visibleLimit);

    res.json({
        success: true,
        sourceType: "rule-based/sample",
        dataType: "sample",
        label: "Rule-based recommendation — sample intelligence, not AI.",
        access: {
            ...access,
            message: access.allowed
                ? access.message
                : "Free comparison limit reached. Showing preview recommendations; upgrade to unlock more comparisons.",
            upgradePrompt: access.plan === "guest" ? "Login to see top 3 country recommendations." : "Upgrade to unlock detailed country comparison exports.",
        },
        filters: {
            countries: recommendationCountries,
            productCategories: recommendationProductCategories,
            exporterExperiences: ["beginner", "intermediate", "experienced"],
            shipmentSizes: ["sample", "small", "bulk"],
            budgetLevels: ["low", "medium", "high"],
            selected: {
                productCategory,
                hsCode: filters.hsCode,
                exporterExperience: filters.exporterExperience,
                shipmentSize: filters.shipmentSize,
                budgetLevel: filters.budgetLevel,
                direction: query.direction || "export from India",
            },
        },
        topRecommendations: visibleRecommendations.slice(0, 3),
        recommendations: visibleRecommendations,
        lockedRecommendationsCount: Math.max(recommendations.length - visibleRecommendations.length, 0),
        disclaimer:
            "These recommendations are rule-based sample intelligence for early screening. Verify demand, HS code, documents, compliance, duty/tariff, buyer quality, payment terms and logistics with official sources and qualified professionals before making trade decisions.",
    });
};

export { getCountryRecommendations };
