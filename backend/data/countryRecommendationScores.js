const lastUpdated = "2026-06-16";

const recommendationCountries = [
    "Kenya",
    "Tanzania",
    "Uganda",
    "Rwanda",
    "UAE",
    "Saudi Arabia",
    "Oman",
    "Qatar",
    "China",
];

const recommendationProductCategories = [
    "Food/agri",
    "Textiles",
    "Electronics",
    "Machinery",
    "Chemicals",
    "Pharma",
    "General goods",
];

const countryBase = {
    Kenya: { logisticsEase: 7, paymentRisk: 5, tariffRisk: 6, marketEntryDifficulty: 5 },
    Tanzania: { logisticsEase: 6, paymentRisk: 5, tariffRisk: 6, marketEntryDifficulty: 6 },
    Uganda: { logisticsEase: 5, paymentRisk: 6, tariffRisk: 6, marketEntryDifficulty: 6 },
    Rwanda: { logisticsEase: 5, paymentRisk: 5, tariffRisk: 6, marketEntryDifficulty: 6 },
    UAE: { logisticsEase: 9, paymentRisk: 3, tariffRisk: 4, marketEntryDifficulty: 4 },
    "Saudi Arabia": { logisticsEase: 7, paymentRisk: 4, tariffRisk: 5, marketEntryDifficulty: 6 },
    Oman: { logisticsEase: 7, paymentRisk: 4, tariffRisk: 4, marketEntryDifficulty: 5 },
    Qatar: { logisticsEase: 7, paymentRisk: 4, tariffRisk: 4, marketEntryDifficulty: 5 },
    China: { logisticsEase: 8, paymentRisk: 5, tariffRisk: 7, marketEntryDifficulty: 8 },
};

const categoryProfiles = {
    "Food/agri": {
        demand: { Kenya: 8, Tanzania: 7, Uganda: 7, Rwanda: 6, UAE: 9, "Saudi Arabia": 8, Oman: 7, Qatar: 7, China: 6 },
        competition: { Kenya: 6, Tanzania: 6, Uganda: 5, Rwanda: 5, UAE: 8, "Saudi Arabia": 7, Oman: 6, Qatar: 6, China: 8 },
        compliance: { Kenya: 7, Tanzania: 7, Uganda: 6, Rwanda: 6, UAE: 7, "Saudi Arabia": 8, Oman: 6, Qatar: 6, China: 9 },
        recommendedFor: "Established food/agri exporters with documentation readiness, shelf-life planning and regulator checks.",
        notRecommendedFor: "Beginners without HS, label, food safety or buyer documentation clarity.",
    },
    Textiles: {
        demand: { Kenya: 7, Tanzania: 6, Uganda: 6, Rwanda: 5, UAE: 8, "Saudi Arabia": 7, Oman: 6, Qatar: 6, China: 4 },
        competition: { Kenya: 6, Tanzania: 6, Uganda: 5, Rwanda: 5, UAE: 8, "Saudi Arabia": 7, Oman: 6, Qatar: 6, China: 9 },
        compliance: { Kenya: 5, Tanzania: 5, Uganda: 5, Rwanda: 5, UAE: 5, "Saudi Arabia": 6, Oman: 5, Qatar: 5, China: 7 },
        recommendedFor: "Exporters with consistent sizing, composition labels, samples and buyer-led specifications.",
        notRecommendedFor: "Suppliers without quality consistency or clear Incoterms/payment terms.",
    },
    Electronics: {
        demand: { Kenya: 6, Tanzania: 6, Uganda: 5, Rwanda: 5, UAE: 8, "Saudi Arabia": 8, Oman: 6, Qatar: 7, China: 7 },
        competition: { Kenya: 6, Tanzania: 6, Uganda: 5, Rwanda: 5, UAE: 8, "Saudi Arabia": 7, Oman: 6, Qatar: 6, China: 9 },
        compliance: { Kenya: 6, Tanzania: 6, Uganda: 6, Rwanda: 6, UAE: 7, "Saudi Arabia": 8, Oman: 6, Qatar: 6, China: 8 },
        recommendedFor: "Experienced traders who can manage certification, warranty, technical specs and supplier verification.",
        notRecommendedFor: "Beginners buying unfamiliar electronics without BIS/WPC/conformity checks.",
    },
    Machinery: {
        demand: { Kenya: 7, Tanzania: 7, Uganda: 6, Rwanda: 5, UAE: 7, "Saudi Arabia": 8, Oman: 6, Qatar: 6, China: 8 },
        competition: { Kenya: 5, Tanzania: 5, Uganda: 5, Rwanda: 4, UAE: 7, "Saudi Arabia": 6, Oman: 5, Qatar: 5, China: 8 },
        compliance: { Kenya: 5, Tanzania: 5, Uganda: 5, Rwanda: 5, UAE: 6, "Saudi Arabia": 7, Oman: 6, Qatar: 6, China: 7 },
        recommendedFor: "Exporters/importers who can provide technical documents, inspection support and after-sales clarity.",
        notRecommendedFor: "Small sample shipments where freight cost overwhelms margin.",
    },
    Chemicals: {
        demand: { Kenya: 6, Tanzania: 6, Uganda: 5, Rwanda: 5, UAE: 7, "Saudi Arabia": 8, Oman: 6, Qatar: 6, China: 7 },
        competition: { Kenya: 6, Tanzania: 6, Uganda: 5, Rwanda: 5, UAE: 7, "Saudi Arabia": 7, Oman: 6, Qatar: 6, China: 8 },
        compliance: { Kenya: 8, Tanzania: 8, Uganda: 7, Rwanda: 7, UAE: 8, "Saudi Arabia": 8, Oman: 7, Qatar: 7, China: 9 },
        recommendedFor: "Experienced exporters/importers with MSDS, DG classification and product-registration clarity.",
        notRecommendedFor: "Beginners without hazardous goods, packaging and restricted-chemical checks.",
    },
    Pharma: {
        demand: { Kenya: 7, Tanzania: 7, Uganda: 7, Rwanda: 6, UAE: 7, "Saudi Arabia": 8, Oman: 6, Qatar: 6, China: 5 },
        competition: { Kenya: 6, Tanzania: 6, Uganda: 6, Rwanda: 5, UAE: 7, "Saudi Arabia": 7, Oman: 6, Qatar: 6, China: 8 },
        compliance: { Kenya: 9, Tanzania: 9, Uganda: 8, Rwanda: 8, UAE: 9, "Saudi Arabia": 9, Oman: 8, Qatar: 8, China: 9 },
        recommendedFor: "Licensed pharma exporters with regulatory dossiers, batch documents and importer registrations.",
        notRecommendedFor: "Any user without drug licence, product registration and destination health authority clarity.",
    },
    "General goods": {
        demand: { Kenya: 6, Tanzania: 6, Uganda: 5, Rwanda: 5, UAE: 7, "Saudi Arabia": 7, Oman: 6, Qatar: 6, China: 6 },
        competition: { Kenya: 5, Tanzania: 5, Uganda: 5, Rwanda: 4, UAE: 7, "Saudi Arabia": 6, Oman: 5, Qatar: 5, China: 7 },
        compliance: { Kenya: 5, Tanzania: 5, Uganda: 5, Rwanda: 5, UAE: 5, "Saudi Arabia": 6, Oman: 5, Qatar: 5, China: 7 },
        recommendedFor: "Beginners comparing corridors before narrowing HS code, buyer type and shipment plan.",
        notRecommendedFor: "Users who need final landed-cost decisions without exact HS and compliance checks.",
    },
};

const countryProductScores = recommendationProductCategories.flatMap((productCategory) => {
    const profile = categoryProfiles[productCategory];

    return recommendationCountries.map((country) => ({
        country,
        productCategory,
        demandScore: profile.demand[country],
        competitionScore: profile.competition[country],
        complianceComplexity: profile.compliance[country],
        paymentRisk: countryBase[country].paymentRisk,
        logisticsEase: countryBase[country].logisticsEase,
        tariffRisk: countryBase[country].tariffRisk,
        marketEntryDifficulty: countryBase[country].marketEntryDifficulty,
        recommendedFor: profile.recommendedFor,
        notRecommendedFor: profile.notRecommendedFor,
        notes: "Rule-based sample intelligence for early country screening. Verify demand, compliance, duty, buyer quality and payment terms before committing.",
        dataType: "sample/manual",
        lastUpdated,
    }));
});

export { countryProductScores, recommendationCountries, recommendationProductCategories };
