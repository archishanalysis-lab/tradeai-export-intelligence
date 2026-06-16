import express from "express";
import mongoose from "mongoose";
import OpenAI from "openai";

import CopilotMessage from "../models/CopilotMessage.js";
import Report from "../models/Report.js";
import { protect } from "../middleware/authMiddleware.js";
import { apiRateLimit } from "../middleware/securityMiddleware.js";
import { buildCopilotIntelligence } from "../services/tradeIntelligenceService.js";
import { consumeUsageLimit } from "../services/usageLimitService.js";

const router = express.Router();
const copilotAskLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
});

const SYSTEM_PROMPT = `You are TradeAI Copilot, an export-import intelligence assistant
for Indian SME exporters. Answer only about trade corridors:
India to East Africa (Kenya, Tanzania, Uganda, Rwanda),
India to Gulf (UAE, Saudi Arabia, Oman, Qatar), India-China sourcing.
Always respond in this exact JSON structure:
{ marketOpportunity, buyerType, riskLevel, documentsNeeded[],
nextActions[], disclaimer }`;

const OPENAI_PROVIDER_LABEL = "Powered by OpenAI";
const FALLBACK_PROVIDER_LABEL = "TradeAI Rule Engine (local preview)";

function logNonProductionError(message, error) {
    if (process.env.NODE_ENV !== "production") {
        console.error(message, error.message);
    }
}

function normalizeQuestion(question) {
    return String(question || "").trim();
}

function getAuthenticatedUserId(req) {
    return req.user?._id || req.user?.id || req.user?.userId || null;
}

function isValidObjectId(value) {
    return Boolean(value) && mongoose.Types.ObjectId.isValid(String(value));
}

function normalizeCopilotResponse(value = {}) {
    return {
        providerLabel: String(value.providerLabel || value.provider || FALLBACK_PROVIDER_LABEL),
        marketOpportunity: String(value.marketOpportunity || value.answer || ""),
        buyerType: String(value.buyerType || ""),
        riskLevel: String(value.riskLevel || ""),
        documentsNeeded: Array.isArray(value.documentsNeeded) ? value.documentsNeeded.map(String) : [],
        nextActions: Array.isArray(value.nextActions)
            ? value.nextActions.map(String)
            : Array.isArray(value.suggestedActions)
                ? value.suggestedActions.map(String)
                : [],
        disclaimer: String(value.disclaimer || ""),
    };
}

function validateQuestion(req, res) {
    const question = normalizeQuestion(req.body?.question || req.body?.prompt);

    if (!question) {
        res.status(400).json({ message: "Question is required." });
        return "";
    }

    if (question.length > 2000) {
        res.status(400).json({ message: "Question must be 2000 characters or fewer." });
        return "";
    }

    return question;
}

function hasAny(value, keywords) {
    const haystack = value.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
}

function wantsReportContext(question = "") {
    return hasAny(question, ["my report", "saved report", "latest report", "this report", "report i generated", "generated report"]);
}

async function getLatestSavedReportContext(userId, question) {
    if (!isValidObjectId(userId) || !wantsReportContext(question)) {
        return null;
    }

    return Report.findOne({ userId })
        .select("_id productName hsCode originCountry targetCountry reportData isDemo createdAt")
        .sort({ createdAt: -1 })
        .lean();
}

function buildFallback(question) {
    const cleanQuestion = normalizeQuestion(question);
    const lowerQuestion = cleanQuestion.toLowerCase();
    const isPharma = hasAny(lowerQuestion, ["pharma", "medicine", "drug", "medical"]);
    const isFood = hasAny(lowerQuestion, ["food", "spice", "turmeric", "rice", "tea", "snack", "grain"]);

    if (hasAny(lowerQuestion, ["kenya", "tanzania", "uganda", "rwanda"])) {
        return {
            providerLabel: FALLBACK_PROVIDER_LABEL,
            marketOpportunity:
                "East Africa can be a practical India export corridor for SME exporters, especially where distributors need reliable Indian supply, competitive pricing and consistent documentation.",
            buyerType:
                "Importers, regional distributors, wholesale buyers and category-focused trading companies serving Kenya, Tanzania, Uganda and Rwanda.",
            riskLevel:
                "Medium: validate importer credibility, local standards, shipment timelines and port-level landed costs before committing.",
            documentsNeeded: isPharma
                ? ["Commercial invoice", "Packing list", "Certificate of origin", "Pharma registration documents", "Product specification sheet"]
                : isFood
                    ? ["Commercial invoice", "Packing list", "Certificate of origin", "Health or phytosanitary certificate", "Product specification sheet"]
                    : ["Commercial invoice", "Packing list", "Certificate of origin", "HS code confirmation", "Buyer purchase order"],
            nextActions: [
                "Shortlist two East Africa countries for the product.",
                "Confirm HS code and destination compliance requirements.",
                "Prepare a buyer-ready product sheet with MOQ, specs and price range.",
            ],
            disclaimer:
                "This is rule-based preview guidance, not live AI or legal advice. Verify current regulations, buyer details and shipment costs before action.",
        };
    }

    if (hasAny(lowerQuestion, ["uae", "dubai", "saudi", "oman", "qatar"])) {
        return {
            providerLabel: FALLBACK_PROVIDER_LABEL,
            marketOpportunity:
                "The Gulf corridor can suit Indian exporters targeting premium retail, food service, industrial buyers and re-export channels through UAE and neighboring GCC markets.",
            buyerType:
                "Importers, distributors, supermarket suppliers, HORECA buyers, re-export traders and category procurement teams.",
            riskLevel:
                "Medium-high: check labeling, conformity, certification and buyer payment terms before quoting.",
            documentsNeeded: [
                "Commercial invoice",
                "Packing list",
                "Certificate of origin",
                "SASO or ECAS documents where applicable",
                "Product specification and labeling documents",
            ],
            nextActions: [
                "Decide whether the target is direct GCC demand or UAE re-export.",
                "Check SASO, ECAS or destination-specific conformity requirements.",
                "Build a buyer list by importer type and product category.",
            ],
            disclaimer:
                "This is rule-based preview guidance, not live AI or legal advice. Confirm GCC documentation with current official and buyer requirements.",
        };
    }

    if (hasAny(lowerQuestion, ["china", "chinese", "sourcing", "supplier"])) {
        return {
            providerLabel: FALLBACK_PROVIDER_LABEL,
            marketOpportunity:
                "India-China sourcing intelligence should focus on supplier comparison, landed cost, quality checks, import dependency and alternative supplier risk.",
            buyerType:
                "Verified manufacturers, export agents, sourcing companies and category-specific suppliers suitable for comparison before import.",
            riskLevel:
                "High: verify supplier credentials, quality consistency, payment protection, duties and logistics before placing orders.",
            documentsNeeded: [
                "Proforma invoice",
                "Commercial invoice",
                "Packing list",
                "Bill of lading or airway bill",
                "Certificate of origin",
                "Product test or inspection report where applicable",
            ],
            nextActions: [
                "Compare at least three suppliers by price, MOQ, certification and delivery terms.",
                "Request samples or third-party inspection before bulk orders.",
                "Calculate landed cost including duty, freight, insurance and compliance.",
            ],
            disclaimer:
                "This is rule-based preview guidance, not live AI or legal advice. Independently verify suppliers and import requirements.",
        };
    }

    if (isPharma) {
        return {
            providerLabel: FALLBACK_PROVIDER_LABEL,
            marketOpportunity:
                "Indian pharma exporters should prioritize corridors where importer licensing, product registration and documentation readiness can be verified before outreach.",
            buyerType:
                "Licensed pharma importers, distributors, hospital procurement teams and institutional buyers.",
            riskLevel:
                "High: confirm product registration, buyer license, batch documentation and destination health authority requirements.",
            documentsNeeded: [
                "Commercial invoice",
                "Packing list",
                "Certificate of origin",
                "Certificate of analysis",
                "Product registration or health authority approval",
            ],
            nextActions: [
                "Select one destination country and verify the registration pathway.",
                "Prepare product dossier, COA and specification sheets.",
                "Validate importer license and payment terms before sampling or shipment.",
            ],
            disclaimer:
                "This is rule-based preview guidance, not live AI or legal advice. Pharma exports require current regulatory review.",
        };
    }

    if (isFood) {
        return {
            providerLabel: FALLBACK_PROVIDER_LABEL,
            marketOpportunity:
                "For Indian food products such as turmeric, spices and rice, the Gulf corridor, especially UAE, is a practical first screen because of distributor depth, retail demand and re-export channels.",
            buyerType:
                "Food importers, supermarket suppliers, HORECA distributors, wholesale traders and re-export buyers.",
            riskLevel:
                "Medium: verify labeling, shelf-life, buyer payment terms and destination conformity requirements.",
            documentsNeeded: [
                "Commercial invoice",
                "Packing list",
                "Certificate of origin",
                "Health or phytosanitary certificate",
                "Product specification and labeling documents",
            ],
            nextActions: [
                "Confirm HS code and destination labeling requirements.",
                "Prepare buyer-ready specs with MOQ, shelf life and packaging details.",
                "Shortlist UAE and GCC importers by product category.",
            ],
            disclaimer:
                "This is rule-based preview guidance, not live AI or legal advice. Verify current food documentation and buyer details before action.",
        };
    }

    return {
        providerLabel: FALLBACK_PROVIDER_LABEL,
        marketOpportunity:
            "Start by matching the product to one TradeAI corridor, then compare demand, buyer type, documentation and landed cost before outreach.",
        buyerType:
            "Importers, distributors, wholesalers, sourcing agents or category buyers depending on the selected product and destination country.",
        riskLevel:
            "Medium: the main risks are unclear HS code, missing documents, weak buyer validation and untested landed-cost assumptions.",
        documentsNeeded: [
            "Commercial invoice",
            "Packing list",
            "Certificate of origin",
            "HS code confirmation",
            "Product specification sheet",
        ],
        nextActions: [
            "Choose a target country from East Africa, Gulf or China sourcing.",
            "Confirm product category, HS code and buyer segment.",
            "Prepare a short export-readiness checklist before contacting buyers.",
        ],
        disclaimer:
            "This is rule-based preview guidance, not live AI or legal advice. Verify regulations, buyer credibility and trade data before action.",
    };
}

function coerceCopilotPayload(payload) {
    return {
        marketOpportunity: String(payload?.marketOpportunity || ""),
        buyerType: String(payload?.buyerType || ""),
        riskLevel: String(payload?.riskLevel || ""),
        documentsNeeded: Array.isArray(payload?.documentsNeeded) ? payload.documentsNeeded.map(String) : [],
        nextActions: Array.isArray(payload?.nextActions) ? payload.nextActions.map(String) : [],
        disclaimer: String(payload?.disclaimer || ""),
    };
}

async function askOpenAI(question, context = {}) {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: JSON.stringify({
                    question,
                    productName: context.productName || "",
                    targetCountry: context.targetCountry || context.country || "",
                    hsCode: context.hsCode || "",
                    savedReport: context.savedReport
                        ? {
                              productName: context.savedReport.productName,
                              hsCode: context.savedReport.hsCode,
                              targetCountry: context.savedReport.targetCountry,
                              reportData: context.savedReport.reportData,
                              isDemo: context.savedReport.isDemo,
                          }
                        : null,
                    instruction:
                        "Use the provided product, country, HS code and saved report context when present. If coverage is limited, say it is MVP/demo/sample intelligence and do not claim live verified data.",
                }),
            },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 700,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    return {
        providerLabel: OPENAI_PROVIDER_LABEL,
        ...coerceCopilotPayload(JSON.parse(content)),
    };
}

router.use(protect);

router.get("/history", async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!isValidObjectId(userId)) {
            res.status(401);
            throw new Error("Authentication required to view Copilot history.");
        }

        const messages = await CopilotMessage.find({ userId })
            .select("_id question response providerLabel createdAt updatedAt")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        res.json({ messages });
    } catch (error) {
        next(error);
    }
});

router.post("/history", async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);
        const question = validateQuestion(req, res);

        if (!question) return;

        if (!isValidObjectId(userId)) {
            res.status(401);
            throw new Error("Authentication required to save Copilot history.");
        }

        const response = normalizeCopilotResponse(req.body?.response || {});
        const message = await CopilotMessage.create({
            userId,
            organizationId: req.user?.organizationId || undefined,
            question,
            response,
            providerLabel: response.providerLabel,
        });

        res.status(201).json({ message });
    } catch (error) {
        next(error);
    }
});

router.delete("/history", async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!isValidObjectId(userId)) {
            res.status(401);
            throw new Error("Authentication required to clear Copilot history.");
        }

        await CopilotMessage.deleteMany({ userId });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete("/history/:id", async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!isValidObjectId(userId)) {
            res.status(401);
            throw new Error("Authentication required to delete Copilot history.");
        }

        if (!isValidObjectId(req.params.id)) {
            res.status(400);
            throw new Error("Invalid Copilot history id.");
        }

        const deleted = await CopilotMessage.findOneAndDelete({
            _id: req.params.id,
            userId,
        }).lean();

        if (!deleted) {
            res.status(404);
            throw new Error("Copilot history item not found.");
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.post("/ask", copilotAskLimiter, async (req, res, next) => {
    const question = validateQuestion(req, res);

    if (!question) {
        return;
    }

    const userId = getAuthenticatedUserId(req);

    if (!isValidObjectId(userId)) {
        res.status(401);
        next(new Error("Authentication required to use Copilot."));
        return;
    }

    try {
        await consumeUsageLimit(req, "copilot");
    } catch (error) {
        next(error);
        return;
    }

    let openAIResponse = null;
    const savedReport = await getLatestSavedReportContext(userId, question);
    const context = {
        productName: req.body?.productName || req.body?.product || "",
        targetCountry: req.body?.targetCountry || req.body?.country || "",
        hsCode: req.body?.hsCode || "",
        savedReport,
    };

    try {
        openAIResponse = await askOpenAI(question, context);
    } catch (error) {
        logNonProductionError("Copilot OpenAI provider failed:", error);
    }

    try {
        const response = normalizeCopilotResponse(openAIResponse || buildCopilotIntelligence({ question, ...context }));
        await CopilotMessage.create({
            userId,
            organizationId: req.user?.organizationId || undefined,
            question,
            response,
            providerLabel: response.providerLabel,
        });

        res.json(response);
    } catch (error) {
        next(error);
    }
});

export default router;
