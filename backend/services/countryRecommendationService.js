const clamp = (value, min = 1, max = 10) => Math.max(min, Math.min(max, value));

const invertRisk = (value) => 11 - clamp(Number(value) || 5);

const experienceAdjustment = (item, exporterExperience) => {
    if (exporterExperience === "beginner") {
        return item.complianceComplexity >= 8 || item.marketEntryDifficulty >= 8 ? -8 : 3;
    }

    if (exporterExperience === "experienced") {
        return item.demandScore >= 8 ? 3 : 0;
    }

    return 0;
};

const shipmentAdjustment = (item, shipmentSize) => {
    if (shipmentSize === "sample") {
        return item.logisticsEase >= 7 ? 3 : -2;
    }

    if (shipmentSize === "bulk") {
        return item.demandScore >= 7 && item.logisticsEase >= 6 ? 3 : -3;
    }

    return 0;
};

const budgetAdjustment = (item, budgetLevel) => {
    if (budgetLevel === "low") {
        return item.marketEntryDifficulty <= 5 && item.tariffRisk <= 5 ? 4 : -4;
    }

    if (budgetLevel === "high") {
        return item.demandScore >= 8 ? 2 : 0;
    }

    return 0;
};

const scoreCountryRecommendation = (item, filters = {}) => {
    const baseScore =
        item.demandScore * 3 +
        item.logisticsEase * 2 +
        invertRisk(item.complianceComplexity) * 1.5 +
        invertRisk(item.paymentRisk) * 1.5 +
        invertRisk(item.tariffRisk) +
        invertRisk(item.marketEntryDifficulty);

    const adjustedScore =
        baseScore +
        experienceAdjustment(item, filters.exporterExperience) +
        shipmentAdjustment(item, filters.shipmentSize) +
        budgetAdjustment(item, filters.budgetLevel);

    return Math.round(clamp(adjustedScore, 10, 100));
};

const buildRecommendationReason = (item, filters = {}) => {
    const reasons = [
        `${item.country} scores ${item.demandScore}/10 for demand in ${item.productCategory}.`,
        `Logistics ease is ${item.logisticsEase}/10, with payment risk ${item.paymentRisk}/10 and tariff risk ${item.tariffRisk}/10.`,
    ];

    if (filters.exporterExperience === "beginner" && item.complianceComplexity <= 6) {
        reasons.push("It is comparatively easier for beginners because compliance complexity is moderate.");
    }

    if (filters.shipmentSize === "sample" && item.logisticsEase >= 7) {
        reasons.push("Sample shipments are more practical where logistics access is stronger.");
    }

    if (filters.budgetLevel === "low" && item.marketEntryDifficulty <= 5) {
        reasons.push("Lower market-entry difficulty can help users working with a lower budget.");
    }

    return reasons;
};

const buildRiskNotes = (item) => {
    const risks = [];

    if (item.complianceComplexity >= 7) risks.push("Compliance verification should be completed before outreach or shipment.");
    if (item.paymentRisk >= 6) risks.push("Use safer payment terms and buyer/supplier verification.");
    if (item.tariffRisk >= 6) risks.push("Confirm duty, tariff and Certificate of Origin impact before pricing.");
    if (item.marketEntryDifficulty >= 7) risks.push("Market entry may require stronger local partner or importer support.");
    if (!risks.length) risks.push("Main risks are manageable, but final buyer, duty and compliance checks are still required.");

    return risks;
};

export { buildRecommendationReason, buildRiskNotes, scoreCountryRecommendation };
