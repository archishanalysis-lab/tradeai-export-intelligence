import mongoose from "mongoose";
import OpenAI from "openai";

import AiReport from "../models/AiReport.js";
import Report from "../models/Report.js";
import Subscription from "../models/Subscription.js";
import { buildOpportunityIntelligence } from "../services/tradeIntelligenceService.js";
import { answerTradeQuestion } from "../services/tradeCopilotService.js";
import { consumeUsageLimit, getPlanLimits, normalizePlanName } from "../services/usageLimitService.js";

const buildReportPrompt = ({ reportType, product, hsCode, targetCountry, prompt }) => {
    const reportLabel = {
        buyer_opportunity: "buyer opportunity report",
        market_forecast: "market forecast",
        hs_code_demand: "HS code demand analysis",
        pricing: "pricing recommendation",
        custom: "custom trade intelligence report",
    }[reportType || "custom"];

    return `
Generate a concise ${reportLabel}.
Product: ${product || "not specified"}
HS Code: ${hsCode || "not specified"}
Target Country: ${targetCountry || "not specified"}
User Request: ${prompt || "Recommend best opportunities and next actions."}
Include: opportunity summary, buyer segments, risk notes, next actions.
`;
};

const normalizeList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const countryProfiles = {
    kenya: {
        label: "Kenya",
        marketPotential: "Practical East Africa entry market for food, spices, FMCG and light manufactured products.",
        opportunityScore: 78,
        demandReason: "Kenya has an organized importer/distributor base around Nairobi and Mombasa, making it useful for validating buyer segments and repeat B2B demand.",
        buyerType: "Import distributors, supermarket suppliers, ingredient traders and wholesale networks.",
        riskLevel: "Medium",
        complianceNotes: ["Validate Kenya import documentation and labelling rules.", "Confirm product shelf life, packaging and certificate requirements.", "Use verified buyer checks before commercial outreach."],
    },
    tanzania: {
        label: "Tanzania",
        marketPotential: "East Africa market for staple foods, FMCG, packaging, machinery and pharma-adjacent categories.",
        opportunityScore: 72,
        demandReason: "Dar es Salaam import and wholesale networks create a useful buyer-discovery corridor for Indian exporters.",
        buyerType: "Wholesale importers, FMCG distributors, industrial buyers and regional trading companies.",
        riskLevel: "Medium",
        complianceNotes: ["Check port and inland logistics timelines.", "Validate standards, labelling and local agent expectations."],
    },
    uganda: {
        label: "Uganda",
        marketPotential: "Land-linked East Africa demand for food products, wellness categories, packaging and consumer goods.",
        opportunityScore: 69,
        demandReason: "Uganda can work as a focused SME export corridor when buyer reliability and logistics are handled carefully.",
        buyerType: "Kampala distributors, wellness retailers, FMCG wholesalers and institutional buyers.",
        riskLevel: "Medium-high",
        complianceNotes: ["Check inland logistics and payment terms.", "Validate importer reliability before dispatch."],
    },
    rwanda: {
        label: "Rwanda",
        marketPotential: "Smaller but organized East Africa opportunity for premium food, packaging and light goods.",
        opportunityScore: 66,
        demandReason: "Rwanda is useful for focused testing where product quality, documentation and reliable partners matter more than volume.",
        buyerType: "SME distributors, retail networks and institutional procurement desks.",
        riskLevel: "Medium",
        complianceNotes: ["Confirm country-specific labelling rules.", "Plan logistics through regional routes."],
    },
    uae: {
        label: "UAE",
        marketPotential: "High-priority Gulf market for premium food, spices, textiles, jewellery and re-export positioning.",
        opportunityScore: 84,
        demandReason: "UAE combines premium retail, hospitality, trading houses and re-export networks, making it strong for early buyer segmentation.",
        buyerType: "Importers, distributors, hospitality procurement desks, premium grocery buyers and trading houses.",
        riskLevel: "Medium",
        complianceNotes: ["Validate GCC labelling and certification needs.", "Check margin after freight, distributor commission and retail packaging costs."],
    },
    "saudi-arabia": {
        label: "Saudi Arabia",
        marketPotential: "Large Gulf market for foodservice, packaged food, construction inputs and consumer categories.",
        opportunityScore: 80,
        demandReason: "Saudi Arabia has scale, but exporters need stronger compliance preparation and buyer qualification.",
        buyerType: "Foodservice distributors, large importers, retail supply chains and category procurement teams.",
        riskLevel: "Medium-high",
        complianceNotes: ["Confirm Saudi standards and product registration requirements.", "Prepare Arabic/English labelling where needed."],
    },
    oman: {
        label: "Oman",
        marketPotential: "Focused Gulf market for retail distribution, food, textiles and hospitality-related categories.",
        opportunityScore: 70,
        demandReason: "Oman is useful for controlled Gulf entry where relationship-led importer discovery matters.",
        buyerType: "Retail distributors, hospitality suppliers and trading companies.",
        riskLevel: "Medium",
        complianceNotes: ["Validate documentation and importer role clearly.", "Compare landed cost against UAE re-export alternatives."],
    },
    qatar: {
        label: "Qatar",
        marketPotential: "Premium Gulf opportunity for food products, hospitality procurement and construction-linked categories.",
        opportunityScore: 74,
        demandReason: "Qatar can work for exporters with quality positioning, certifications and buyer-ready product specs.",
        buyerType: "Hospitality procurement teams, grocery distributors and specialty importers.",
        riskLevel: "Medium",
        complianceNotes: ["Prepare certification and packaging details.", "Check MOQ expectations before outreach."],
    },
    china: {
        label: "China",
        marketPotential: "Import/sourcing intelligence corridor for inputs, supplier comparison and dependency analysis.",
        opportunityScore: 68,
        demandReason: "China is more useful for sourcing and import-risk analysis than simple exporter buyer discovery in this MVP.",
        buyerType: "Sourcing offices, industrial importers, category traders and supplier comparison teams.",
        riskLevel: "Medium-high",
        complianceNotes: ["Clarify whether the workflow is export discovery or import sourcing.", "Validate supplier documentation and quality standards."],
    },
};

const getCountryProfile = (targetCountry = "") => {
    const slug = String(targetCountry)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    return countryProfiles[slug] || {
        label: targetCountry || "Selected market",
        marketPotential: "Needs focused validation before commercial outreach.",
        opportunityScore: 62,
        demandReason: "TradeAI can structure the opportunity, but live trade and buyer data should be validated before launch decisions.",
        buyerType: "Importers, distributors and category buyers relevant to the product.",
        riskLevel: "Medium",
        complianceNotes: ["Validate HS classification.", "Check country-specific documentation and buyer reliability."],
    };
};

const logNonProductionError = (message, error) => {
    if (process.env.NODE_ENV !== "production") {
        console.error(message, error.message);
    }
};

const getAuthenticatedUserId = (req) => req.user?._id || req.user?.id || req.user?.userId || null;

const isValidObjectId = (value) =>
    Boolean(value) && mongoose.Types.ObjectId.isValid(String(value));

const getReportData = (report = {}) => report.reportData || {};

const formatSavedReportText = (report = {}) => {
    const data = getReportData(report);
    if (data.reportTitle) {
        return [
            data.reportTitle,
            "",
            `Product: ${data.productName || report.productName || "Not provided"}`,
            `Country: ${data.country || report.targetCountry || "Not provided"}`,
            `Direction: ${toTitleCase(data.direction || report.businessType || "")}`,
            `HS Code / Category: ${data.hsCodeOrCategory || report.hsCode || "Not provided"}`,
            `Generated Date: ${data.createdAt ? new Date(data.createdAt).toISOString().slice(0, 10) : new Date(report.createdAt || Date.now()).toISOString().slice(0, 10)}`,
            `Source Type: ${data.sourceType || "rule-engine"}`,
            "",
            "Opportunity / Process Summary",
            data.opportunitySummary || "Not provided.",
            "",
            "Checklist",
            normalizeList(data.checklist).map((item) => `- ${item}`).join("\n"),
            "",
            "Documents",
            normalizeList(data.documents).map((item) => `- ${item}`).join("\n"),
            "",
            "Compliance Notes",
            normalizeList(data.complianceNotes).map((item) => `- ${item}`).join("\n"),
            "",
            `Payment Risk: ${data.paymentRisk || "Not provided."}`,
            `Incoterms Guidance: ${data.incotermsGuidance || "Not provided."}`,
            `Logistics Notes: ${data.logisticsNotes || "Not provided."}`,
            `Risk Level: ${data.riskLevel || "Medium"}`,
            "",
            "Customs Clearance Steps",
            normalizeList(data.customsSteps).map((item) => `- ${item}`).join("\n"),
            "",
            "Recommendations",
            normalizeList(data.recommendations).map((item) => `- ${item}`).join("\n"),
            "",
            `Disclaimer: ${data.disclaimer || TRADE_READINESS_DISCLAIMER}`,
        ].join("\n");
    }

    const actions = Array.isArray(data.suggestedNextActions) ? data.suggestedNextActions : [];
    const generatedDate = report.createdAt
        ? new Date(report.createdAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
    const sourceLabel = data.providerLabel || data.dataSourceLabel || "Demo intelligence - sample data - coverage expanding";
    const complianceNotes = Array.isArray(data.complianceNotes)
        ? data.complianceNotes.join("; ")
        : String(data.complianceNotes || "Validate HS code, destination documentation and buyer requirements.");

    return [
        "TradeAI Export Opportunity Report",
        "",
        `Product: ${report.productName || data.productName || "Not provided"}`,
        `HS Code: ${report.hsCode || data.hsCode || "Not provided"}`,
        `Source Country: ${report.originCountry || data.sourceCountry || "India"}`,
        `Target Country: ${report.targetCountry || data.targetCountry || "Not provided"}`,
        `Generated Date: ${generatedDate}`,
        `Data Label: ${sourceLabel}`,
        report.isDemo ? "Important: Demo intelligence, sample data, coverage expanding. Not live verified trade data." : null,
        "",
        `Opportunity Score: ${Number.isFinite(Number(data.opportunityScore)) ? `${data.opportunityScore}/100` : "Not scored"}`,
        "",
        "Demand Summary",
        data.demandReason || data.marketPotential || "Demand summary unavailable.",
        "",
        "Buyer / Distributor Guidance",
        data.buyerType || "Importer, distributor and category buyer guidance unavailable.",
        "",
        "Compliance Notes",
        complianceNotes,
        "",
        "Suggested Next Actions",
        actions.length ? actions.map((item) => `- ${item}`).join("\n") : "- Validate buyer, documents and landed cost before action.",
    ]
        .filter((line) => line !== null)
        .join("\n");
};

const saveGeneratedReportForUser = async ({ userId, organizationId, requestBody, report, providerLabel }) => {
    if (!isValidObjectId(userId)) {
        return null;
    }

    try {
        return await Report.create({
            userId,
            organizationId: isValidObjectId(organizationId) ? organizationId : undefined,
            productName: String(requestBody.productName || requestBody.product || "").trim(),
            hsCode: String(requestBody.hsCode || "").trim(),
            targetCountry: String(requestBody.targetCountry || requestBody.country || "").trim(),
            originCountry: String(requestBody.originCountry || requestBody.sourceCountry || "India").trim(),
            businessType: String(requestBody.businessType || "").trim(),
            reportData: {
                ...report,
                providerLabel,
                sourceCountry: String(requestBody.originCountry || requestBody.sourceCountry || "India").trim(),
                targetCountry: String(requestBody.targetCountry || requestBody.country || "").trim(),
                productName: String(requestBody.productName || requestBody.product || "").trim(),
                hsCode: String(requestBody.hsCode || "").trim(),
            },
            isDemo: Boolean(report.isDemo),
        });
    } catch (error) {
        logNonProductionError("Generated report save failed:", error);
        return null;
    }
};

const enforceSavedReportLimit = async (req, userId) => {
    if (req.user?.role === "admin" || !isValidObjectId(userId)) {
        return;
    }

    const subscription = await Subscription.findOne({ organizationId: req.user.organizationId }).lean();
    const plan = normalizePlanName(subscription?.plan || "free");
    const limit = getPlanLimits(plan).savedReports;

    if (limit === -1) {
        return;
    }

    const used = await Report.countDocuments({ userId });

    if (used < limit) {
        return;
    }

    const error = new Error(`${getPlanLimits(plan).name} saved report limit reached. Delete an old report or upgrade required.`);
    error.status = 429;
    error.code = "SAVED_REPORT_LIMIT_REACHED";
    error.plan = plan;
    error.feature = "savedReports";
    error.limit = limit;
    error.used = used;
    throw error;
};

const normalizeGeneratedReport = (value = {}) => ({
    opportunityScore: Number.isFinite(Number(value.opportunityScore))
        ? Math.max(0, Math.min(100, Number(value.opportunityScore)))
        : 65,
    marketPotential: String(value.marketPotential || "Market potential requires additional validation.").trim(),
    demandReason: String(value.demandReason || "Demand should be validated with current buyer and trade data.").trim(),
    buyerType: String(value.buyerType || "Importers, distributors and category buyers.").trim(),
    riskLevel: String(value.riskLevel || "Medium").trim(),
    complianceNotes: Array.isArray(value.complianceNotes)
        ? value.complianceNotes.map((item) => String(item).trim()).filter(Boolean).join(" ")
        : String(value.complianceNotes || "Validate HS code, destination documentation and buyer requirements.").trim(),
    suggestedNextActions: Array.isArray(value.suggestedNextActions)
        ? value.suggestedNextActions.map((item) => String(item).trim()).filter(Boolean)
        : [],
    dataSourceLabel: String(value.dataSourceLabel || "TradeAI generated report preview.").trim(),
    isDemo: Boolean(value.isDemo),
});

const TRADE_READINESS_DISCLAIMER =
    "TradeAI provides directional trade guidance, not legal, customs, tax or financial advice. Verify final HS code with a CHA/customs expert and verify duty, tariff, compliance and payment decisions with official authorities or qualified professionals.";

const normalizeDirection = (value = "") => {
    const normalized = String(value || "").toLowerCase();

    return normalized.includes("import") ? "import_into_india" : "export_from_india";
};

const toTitleCase = (value = "") =>
    String(value || "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (character) => character.toUpperCase());

const normalizeTradeReadinessReport = (value = {}, fallback = {}) => {
    const productName = String(value.productName || fallback.productName || "Selected product").trim();
    const country = String(value.country || fallback.country || "Selected country").trim();
    const direction = normalizeDirection(value.direction || fallback.direction);
    const hsCodeOrCategory = String(value.hsCodeOrCategory || fallback.hsCodeOrCategory || "Category guidance required").trim();
    const sourceType = String(value.sourceType || fallback.sourceType || "rule-engine").trim();

    return {
        reportTitle: String(value.reportTitle || `${productName} Trade Readiness Report: ${toTitleCase(direction)} ${country ? `- ${country}` : ""}`).trim(),
        productName,
        country,
        direction,
        hsCodeOrCategory,
        opportunitySummary: String(value.opportunitySummary || "This product-country workflow needs HS code validation, document readiness, landed-cost checks and buyer/supplier verification before commercial action.").trim(),
        checklist: normalizeList(value.checklist).length
            ? normalizeList(value.checklist)
            : [
                  "Confirm exact product specification and intended use.",
                  "Validate HS code/category before pricing or shipment.",
                  "Check buyer/supplier credibility and documentation readiness.",
                  "Estimate landed cost, duty, freight and payment risk before commitment.",
              ],
        documents: normalizeList(value.documents).length
            ? normalizeList(value.documents)
            : [
                  "Commercial invoice",
                  "Packing list",
                  "Certificate of origin",
                  "IEC/GST and product specification sheet",
                  "Bill of lading or airway bill",
              ],
        complianceNotes: normalizeList(value.complianceNotes).length
            ? normalizeList(value.complianceNotes)
            : [
                  "Verify final HS code and documentation with a CHA/customs expert.",
                  "Verify destination or India import compliance with official authorities.",
                  "Duty/tariff estimate is not official in this preview unless an official API source is connected.",
              ],
        paymentRisk: String(value.paymentRisk || "For new counterparties, prefer advance payment, letter of credit, escrow or low-risk staged terms. Avoid open-account terms until trust is established.").trim(),
        incotermsGuidance: String(value.incotermsGuidance || (direction === "import_into_india"
            ? "For imports into India, compare FOB/CFR/CIF carefully and calculate landed cost before confirming supplier terms."
            : "For exports from India, use FOB for controlled first shipments or CIF/CFR only after freight and insurance costs are validated.")).trim(),
        logisticsNotes: String(value.logisticsNotes || "Confirm port/airport route, packaging, transit time, insurance, temperature/shelf-life needs and last-mile handling before quoting.").trim(),
        customsSteps: normalizeList(value.customsSteps).length
            ? normalizeList(value.customsSteps)
            : [
                  "Confirm HS code and duty/tariff treatment.",
                  "Prepare invoice, packing list and origin/supporting certificates.",
                  "Coordinate with CHA/freight forwarder before shipment booking.",
                  "Verify restricted/prohibited goods, labelling and inspection requirements.",
              ],
        riskLevel: String(value.riskLevel || "Medium").trim(),
        recommendations: normalizeList(value.recommendations).length
            ? normalizeList(value.recommendations)
            : [
                  "Validate HS code and duty with official sources.",
                  "Prepare a buyer/supplier-ready product sheet.",
                  "Ask Trade Copilot to explain this report before outreach.",
                  "Save/download the report after login; upgrade when limits are reached.",
              ],
        sourceType,
        disclaimer: String(value.disclaimer || TRADE_READINESS_DISCLAIMER).trim(),
        createdAt: value.createdAt || new Date().toISOString(),
    };
};

const buildRuleBasedTradeReadinessReport = (payload = {}) => {
    const productName = String(payload.productName || payload.product || "").trim();
    const country = String(payload.country || payload.targetCountry || "").trim();
    const direction = normalizeDirection(payload.direction);
    const hsCodeOrCategory = String(payload.hsCode || payload.hsCodeOrCategory || "HS category to verify").trim();
    const experienceLevel = String(payload.experienceLevel || "beginner").toLowerCase();
    const isImport = direction === "import_into_india";
    const beginnerNote = experienceLevel.includes("beginner")
        ? "Start with a simple checklist and verify each step with a CHA/freight forwarder before quoting."
        : "Use this as an operating checklist and validate assumptions before commercial commitment.";

    return normalizeTradeReadinessReport(
        {
            reportTitle: `${productName || "Product"} Trade Readiness Report`,
            productName,
            country,
            direction,
            hsCodeOrCategory,
            opportunitySummary: isImport
                ? `${productName || "This product"} import into India from ${country || "the selected country"} should start with supplier verification, HS classification, landed-cost calculation, import documentation and customs clearance planning. ${beginnerNote}`
                : `${productName || "This product"} export from India to ${country || "the selected country"} should start with product-country fit, HS classification, document readiness, buyer verification, payment protection and logistics planning. ${beginnerNote}`,
            checklist: [
                "Confirm exact product/category and intended use.",
                "Validate HS code/category before duty or compliance assumptions.",
                isImport ? "Verify overseas supplier, quality documents and India import requirements." : "Verify buyer, destination compliance and product labelling requirements.",
                "Estimate freight, insurance, duty/tariff and local handling costs.",
                "Choose safer payment and Incoterms before issuing PI/PO.",
            ],
            documents: isImport
                ? [
                      "Proforma invoice",
                      "Commercial invoice",
                      "Packing list",
                      "Bill of lading or airway bill",
                      "Certificate of origin",
                      "Import license or product certificate where applicable",
                  ]
                : [
                      "Commercial invoice",
                      "Packing list",
                      "Certificate of origin",
                      "IEC/GST documents",
                      "Bill of lading or airway bill",
                      "Product certificate, health certificate or inspection document where applicable",
                  ],
            complianceNotes: [
                `Verify ${hsCodeOrCategory} classification with a CHA/customs expert.`,
                isImport
                    ? "Verify India import restrictions, standards, BIS/FSSAI/other product rules where applicable."
                    : `Verify ${country || "destination"} labelling, certification, customs and buyer-specific compliance requirements.`,
                "Duty/tariff warning: exact rate is not shown unless official API data is connected; verify with official authority.",
            ],
            paymentRisk: isImport
                ? "For a new supplier, avoid full advance without inspection. Prefer sample order, escrow, LC, inspection-linked milestone or limited advance with balance against documents."
                : "For a new buyer, avoid open-account terms. Prefer advance, LC at sight, escrow or partial advance with balance before document release.",
            incotermsGuidance: isImport
                ? "Compare FOB, CFR and CIF. FOB gives more freight control; CIF/CFR can be convenient but must be checked against landed-cost and insurance quality."
                : "FOB India port is usually simpler for first-time exporters. CIF/CFR can be offered after freight, insurance and destination responsibility are clearly priced.",
            logisticsNotes: isImport
                ? "Check supplier pickup point, origin port, transit time, Indian port clearance, demurrage risk, insurance and inland delivery."
                : "Check Indian port/airport route, packaging, shelf-life or handling needs, freight quote validity, insurance and destination delivery responsibility.",
            customsSteps: [
                "Confirm HS code and product restrictions.",
                "Prepare invoice, packing list and origin/supporting documents.",
                "Share documents with CHA/freight forwarder before shipment.",
                "Verify duty/tariff, inspection, labelling and certificate requirements.",
                "Track shipment and keep proof of payment, transport and customs records.",
            ],
            riskLevel: experienceLevel.includes("beginner") ? "Medium-high" : "Medium",
            recommendations: [
                "Ask Copilot to explain this report in plain language.",
                "Verify HS code, duty and compliance with official sources.",
                "Prepare a one-page product sheet and document folder.",
                "Save/download this report after login; upgrade later for deeper exports and history.",
            ],
            sourceType: "rule-engine",
            disclaimer: TRADE_READINESS_DISCLAIMER,
        },
        { productName, country, direction, hsCodeOrCategory, sourceType: "rule-engine" },
    );
};

const generateTradeReadinessWithOpenAI = async (payload) => {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You are TradeAI, a practical import-export readiness assistant for Indian SMEs. Return only valid JSON with exactly these keys: reportTitle, productName, country, direction, hsCodeOrCategory, opportunitySummary, checklist, documents, complianceNotes, paymentRisk, incotermsGuidance, logisticsNotes, customsSteps, riskLevel, recommendations, sourceType, disclaimer. Arrays must be arrays of short strings. Do not claim official duty, tariff or legal accuracy. Include clear verification disclaimers.",
            },
            {
                role: "user",
                content: JSON.stringify({
                    productName: payload.productName || payload.product,
                    country: payload.country || payload.targetCountry,
                    direction: normalizeDirection(payload.direction),
                    hsCodeOrCategory: payload.hsCode || payload.hsCodeOrCategory,
                    experienceLevel: payload.experienceLevel,
                }),
            },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1000,
    });

    return normalizeTradeReadinessReport(
        {
            ...JSON.parse(completion.choices[0]?.message?.content || "{}"),
            sourceType: "AI",
            createdAt: new Date().toISOString(),
        },
        {
            productName: payload.productName || payload.product,
            country: payload.country || payload.targetCountry,
            direction: payload.direction,
            hsCodeOrCategory: payload.hsCode || payload.hsCodeOrCategory,
            sourceType: "AI",
        },
    );
};

const buildRuleBasedGeneratedReport = ({ productName, product, hsCode, targetCountry, country, businessType, certifications }) => {
    const normalizedTarget = String(targetCountry || country || "").trim();
    const normalizedBusinessType = String(businessType || "").trim();
    const normalizedProduct = String(productName || product || "selected product").trim();
    const intelligence = buildOpportunityIntelligence({
        productName: normalizedProduct,
        hsCode,
        targetCountry: normalizedTarget,
        businessType: normalizedBusinessType,
        certifications,
    });
    const type = normalizedBusinessType.toLowerCase();
    const isImporter = type.includes("importer");
    const isConsultant = type.includes("consultant");

    return {
        ...intelligence,
        opportunityScore: intelligence.opportunityScore,
        marketPotential: `${intelligence.marketPotential} This preview is tailored for ${normalizedBusinessType || "SME"} evaluation.`,
        demandReason: intelligence.demandReason,
        buyerType: isImporter
            ? "Supplier comparison, sourcing agents and verified manufacturers should be prioritized."
            : isConsultant
                ? "Importer, distributor and category-buyer segments are suitable for client opportunity validation."
                : intelligence.buyerType,
        complianceNotes: [
            ...intelligence.complianceNotes,
            "Validate product standards and destination documentation before commercial action.",
        ].join(" "),
        dataSourceLabel: intelligence.dataSourceLabel,
        isDemo: true,
    };
};

const generateWithOpenAI = async (payload) => {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You are TradeAI, an export-import intelligence assistant for Indian SME exporters. Generate only valid JSON with these keys: opportunityScore, marketPotential, demandReason, buyerType, riskLevel, complianceNotes, suggestedNextActions, dataSourceLabel, isDemo. suggestedNextActions must be an array. Keep guidance practical and clearly non-legal.",
            },
            {
                role: "user",
                content: JSON.stringify({
                    productName: payload.productName || payload.product,
                    hsCode: payload.hsCode,
                    originCountry: payload.originCountry || "India",
                    targetCountry: payload.targetCountry || payload.country,
                    businessType: payload.businessType,
                    monthlyCapacity: payload.monthlyCapacity,
                    priceRange: payload.priceRange,
                    certifications: payload.certifications,
                    objective: payload.objective || payload.reportObjective,
                }),
            },
        ],
        response_format: { type: "json_object" },
        temperature: 0.25,
        max_tokens: 800,
    });

    return normalizeGeneratedReport({
        ...JSON.parse(completion.choices[0]?.message?.content || "{}"),
        dataSourceLabel: "AI-Generated",
        isDemo: false,
    });
};

const buildOpportunityReport = ({
    productName,
    hsCode,
    originCountry = "India",
    targetCountry,
    businessType,
    monthlyCapacity,
    priceRange,
    certifications,
}) => {
    const certList = normalizeList(certifications);
    const structuredReport = buildOpportunityIntelligence({
        productName,
        hsCode,
        targetCountry,
        businessType,
        certifications,
    });
    const profile = {
        label: structuredReport.targetCountry,
    };
    const hasCertifications = certList.length > 0;
    const capacityNote = monthlyCapacity
        ? `Declared monthly capacity: ${monthlyCapacity}.`
        : "Monthly capacity not supplied; buyer matching will be more accurate after capacity is added.";
    const priceNote = priceRange
        ? `Indicative price range: ${priceRange}.`
        : "Price range not supplied; landed-cost validation is still required.";

    structuredReport.complianceNotes = [
        ...structuredReport.complianceNotes,
        hasCertifications
            ? `Available certifications noted: ${certList.join(", ")}.`
            : "Add available certifications such as FSSAI, organic, ISO, halal or phytosanitary documents if applicable.",
    ];

    const answer = [
        `${productName || "Selected product"} export opportunity report`,
        "",
        `Corridor: ${originCountry} to ${profile.label}`,
        `Business type: ${businessType || "Not specified"}`,
        capacityNote,
        priceNote,
        "",
        `Market potential: ${structuredReport.marketPotential}`,
        `Opportunity score: ${structuredReport.opportunityScore}/100`,
        `Demand reason: ${structuredReport.demandReason}`,
        `Likely buyer type: ${structuredReport.buyerType}`,
        `Risk level: ${structuredReport.riskLevel}`,
        "",
        `Compliance notes:\n${structuredReport.complianceNotes.map((item) => `- ${item}`).join("\n")}`,
        "",
        `Suggested next actions:\n${structuredReport.suggestedNextActions.map((item) => `- ${item}`).join("\n")}`,
        "",
        `Data source: ${structuredReport.dataSourceLabel}`,
    ].join("\n");

    return { answer, structuredReport, profile };
};

const createAiReport = async (req, res, next) => {
    try {
        await consumeUsageLimit(req, "reports");

        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId });

        if ((subscription?.aiCredits ?? 10) <= 0) {
            res.status(402);
            throw new Error("AI credits exhausted. Upgrade your plan to generate more reports.");
        }

        const reportPrompt = buildReportPrompt(req.body);
        const response = await answerTradeQuestion({
            prompt: reportPrompt,
            context: {
                user: {
                    role: req.user.role,
                    company: req.user.company,
                },
                reportType: req.body.reportType || "custom",
            },
        });

        const report = await AiReport.create({
            organizationId: req.user.organizationId,
            createdBy: req.user._id,
            title: req.body.title || `${req.body.product || req.body.hsCode || "Trade"} intelligence report`,
            reportType: req.body.reportType || "custom",
            prompt: req.body.prompt || reportPrompt,
            product: req.body.product || "",
            hsCode: req.body.hsCode || "",
            targetCountry: req.body.targetCountry || "",
            answer: response.answer,
            suggestedActions: response.suggestedActions || [],
            provider: response.provider,
        });

        await Subscription.findOneAndUpdate(
            { organizationId: req.user.organizationId },
            { $inc: { aiCredits: -1 } },
        );

        res.status(201).json({ report });
    } catch (error) {
        next(error);
    }
};

const createOpportunityReport = async (req, res, next) => {
    try {
        const {
            productName,
            product,
            hsCode = "",
            originCountry = "India",
            targetCountry,
            businessType = "",
            monthlyCapacity = "",
            priceRange = "",
            certifications = "",
        } = req.body;
        const normalizedProduct = String(productName || product || "").trim();
        const normalizedTargetCountry = String(targetCountry || "").trim();

        if (!normalizedProduct || !normalizedTargetCountry) {
            res.status(400);
            throw new Error("Product name and target country are required.");
        }

        await consumeUsageLimit(req, "reports");

        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId });

        if ((subscription?.aiCredits ?? 10) <= 0) {
            res.status(402);
            throw new Error("AI credits exhausted. Upgrade your plan to generate more reports.");
        }

        const { answer, structuredReport, profile } = buildOpportunityReport({
            productName: normalizedProduct,
            hsCode,
            originCountry,
            targetCountry: normalizedTargetCountry,
            businessType,
            monthlyCapacity,
            priceRange,
            certifications,
        });

        const report = await AiReport.create({
            organizationId: req.user.organizationId,
            createdBy: req.user._id,
            title: `${normalizedProduct} export opportunity: ${originCountry || "India"} to ${profile.label}`,
            reportType: "export_opportunity",
            prompt: `Generate export opportunity report for ${normalizedProduct} from ${originCountry || "India"} to ${profile.label}.`,
            product: normalizedProduct,
            hsCode,
            originCountry,
            targetCountry: profile.label,
            businessType,
            monthlyCapacity,
            priceRange,
            certifications: normalizeList(certifications),
            answer,
            structuredReport,
            suggestedActions: structuredReport.suggestedNextActions,
            provider: "tradeai-rule-engine",
            status: "generated",
        });

        await Subscription.findOneAndUpdate(
            { organizationId: req.user.organizationId },
            { $inc: { aiCredits: -1 } },
        );

        res.status(201).json({ report });
    } catch (error) {
        next(error);
    }
};

const generateSampleReport = async (req, res, next) => {
    try {
        const productName = String(req.body.productName || req.body.product || "").trim();
        const targetCountry = String(req.body.targetCountry || req.body.country || "").trim();
        const businessType = String(req.body.businessType || "").trim();

        if (!productName || !targetCountry || !businessType) {
            res.status(400);
            throw new Error("Product, target country and business type are required.");
        }

        const authContext = {
            userId: getAuthenticatedUserId(req),
            organizationId: req.user?.organizationId,
        };

        await enforceSavedReportLimit(req, authContext.userId);
        await consumeUsageLimit(req, "reports");

        let report;
        let providerLabel = "Rule Engine Preview";

        try {
            const aiReport = await generateWithOpenAI(req.body);

            if (aiReport) {
                report = aiReport;
                providerLabel = "AI-Generated";
            }
        } catch (error) {
            logNonProductionError("Report OpenAI generation failed:", error);
        }

        if (!report) {
            report = buildRuleBasedGeneratedReport(req.body);
        }

        report = normalizeGeneratedReport({
            ...report,
            dataSourceLabel: providerLabel,
            isDemo: providerLabel !== "AI-Generated",
        });

        const savedReport = await saveGeneratedReportForUser({
            userId: authContext.userId,
            organizationId: authContext.organizationId,
            requestBody: {
                ...req.body,
                productName,
                targetCountry,
                businessType,
            },
            report,
            providerLabel,
        });

        res.status(201).json({
            ...report,
            providerLabel,
            savedReportId: savedReport?._id || null,
            saved: Boolean(savedReport),
        });
    } catch (error) {
        next(error);
    }
};

const createTradeReadinessReport = async (req, res, next) => {
    try {
        const productName = String(req.body.productName || req.body.product || "").trim();
        const country = String(req.body.targetCountry || req.body.country || "").trim();
        const direction = normalizeDirection(req.body.direction);
        const hsCodeOrCategory = String(req.body.hsCode || req.body.hsCodeOrCategory || "").trim();
        const experienceLevel = String(req.body.experienceLevel || "beginner").trim();
        const userId = getAuthenticatedUserId(req);
        const isAuthenticated = isValidObjectId(userId);

        if (!productName || !country) {
            res.status(400);
            throw new Error("Product/category and country are required.");
        }

        if (isAuthenticated) {
            await enforceSavedReportLimit(req, userId);
            await consumeUsageLimit(req, "reports");
        }

        let report = null;

        try {
            report = await generateTradeReadinessWithOpenAI({
                productName,
                country,
                direction,
                hsCodeOrCategory,
                experienceLevel,
            });
        } catch (error) {
            logNonProductionError("Trade readiness OpenAI generation failed:", error);
        }

        if (!report) {
            report = buildRuleBasedTradeReadinessReport({
                productName,
                country,
                direction,
                hsCodeOrCategory,
                experienceLevel,
            });
        }

        const savedReport = isAuthenticated
            ? await saveGeneratedReportForUser({
                  userId,
                  organizationId: req.user?.organizationId,
                  requestBody: {
                      productName,
                      targetCountry: country,
                      country,
                      originCountry: direction === "import_into_india" ? country : "India",
                      businessType: direction === "import_into_india" ? "Importer" : "Exporter",
                      hsCode: hsCodeOrCategory,
                  },
                  report,
                  providerLabel: report.sourceType,
              })
            : null;

        res.status(201).json({
            report,
            saved: Boolean(savedReport),
            savedReportId: savedReport?._id || null,
            access: isAuthenticated ? "authenticated" : "guest-preview",
            upgradePrompt: isAuthenticated
                ? "Upgrade later to unlock more reports, detailed PDF/Excel export, saved history and advanced comparison."
                : "Register to save/download this report. Upgrade later for detailed exports and more report history.",
        });
    } catch (error) {
        next(error);
    }
};

const getMyReports = async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!isValidObjectId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to view reports.",
            });
        }

        const reports = await Report.find({ userId })
            .select("_id productName hsCode originCountry targetCountry createdAt isDemo reportData")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return res.status(200).json({
            success: true,
            reports,
        });
    } catch (error) {
        next(error);
    }
};

const getMyReportById = async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!isValidObjectId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to view reports.",
            });
        }

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report id.",
            });
        }

        const report = await Report.findOne({
            _id: req.params.id,
            userId,
        }).lean();

        if (!report) {
            res.status(404);
            throw new Error("Report not found");
        }

        res.json(report);
    } catch (error) {
        next(error);
    }
};

const deleteMyReportById = async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!isValidObjectId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to delete reports.",
            });
        }

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report id.",
            });
        }

        const deleted = await Report.findOneAndDelete({
            _id: req.params.id,
            userId,
        }).lean();

        if (!deleted) {
            res.status(404);
            throw new Error("Report not found");
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

const exportMyReportById = async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!isValidObjectId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to download reports.",
            });
        }

        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report id.",
            });
        }

        const report = await Report.findOne({
            _id: req.params.id,
            userId,
        }).lean();

        if (!report) {
            res.status(404);
            throw new Error("Report not found");
        }

        const filenameBase = `${report.productName || "tradeai-report"}-${report.targetCountry || "market"}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 80) || "tradeai-report";

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filenameBase}.txt"`);
        res.send(formatSavedReportText(report));
    } catch (error) {
        next(error);
    }
};

const getAiReports = async (req, res, next) => {
    try {
        const reports = await AiReport.find({ organizationId: req.user.organizationId })
            .select("-answer")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ reports });
    } catch (error) {
        next(error);
    }
};

const getAiReportById = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report id.",
            });
        }

        const report = await AiReport.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
        }).lean();

        if (!report) {
            res.status(404);
            throw new Error("AI report not found");
        }

        res.json(report);
    } catch (error) {
        next(error);
    }
};

const deleteAiReportById = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report id.",
            });
        }

        const report = await AiReport.findOneAndDelete({
            _id: req.params.id,
            organizationId: req.user.organizationId,
        }).lean();

        if (!report) {
            res.status(404);
            throw new Error("AI report not found");
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

const exportAiReport = async (req, res, next) => {
    try {
        const report = await AiReport.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
        }).lean();

        if (!report) {
            res.status(404);
            throw new Error("AI report not found");
        }

        const format = req.query.format === "csv" ? "csv" : "txt";

        if (format === "csv") {
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="${report._id}.csv"`);
            res.send(`title,type,product,hsCode,targetCountry,answer\n"${report.title}","${report.reportType}","${report.product}","${report.hsCode}","${report.targetCountry}","${report.answer.replace(/"/g, '""')}"`);
            return;
        }

        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="${report._id}.txt"`);
        res.send(`${report.title}\n\n${report.answer}\n\nActions:\n${report.suggestedActions.map((item) => `- ${item}`).join("\n")}`);
    } catch (error) {
        next(error);
    }
};

export {
    createAiReport,
    createOpportunityReport,
    createTradeReadinessReport,
    deleteAiReportById,
    deleteMyReportById,
    exportAiReport,
    exportMyReportById,
    generateSampleReport,
    getAiReportById,
    getAiReports,
    getMyReportById,
    getMyReports,
};
