const corridorProfiles = {
    kenya: {
        label: "Kenya",
        corridor: "India to East Africa",
        baseScore: 78,
        strengths: ["spices", "food", "pharma", "packaging", "machinery"],
        demandSignal: "Organized importer and distributor activity around Nairobi and Mombasa makes Kenya a practical first East Africa validation market.",
        buyerType: "Import distributors, supermarket suppliers, ingredient traders and wholesale networks.",
        riskLevel: "Medium",
        complianceNote: "Validate Kenya import documentation, labelling, shelf-life and certificate requirements before quoting.",
    },
    tanzania: {
        label: "Tanzania",
        corridor: "India to East Africa",
        baseScore: 72,
        strengths: ["food", "fmcg", "packaging", "machinery", "pharma"],
        demandSignal: "Dar es Salaam import and wholesale networks can support staple foods, FMCG, packaging and industrial categories.",
        buyerType: "Wholesale importers, FMCG distributors, industrial buyers and regional trading companies.",
        riskLevel: "Medium",
        complianceNote: "Check port timelines, local standards, labelling and agent expectations.",
    },
    uganda: {
        label: "Uganda",
        corridor: "India to East Africa",
        baseScore: 69,
        strengths: ["food", "wellness", "packaging", "consumer-goods"],
        demandSignal: "Uganda can work for focused SME exports where logistics, buyer reliability and repeat distributor demand are validated.",
        buyerType: "Kampala distributors, wellness retailers, FMCG wholesalers and institutional buyers.",
        riskLevel: "Medium-high",
        complianceNote: "Check inland logistics, importer reliability and payment terms before dispatch.",
    },
    rwanda: {
        label: "Rwanda",
        corridor: "India to East Africa",
        baseScore: 66,
        strengths: ["premium-food", "packaging", "light-goods", "wellness"],
        demandSignal: "Rwanda is smaller but organized, useful for quality-led categories and focused distributor testing.",
        buyerType: "SME distributors, retail networks and institutional procurement desks.",
        riskLevel: "Medium",
        complianceNote: "Confirm country-specific labelling rules and plan logistics through regional routes.",
    },
    uae: {
        label: "UAE",
        aliases: ["dubai", "united arab emirates"],
        corridor: "India to Gulf / GCC",
        baseScore: 84,
        strengths: ["spices", "food", "textiles", "jewellery", "re-export", "consumer-goods"],
        demandSignal: "UAE combines premium retail, hospitality, trading houses and re-export networks.",
        buyerType: "Importers, distributors, hospitality procurement desks, premium grocery buyers and trading houses.",
        riskLevel: "Medium",
        complianceNote: "Validate GCC labelling, certification, shelf-life and landed margin after freight and distributor commission.",
    },
    "saudi-arabia": {
        label: "Saudi Arabia",
        aliases: ["saudi", "ksa"],
        corridor: "India to Gulf / GCC",
        baseScore: 80,
        strengths: ["spices", "food", "construction", "consumer-goods", "packaging"],
        demandSignal: "Saudi Arabia has scale in foodservice, retail supply chains and consumer categories, but needs stronger compliance preparation.",
        buyerType: "Foodservice distributors, large importers, retail supply chains and category procurement teams.",
        riskLevel: "Medium-high",
        complianceNote: "Confirm Saudi standards, product registration needs and Arabic/English labelling where applicable.",
    },
    oman: {
        label: "Oman",
        corridor: "India to Gulf / GCC",
        baseScore: 70,
        strengths: ["food", "textiles", "hospitality", "consumer-goods"],
        demandSignal: "Oman is a relationship-led Gulf market suitable for controlled entry and focused retail distribution.",
        buyerType: "Retail distributors, hospitality suppliers and trading companies.",
        riskLevel: "Medium",
        complianceNote: "Validate importer role, destination documentation and landed cost versus UAE re-export alternatives.",
    },
    qatar: {
        label: "Qatar",
        corridor: "India to Gulf / GCC",
        baseScore: 74,
        strengths: ["food", "hospitality", "construction", "premium-food"],
        demandSignal: "Qatar suits quality-positioned products where certifications, packaging and hospitality procurement fit are clear.",
        buyerType: "Hospitality procurement teams, grocery distributors and specialty importers.",
        riskLevel: "Medium",
        complianceNote: "Prepare certification, packaging and MOQ details before outreach.",
    },
    china: {
        label: "China",
        corridor: "India-China sourcing",
        baseScore: 68,
        strengths: ["sourcing", "machinery", "industrial-inputs", "electronics", "textiles"],
        demandSignal: "China is stronger for sourcing intelligence, supplier comparison, landed-cost analysis and import dependency review in this MVP.",
        buyerType: "Sourcing offices, industrial importers, category traders and supplier comparison teams.",
        riskLevel: "Medium-high",
        complianceNote: "Clarify export discovery versus import sourcing, then validate supplier documentation and quality standards.",
    },
};

const categoryRules = [
    { category: "spices", keywords: ["turmeric", "spice", "chilli", "pepper", "masala", "cardamom"], hsPrefixes: ["0904", "0910"] },
    { category: "food", keywords: ["rice", "tea", "coffee", "snack", "food", "grain", "basmati"], hsPrefixes: ["1006", "0901", "0902", "1905", "2106"] },
    { category: "textiles", keywords: ["textile", "cotton", "t-shirt", "shirt", "garment", "fabric", "apparel"], hsPrefixes: ["5208", "6109", "6205", "6302"] },
    { category: "pharma", keywords: ["pharma", "medicine", "drug", "medical", "ayurvedic"], hsPrefixes: ["3003", "3004"] },
    { category: "packaging", keywords: ["packaging", "carton", "box", "container", "film"], hsPrefixes: ["3923", "4819"] },
    { category: "machinery", keywords: ["machinery", "machine", "pump", "equipment", "fastener", "industrial"], hsPrefixes: ["8413", "8438", "7318"] },
    { category: "jewellery", keywords: ["jewellery", "jewelry", "gem", "gold", "silver"], hsPrefixes: ["7113", "7103"] },
    { category: "sourcing", keywords: ["source", "sourcing", "supplier", "import from china", "manufacturer"], hsPrefixes: [] },
];

const normalizeText = (value = "") => String(value || "").toLowerCase().trim();

const slugifyCountry = (value = "") =>
    normalizeText(value)
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const clampScore = (value) => Math.max(35, Math.min(94, Math.round(value)));

function getCorridorProfile(country = "") {
    const clean = normalizeText(country);
    const slug = slugifyCountry(country);
    const match = Object.entries(corridorProfiles).find(([key, profile]) => {
        const aliases = profile.aliases || [];
        return key === slug || normalizeText(profile.label) === clean || aliases.some((alias) => normalizeText(alias) === clean);
    });

    if (match) {
        return {
            ...match[1],
            slug: match[0],
            supported: true,
            dataSourceLabel: "TradeAI MVP seeded corridor intelligence. Coverage is sample/demo, not live verified trade data.",
        };
    }

    return {
        label: country || "Selected market",
        slug: slug || "unsupported",
        corridor: "Coverage expanding",
        baseScore: 56,
        strengths: [],
        demandSignal: "TradeAI can structure this opportunity, but this country is outside the current priority corridor coverage.",
        buyerType: "Importers, distributors and category buyers relevant to the product.",
        riskLevel: "Coverage expanding",
        complianceNote: "Validate HS classification, country-specific documentation and buyer reliability before action.",
        supported: false,
        dataSourceLabel: "Coverage expanding. No seeded corridor intelligence is available for this country yet.",
    };
}

function inferProductCategory({ productName = "", hsCode = "", question = "" } = {}) {
    const haystack = normalizeText(`${productName} ${question}`);
    const hs = String(hsCode || "").trim();

    return (
        categoryRules.find((rule) =>
            rule.keywords.some((keyword) => haystack.includes(keyword)) ||
            rule.hsPrefixes.some((prefix) => hs.startsWith(prefix)),
        ) || {
            category: "unknown",
            keywords: [],
            hsPrefixes: [],
        }
    );
}

function scoreOpportunity({ productName = "", hsCode = "", targetCountry = "", businessType = "", certifications = "", question = "" } = {}) {
    const profile = getCorridorProfile(targetCountry);
    const category = inferProductCategory({ productName, hsCode, question });
    const certText = normalizeText(Array.isArray(certifications) ? certifications.join(" ") : certifications);
    const business = normalizeText(businessType);
    let score = profile.baseScore;
    const reasons = [];

    if (profile.strengths.includes(category.category)) {
        score += 7;
        reasons.push(`${category.category} fits seeded demand signals for ${profile.label}.`);
    } else if (category.category === "unknown") {
        score -= 6;
        reasons.push("Product category is unclear, so confidence is lower.");
    } else {
        score -= profile.supported ? 3 : 8;
        reasons.push(`${category.category} needs extra validation for ${profile.label}.`);
    }

    if (hsCode) {
        score += 3;
        reasons.push(`HS code ${hsCode} improves classification confidence.`);
    } else {
        score -= 5;
        reasons.push("Missing HS code reduces confidence.");
    }

    if (certText) {
        score += 4;
        reasons.push("Declared certifications improve buyer-readiness.");
    }

    if (business.includes("importer") && profile.slug !== "china") {
        score -= 4;
        reasons.push("Importer workflow needs supplier-discovery validation rather than export buyer discovery.");
    }

    if (!profile.supported) {
        score -= 8;
    }

    return {
        score: clampScore(score),
        category: category.category,
        profile,
        reasons,
    };
}

function buildOpportunityIntelligence(input = {}) {
    const productName = String(input.productName || input.product || "selected product").trim();
    const targetCountry = String(input.targetCountry || input.country || "").trim();
    const hsCode = String(input.hsCode || "").trim();
    const scoring = scoreOpportunity({ ...input, productName, targetCountry, hsCode });
    const { profile, category, score, reasons } = scoring;
    const hasHsCode = Boolean(hsCode);
    const nextActions = [
        hasHsCode ? `Validate HS ${hsCode} with a customs/compliance specialist.` : "Add a working HS code before buyer outreach.",
        `Shortlist ${profile.buyerType.toLowerCase()} for ${profile.label}.`,
        "Prepare product specification, MOQ, capacity, price range and certification notes.",
        profile.supported ? "Use this as MVP/demo intelligence and verify live trade data before commercial action." : "Treat this as coverage-expanding guidance until country data is added.",
    ];

    return {
        productName,
        hsCode,
        targetCountry: profile.label,
        productCategory: category,
        marketPotential: `${profile.demandSignal} Product focus: ${productName}.`,
        opportunityScore: score,
        demandReason: [profile.demandSignal, ...reasons].join(" "),
        buyerType: profile.buyerType,
        riskLevel: profile.riskLevel,
        complianceNotes: [
            profile.complianceNote,
            hasHsCode ? `Use HS code ${hsCode} as a working classification; verify before quoting.` : "HS code missing; classification should be added before outreach.",
        ],
        suggestedNextActions: nextActions,
        dataSourceLabel: profile.dataSourceLabel,
        isDemo: true,
        coverageStatus: profile.supported ? "MVP demo coverage" : "Coverage expanding",
        supportedCountry: profile.supported,
    };
}

function extractContextFromQuestion(question = {}) {
    const text = normalizeText(question);
    const profile = Object.values(corridorProfiles).find((item) => {
        const options = [item.label, item.slug, ...(item.aliases || [])];
        return options.some((option) => option && text.includes(normalizeText(option)));
    });
    const category = inferProductCategory({ question });
    const hsMatch = String(question || "").match(/\b\d{4,10}\b/);

    return {
        targetCountry: profile?.label || "",
        hsCode: hsMatch?.[0] || "",
        productCategory: category.category,
    };
}

function buildCopilotIntelligence({ question = "", productName = "", targetCountry = "", hsCode = "", savedReport = null } = {}) {
    const extracted = extractContextFromQuestion(question);
    const reportData = savedReport?.reportData || {};
    const resolvedProduct = productName || reportData.productName || savedReport?.productName || question;
    const resolvedCountry = targetCountry || extracted.targetCountry || reportData.targetCountry || savedReport?.targetCountry || "";
    const resolvedHsCode = hsCode || extracted.hsCode || reportData.hsCode || savedReport?.hsCode || "";
    const intelligence = buildOpportunityIntelligence({
        productName: resolvedProduct,
        targetCountry: resolvedCountry,
        hsCode: resolvedHsCode,
        question,
    });
    const reportNote = savedReport
        ? ` Latest saved report context used: ${savedReport.productName || reportData.productName || "report"} for ${savedReport.targetCountry || reportData.targetCountry || "target market"}.`
        : "";

    return {
        providerLabel: "TradeAI Rule Engine (MVP demo intelligence)",
        marketOpportunity: `${intelligence.marketPotential} Opportunity score: ${intelligence.opportunityScore}/100.${reportNote}`,
        buyerType: intelligence.buyerType,
        riskLevel: intelligence.riskLevel,
        documentsNeeded: [
            "Commercial invoice",
            "Packing list",
            "Certificate of origin",
            resolvedHsCode ? `HS code ${resolvedHsCode} validation` : "HS code validation",
            "Product specification sheet",
        ],
        nextActions: intelligence.suggestedNextActions,
        disclaimer: `${intelligence.dataSourceLabel} This is not legal, customs or live verified market advice.`,
    };
}

export {
    buildCopilotIntelligence,
    buildOpportunityIntelligence,
    getCorridorProfile,
    inferProductCategory,
    scoreOpportunity,
};
