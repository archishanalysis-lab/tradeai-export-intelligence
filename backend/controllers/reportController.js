import AiReport from "../models/AiReport.js";
import Subscription from "../models/Subscription.js";
import { answerTradeQuestion } from "../services/tradeCopilotService.js";

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
    const profile = getCountryProfile(targetCountry);
    const certList = normalizeList(certifications);
    const hasCertifications = certList.length > 0;
    const scoreAdjustment = hasCertifications ? 4 : 0;
    const capacityNote = monthlyCapacity
        ? `Declared monthly capacity: ${monthlyCapacity}.`
        : "Monthly capacity not supplied; buyer matching will be more accurate after capacity is added.";
    const priceNote = priceRange
        ? `Indicative price range: ${priceRange}.`
        : "Price range not supplied; landed-cost validation is still required.";

    const structuredReport = {
        marketPotential: profile.marketPotential,
        opportunityScore: Math.min(profile.opportunityScore + scoreAdjustment, 92),
        demandReason: profile.demandReason,
        buyerType: profile.buyerType,
        riskLevel: profile.riskLevel,
        complianceNotes: [
            ...profile.complianceNotes,
            hsCode ? `Use HS code ${hsCode} as a working classification and validate before quoting.` : "Add a working HS code before buyer outreach.",
            hasCertifications
                ? `Available certifications noted: ${certList.join(", ")}.`
                : "Add available certifications such as FSSAI, organic, ISO, halal or phytosanitary documents if applicable.",
        ],
        suggestedNextActions: [
            "Validate HS code and destination documentation before sending commercial quotes.",
            "Shortlist buyer segments before asking for introductions.",
            "Prepare product specification, packaging, MOQ, capacity and certification notes.",
            "Use TradeAI buyer discovery or admin review to qualify contacts before outreach.",
        ],
        dataSourceLabel: "TradeAI MVP rule-based report using seeded corridor intelligence and submitted exporter inputs. Not live verified trade data.",
    };

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

const getAiReports = async (req, res, next) => {
    try {
        const reports = await AiReport.find({ organizationId: req.user.organizationId })
            .select("-answer")
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ reports });
    } catch (error) {
        next(error);
    }
};

const getAiReportById = async (req, res, next) => {
    try {
        const report = await AiReport.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
        });

        if (!report) {
            res.status(404);
            throw new Error("AI report not found");
        }

        res.json(report);
    } catch (error) {
        next(error);
    }
};

const exportAiReport = async (req, res, next) => {
    try {
        const report = await AiReport.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
        });

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

export { createAiReport, createOpportunityReport, exportAiReport, getAiReportById, getAiReports };
