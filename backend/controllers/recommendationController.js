import mongoose from "mongoose";

import {
    recommendationCountries,
    recommendationProductCategories,
} from "../data/countryRecommendationScores.js";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import Report from "../models/Report.js";
import { buildComtradeRanking } from "../services/countryFitService.js";
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
    const query = req.method === "POST" ? req.body || {} : req.cleanQuery || req.query;
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

    const productCategory =
        recommendationProductCategories.find((category) => normalize(category) === filters.productCategory) ||
        "General goods";
    const countryFit = await buildComtradeRanking({
        productName: query.productName || query.product || "",
        hsCode: filters.hsCode,
        sourceCountry: query.sourceCountry || "India",
        targetCountries: query.targetCountries,
        flowCode: normalize(query.flowCode || query.flow || "X").startsWith("m") ? "M" : "X",
        period: query.period,
        productCategory,
        filters,
    });
    const recommendations = countryFit.ranking.map((item) => ({
        ...item,
        tradeDemandScore:
            item.scoreBreakdown?.tradeDemandScore ??
            (Number.isFinite(Number(item.scoreBreakdown?.demandScore))
                ? Number(item.scoreBreakdown.demandScore) * 10
                : null),
        availableTradeValue: item.tradeValue ?? null,
        growthSignal: item.trend || "Not available",
        whyRecommended: item.explanation,
        links: {
            documents: `/pages/document-checklist.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}`,
            compliance: `/pages/country-compliance.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}`,
            tariffs: `/pages/duty-tariff.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}`,
            report: `/pages/export-opportunity-report.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}`,
        },
    }));
    const visibleLimit = req.user ? recommendations.length : 1;
    const visibleRecommendations = recommendations.slice(0, visibleLimit);
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    let savedReportId = null;

    if (req.method === "POST" && userId && mongoose.Types.ObjectId.isValid(String(userId))) {
        const savedReport = await Report.create({
            userId,
            organizationId: mongoose.Types.ObjectId.isValid(String(req.user?.organizationId))
                ? req.user.organizationId
                : undefined,
            productName: String(query.productName || query.product || productCategory).trim(),
            hsCode: filters.hsCode,
            originCountry: query.sourceCountry || "India",
            targetCountry: countryFit.recommendedCountry,
            businessType: "Exporter",
            reportType: "country-fit",
            sourceDataType: countryFit.dataSourceLabel,
            isDemo: !countryFit.isLiveData,
            reportData: {
                reportTitle: `${query.productName || productCategory} Country Fit Report`,
                productName: query.productName || query.product || productCategory,
                hsCodeOrCategory: filters.hsCode || productCategory,
                country: countryFit.recommendedCountry,
                recommendedCountry: countryFit.recommendedCountry,
                rankedCountries: recommendations,
                confidenceScore: countryFit.confidenceScore,
                sourceType: countryFit.dataSourceLabel,
                disclaimer: "Country Fit is decision-support and must be verified before commercial decisions.",
                createdAt: new Date().toISOString(),
            },
        });
        savedReportId = savedReport._id;
    }

    AnalyticsEvent.create({
        event: "country_fit_search",
        userId: userId ? String(userId) : "anonymous",
        properties: {
            productName: query.productName || query.product || "",
            productCategory,
            hsCode: filters.hsCode,
            sourceCountry: query.sourceCountry || "India",
            targetCountries: query.targetCountries || recommendationCountries,
            recommendedCountry: countryFit.recommendedCountry,
            dataSourceLabel: countryFit.dataSourceLabel,
        },
        path: "/api/recommendations/country-fit",
    }).catch(() => null);

    res.json({
        success: true,
        sourceType: countryFit.isLiveData ? "api-backed" : "rule-engine",
        dataType: countryFit.isLiveData ? "live-api" : "curated/rule-engine",
        label: countryFit.isLiveData
            ? "Country Fit Engine - UN Comtrade plus rule-engine risk scoring."
            : "Country Fit Engine - rule-engine guidance. Live Comtrade demand is unavailable for this query.",
        recommendedCountry: countryFit.recommendedCountry,
        confidenceScore: countryFit.confidenceScore,
        explanation: countryFit.explanation,
        dataSourceLabel: countryFit.dataSourceLabel,
        access: {
            ...access,
            message: access.allowed
                ? access.message
                : "Free comparison limit reached. Showing preview recommendations; upgrade to unlock more comparisons.",
            upgradePrompt:
                access.plan === "guest"
                    ? "Login to unlock the full country ranking and save the result."
                    : "Upgrade to unlock detailed country comparison exports.",
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
                productName: query.productName || query.product || "",
                sourceCountry: query.sourceCountry || "India",
                targetCountries: query.targetCountries || recommendationCountries.join(","),
                exporterExperience: filters.exporterExperience,
                shipmentSize: filters.shipmentSize,
                budgetLevel: filters.budgetLevel,
                direction: query.direction || "export from India",
            },
        },
        topRecommendations: visibleRecommendations,
        recommendations: visibleRecommendations,
        countryRanking: visibleRecommendations,
        rankedCountries: visibleRecommendations,
        savedReportId,
        saved: Boolean(savedReportId),
        lockedRecommendationsCount: Math.max(recommendations.length - visibleRecommendations.length, 0),
        disclaimer:
            "Country Fit is decision-support. UN Comtrade values are historical trade-data signals when available; rule-engine and curated guidance are not legal, customs, banking or financial advice. Verify HS code, compliance, duty, buyer quality and payment terms with official sources and qualified professionals.",
    });
};

export { getCountryRecommendations };
