import { countryProductScores, recommendationProductCategories } from "../data/countryRecommendationScores.js";
import { focusCountryNames } from "../data/focusCountryGuidance.js";
import { fetchComtradeRecords, hasComtradeApiKey } from "./tradeDataService.js";
import {
    buildRecommendationReason,
    buildRiskNotes,
    scoreCountryRecommendation,
} from "./countryRecommendationService.js";

const focusCountryCodes = {
    Kenya: "404",
    Tanzania: "834",
    Uganda: "800",
    Rwanda: "646",
    UAE: "784",
    "Saudi Arabia": "682",
    Oman: "512",
    Qatar: "634",
    China: "156",
};

const sourceCountryCodes = {
    India: "699",
};

const normalize = (value = "") => String(value || "").trim().toLowerCase();

const normalizeCountryName = (value = "") => {
    const normalized = normalize(value);
    if (normalized === "uae" || normalized === "united arab emirates") return "UAE";
    if (normalized === "saudi" || normalized === "ksa" || normalized === "saudi arabia") return "Saudi Arabia";

    return focusCountryNames.find((country) => normalize(country) === normalized) || "";
};

const normalizeTargetCountries = (targetCountries) => {
    const rawCountries = Array.isArray(targetCountries)
        ? targetCountries
        : String(targetCountries || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
    const normalized = rawCountries.map(normalizeCountryName).filter(Boolean);

    return normalized.length ? Array.from(new Set(normalized)) : focusCountryNames;
};

const deriveProductCategory = ({ productName = "", hsCode = "", productCategory = "" } = {}) => {
    const requested = normalize(productCategory);
    const exact = recommendationProductCategories.find((category) => normalize(category) === requested);
    if (exact) return exact;

    const cleanHs = String(hsCode || "").replace(/\D/g, "");
    const product = normalize(productName);

    if (/^(09|10|19|21)/.test(cleanHs) || /spice|turmeric|rice|tea|coffee|food|agri/.test(product)) return "Food/agri";
    if (/^(50|51|52|53|54|55|56|57|58|59|60|61|62|63)/.test(cleanHs) || /textile|garment|apparel|fabric/.test(product)) return "Textiles";
    if (/^(84|85)/.test(cleanHs) || /machine|machinery|pump|engine|equipment/.test(product)) return "Machinery";
    if (/^(28|29|32|33|34|38)/.test(cleanHs) || /chemical|paint|resin/.test(product)) return "Chemicals";
    if (/^(30)/.test(cleanHs) || /pharma|medicine|drug|tablet/.test(product)) return "Pharma";
    if (/^(85)/.test(cleanHs) || /electronic|device|cable|battery/.test(product)) return "Electronics";

    return "General goods";
};

const getRuleItem = (country, productCategory) =>
    countryProductScores.find((item) => item.country === country && item.productCategory === productCategory) ||
    countryProductScores.find((item) => item.country === country && item.productCategory === "General goods");

const buildRuleRanking = ({ productName, hsCode, productCategory, targetCountries, filters = {}, reason }) => {
    const category = deriveProductCategory({ productName, hsCode, productCategory });
    const countries = normalizeTargetCountries(targetCountries);
    const ranking = countries
        .map((country) => {
            const item = getRuleItem(country, category);
            const finalScore = scoreCountryRecommendation(item, filters);

            return {
                country,
                rank: 0,
                tradeValue: null,
                trend: "Not available without Comtrade data",
                confidenceScore: Math.max(45, Math.min(76, finalScore - 10)),
                finalScore,
                explanation: buildRecommendationReason(item, filters),
                risks: buildRiskNotes(item),
                dataSourceLabel: "Rule Engine",
                sourceLabel: "Rule Engine",
                scoreBreakdown: {
                    demandScore: item.demandScore,
                    competitionScore: item.competitionScore,
                    complianceComplexity: item.complianceComplexity,
                    paymentRisk: item.paymentRisk,
                    logisticsEase: item.logisticsEase,
                    tariffRisk: item.tariffRisk,
                    marketEntryDifficulty: item.marketEntryDifficulty,
                },
                recommendedFor: item.recommendedFor,
                notRecommendedFor: item.notRecommendedFor,
                productCategory: item.productCategory,
            };
        })
        .sort((a, b) => b.finalScore - a.finalScore)
        .map((item, index) => ({ ...item, rank: index + 1 }));

    return {
        recommendedCountry: ranking[0]?.country || "",
        countryRanking: ranking,
        ranking,
        confidenceScore: ranking[0]?.confidenceScore || 50,
        explanation: reason || "Country fit is based on TradeAI rule-engine guidance because live Comtrade demand was not available.",
        dataSourceLabel: "Rule Engine",
        sourceLabel: "Rule Engine",
        productCategory: category,
        isLiveData: false,
    };
};

const summarizeTrend = (records = []) => {
    const byYear = records.reduce((acc, record) => {
        const year = String(record.year || "");
        if (!year) return acc;
        acc[year] = (acc[year] || 0) + Number(record.tradeValue || 0);
        return acc;
    }, {});
    const years = Object.keys(byYear).sort();

    if (years.length < 2) {
        return years.length ? `Latest available ${years[0]}` : "No trend available";
    }

    const first = byYear[years[0]];
    const last = byYear[years[years.length - 1]];
    if (!first) return `Latest available ${years[years.length - 1]}`;

    const change = Math.round(((last - first) / first) * 100);
    if (change > 0) return `Up ${change}% from ${years[0]} to ${years[years.length - 1]}`;
    if (change < 0) return `Down ${Math.abs(change)}% from ${years[0]} to ${years[years.length - 1]}`;

    return `Flat from ${years[0]} to ${years[years.length - 1]}`;
};

const buildComtradeRanking = async ({ productName, hsCode, sourceCountry = "India", targetCountries, flowCode = "X", period, productCategory, filters = {} }) => {
    const sourceCode = sourceCountryCodes[sourceCountry] || sourceCountryCodes.India;
    const countries = normalizeTargetCountries(targetCountries);
    const category = deriveProductCategory({ productName, hsCode, productCategory });

    const cleanHsCode = String(hsCode || "").replace(/\D/g, "");

    if (!cleanHsCode || !/^\d{2,10}$/.test(cleanHsCode)) {
        return buildRuleRanking({
            productName,
            hsCode,
            productCategory: category,
            targetCountries: countries,
            filters,
            reason: "A numeric HS code is required for Comtrade demand comparison. Showing rule-engine guidance.",
        });
    }

    if (!hasComtradeApiKey()) {
        return buildRuleRanking({
            productName,
            hsCode,
            productCategory: category,
            targetCountries: countries,
            filters,
            reason: "Comtrade API key not configured. Showing rule-engine guidance.",
        });
    }

    const results = await Promise.all(
        countries.map(async (country) => {
            const ruleItem = getRuleItem(country, category);
            const ruleScore = scoreCountryRecommendation(ruleItem, filters);

            try {
                const result = await fetchComtradeRecords({
                    hsCode: cleanHsCode,
                    reporterCode: sourceCode,
                    partnerCode: focusCountryCodes[country],
                    flowCode,
                    period,
                    limit: 100,
                });
                const tradeValue = result.records.reduce((sum, record) => sum + Number(record.tradeValue || 0), 0);

                return {
                    country,
                    tradeValue,
                    period: result.period,
                    trend: summarizeTrend(result.records),
                    ruleScore,
                    ruleItem,
                    dataSourceLabel: "UN Comtrade",
                    sourceLabel: "UN Comtrade",
                    records: result.records,
                };
            } catch (error) {
                return {
                    country,
                    tradeValue: null,
                    period: period || "",
                    trend: "Not available from Comtrade for this query",
                    ruleScore,
                    ruleItem,
                    dataSourceLabel: "Rule Engine",
                    sourceLabel: "Rule Engine",
                    error: error.message,
                    records: [],
                };
            }
        }),
    );

    const maxTradeValue = Math.max(...results.map((item) => Number(item.tradeValue || 0)), 0);
    const hasLiveValue = maxTradeValue > 0;

    if (!hasLiveValue) {
        return buildRuleRanking({
            productName,
            hsCode,
            productCategory: category,
            targetCountries: countries,
            filters,
            reason: "UN Comtrade did not return usable demand values for the selected HS code. Showing rule-engine guidance.",
        });
    }

    const ranking = results
        .map((item) => {
            const demandScore = item.tradeValue ? Math.round((item.tradeValue / maxTradeValue) * 60) : 0;
            const finalScore = Math.round(demandScore + item.ruleScore * 0.4);
            const confidenceScore = item.dataSourceLabel === "UN Comtrade" ? Math.max(60, Math.min(92, finalScore)) : Math.max(45, Math.min(70, finalScore));

            return {
                country: item.country,
                rank: 0,
                tradeValue: item.tradeValue,
                period: item.period,
                trend: item.trend,
                confidenceScore,
                finalScore,
                explanation: [
                    item.tradeValue
                        ? `${item.country} shows USD ${Math.round(item.tradeValue).toLocaleString("en-US")} in latest available Comtrade value for HS ${cleanHsCode}.`
                        : `${item.country} did not return usable Comtrade value for HS ${cleanHsCode}.`,
                    ...buildRecommendationReason(item.ruleItem, filters),
                ],
                risks: buildRiskNotes(item.ruleItem),
                dataSourceLabel: item.dataSourceLabel,
                sourceLabel: item.sourceLabel,
                scoreBreakdown: {
                    tradeDemandScore: demandScore,
                    ruleScore: item.ruleScore,
                    demandScore: item.ruleItem.demandScore,
                    complianceComplexity: item.ruleItem.complianceComplexity,
                    paymentRisk: item.ruleItem.paymentRisk,
                    logisticsEase: item.ruleItem.logisticsEase,
                    tariffRisk: item.ruleItem.tariffRisk,
                },
                recommendedFor: item.ruleItem.recommendedFor,
                notRecommendedFor: item.ruleItem.notRecommendedFor,
                productCategory: item.ruleItem.productCategory,
            };
        })
        .sort((a, b) => b.finalScore - a.finalScore)
        .map((item, index) => ({ ...item, rank: index + 1 }));

    return {
        recommendedCountry: ranking[0]?.country || "",
        countryRanking: ranking,
        ranking,
        confidenceScore: ranking[0]?.confidenceScore || 60,
        explanation: "Country fit combines latest available UN Comtrade value with TradeAI rule-engine risk and readiness scoring.",
        dataSourceLabel: "UN Comtrade",
        sourceLabel: "UN Comtrade",
        productCategory: category,
        isLiveData: true,
    };
};

export { buildComtradeRanking, buildRuleRanking, focusCountryCodes, normalizeTargetCountries };
