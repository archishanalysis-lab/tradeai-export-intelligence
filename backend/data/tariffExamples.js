const lastUpdated = "2026-06-16";

const tariffFocusCountries = [
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

const tariffProductCategories = [
    "Food/agri",
    "Textiles",
    "Electronics",
    "Machinery",
    "Chemicals",
    "Pharma",
    "General goods",
];

const commonDisclaimer =
    "This is sample/manual tariff intelligence for planning only. Final duty, tariff, tax, exemption, valuation and HS classification must be verified with the official customs tariff portal, customs authority, CHA/customs broker or qualified professional before shipment.";

const countryTaxNotes = {
    Kenya: "Kenya imports may involve import duty, VAT, import declaration fee, railway development levy and product-specific levies where applicable.",
    Tanzania: "Tanzania imports may involve customs duty, VAT, railway development levy or destination charges depending on product and clearance route.",
    Uganda: "Uganda imports may involve import duty, VAT, withholding tax and product-specific levies where applicable.",
    Rwanda: "Rwanda imports may involve customs duty, VAT, infrastructure levy and product-specific charges where applicable.",
    UAE: "UAE commonly applies GCC customs duty on many imports, with VAT and product-specific excise/registration considerations where applicable.",
    "Saudi Arabia": "Saudi imports may involve customs duty, VAT, excise for selected goods and SABER/SASO-related compliance costs where applicable.",
    Oman: "Oman imports may involve GCC customs duty, VAT and product-specific approvals or charges where applicable.",
    Qatar: "Qatar imports may involve GCC customs duty, selective taxes and product-specific approvals where applicable.",
    China: "China imports may involve MFN duty, VAT, consumption tax for selected goods and product registration costs where applicable.",
};

const ptaNotes = {
    Kenya: "India-Kenya trade may rely on MFN or destination-specific preference checks; verify rules of origin before claiming any preference.",
    Tanzania: "Verify EAC/Tanzania tariff treatment and rules of origin with the importer or official tariff portal.",
    Uganda: "Verify EAC/Uganda tariff treatment and rules of origin before pricing.",
    Rwanda: "Verify EAC/Rwanda tariff treatment and rules of origin before claiming preferences.",
    UAE: "Check India-UAE CEPA eligibility, product coverage and rules of origin before pricing.",
    "Saudi Arabia": "Check GCC/Saudi tariff schedule and any applicable bilateral treatment; verify with importer or broker.",
    Oman: "Check GCC/Oman tariff schedule and any applicable preference before pricing.",
    Qatar: "Check GCC/Qatar tariff schedule and product-specific rules before pricing.",
    China: "Check China MFN/preferential treatment and product-specific import rules before pricing.",
};

const certificateImpact = {
    Kenya: "Certificate of Origin may support origin declaration and preference checks but does not guarantee duty reduction.",
    Tanzania: "Certificate of Origin may support origin treatment and customs validation where required.",
    Uganda: "Certificate of Origin may support origin treatment and preference checks where applicable.",
    Rwanda: "Certificate of Origin may support origin treatment and customs validation where applicable.",
    UAE: "Certificate of Origin can be important for CEPA/GCC origin claims; verify product-specific eligibility.",
    "Saudi Arabia": "Certificate of Origin may be required for clearance and origin validation; duty benefit depends on applicable rules.",
    Oman: "Certificate of Origin may support GCC/customs origin validation where applicable.",
    Qatar: "Certificate of Origin may support customs origin validation where applicable.",
    China: "Certificate of Origin may support origin validation but tariff treatment depends on HS, product rules and China customs assessment.",
};

const categoryProfiles = [
    {
        hsCode: "0902",
        productName: "Tea and spices",
        productCategory: "Food/agri",
        dutyType: "Import duty, VAT and food-control charges where applicable",
        estimatedDutyRate: "Sample range: 0% to 35% depending on HS code, country and product treatment",
        riskLevel: "high",
    },
    {
        hsCode: "6109",
        productName: "Garments and knitted apparel",
        productCategory: "Textiles",
        dutyType: "Import duty, VAT and textile/labelling compliance costs where applicable",
        estimatedDutyRate: "Sample range: 5% to 35% depending on tariff line and country",
        riskLevel: "medium",
    },
    {
        hsCode: "8501",
        productName: "Electrical machinery and electronics",
        productCategory: "Electronics",
        dutyType: "Import duty, VAT and conformity/certification costs where applicable",
        estimatedDutyRate: "Sample range: 0% to 20% depending on exact HS and conformity scope",
        riskLevel: "medium",
    },
    {
        hsCode: "8483",
        productName: "Machinery parts",
        productCategory: "Machinery",
        dutyType: "Import duty, VAT and inspection/conformity costs where applicable",
        estimatedDutyRate: "Sample range: 0% to 15% depending on exact machinery classification",
        riskLevel: "medium",
    },
    {
        hsCode: "3824",
        productName: "Chemical preparations",
        productCategory: "Chemicals",
        dutyType: "Import duty, VAT and hazardous/product-specific compliance costs where applicable",
        estimatedDutyRate: "Sample range: 0% to 25% depending on chemical type and restrictions",
        riskLevel: "high",
    },
    {
        hsCode: "3004",
        productName: "Medicaments and pharma products",
        productCategory: "Pharma",
        dutyType: "Import duty, VAT and health-regulator charges where applicable",
        estimatedDutyRate: "Sample range: 0% to 20% depending on medicine type and regulatory treatment",
        riskLevel: "high",
    },
];

const tariffExamples = tariffFocusCountries.flatMap((country) =>
    categoryProfiles.map((profile) => ({
        country,
        hsCode: profile.hsCode,
        productName: profile.productName,
        productCategory: profile.productCategory,
        direction: "export from India / import into India",
        dutyType: profile.dutyType,
        estimatedDutyRate: profile.estimatedDutyRate,
        taxNotes: countryTaxNotes[country],
        preferentialTradeAgreement: ptaNotes[country],
        certificateOfOriginImpact: certificateImpact[country],
        riskLevel: profile.riskLevel,
        sourceType: "manual/sample",
        lastUpdated,
        disclaimer: commonDisclaimer,
    })),
);

export { commonDisclaimer, tariffExamples, tariffFocusCountries, tariffProductCategories };
