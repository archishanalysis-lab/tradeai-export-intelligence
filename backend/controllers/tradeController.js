import OpenAI from "openai";

import {
    communicationDisclaimer,
    communicationLastUpdated,
    communicationTemplateTypes,
    communicationTemplates,
} from "../data/communicationTemplates.js";
import { focusCountries, hsCodeExamples } from "../data/hsCodeExamples.js";
import {
    baseDocuments,
    customsDisclaimer,
    customsLastUpdated,
    customsProductCategories,
    customsWorkflows,
    productRiskWarnings,
} from "../data/customsClearanceGuide.js";
import { incotermsDisclaimer, incotermsGuide, incotermsLastUpdated } from "../data/incotermsGuide.js";
import {
    beginnerLogisticsEducation,
    logisticsCountries,
    logisticsDisclaimer,
    logisticsLastUpdated,
    logisticsRoutes,
} from "../data/logisticsGuide.js";
import {
    paymentTermsDisclaimer,
    paymentTermsGuide,
    paymentTermsLastUpdated,
    tradePaymentRedFlags,
} from "../data/paymentTermsGuide.js";
import {
    commonDisclaimer as tariffDisclaimer,
    tariffExamples,
    tariffFocusCountries,
    tariffProductCategories,
} from "../data/tariffExamples.js";
import { checkFeatureAccess, consumeUsageLimit } from "../services/usageLimitService.js";

const normalize = (value = "") => String(value || "").trim().toLowerCase();

const includesText = (value, query) => normalize(value).includes(query);

const fillTemplate = (template, values = {}) => {
    const fallbackValues = {
        productName: "the selected product",
        country: "the selected country",
        buyerOrSupplierName: "Team",
        quantity: "the requested quantity",
        incoterm: "the agreed Incoterm",
        paymentTerm: "the agreed payment term",
        shipmentMode: "the agreed shipment mode",
    };

    return String(template || "").replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || fallbackValues[key] || "");
};

const matchesSearch = (item, search) => {
    if (!search) return true;

    return [
        item.hsCode,
        item.productName,
        item.productCategory,
        item.description,
        item.commonUse,
        item.notes,
    ].some((value) => includesText(value, search));
};

const matchesCountry = (item, country) => {
    if (!country) return true;

    return item.commonCountries.some((name) => normalize(name) === country);
};

const matchesCategory = (item, category) => {
    if (!category) return true;

    return normalize(item.productCategory) === category;
};

const matchesExportImportType = (item, exportImportType) => {
    if (!exportImportType) return true;

    return item.exportImportType === exportImportType || item.exportImportType === "both";
};

const matchesRiskLevel = (item, riskLevel) => {
    if (!riskLevel) return true;

    return item.riskLevel === riskLevel;
};

const matchesCommunicationFilter = (item, filters) => {
    if (filters.templateType && item.templateType !== filters.templateType) return false;
    if (filters.userRole && !item.userRoles.includes(filters.userRole)) return false;
    if (filters.tone && !item.tones.includes(filters.tone)) return false;
    if (filters.country && !item.countries.some((country) => normalizeCountry(country) === filters.country)) return false;
    if (filters.productCategory && !item.productCategories.some((category) => normalize(category) === filters.productCategory)) return false;

    return true;
};

const getCommunicationTemplate = (templateType) =>
    communicationTemplates.find((template) => template.templateType === templateType) || communicationTemplates[0];

const generateFallbackCommunication = (payload = {}) => {
    const template = getCommunicationTemplate(payload.templateType);

    return {
        subject: fillTemplate(template.subject, payload),
        message: fillTemplate(template.body, payload),
        templateType: template.templateType,
        provider: "template-fallback",
        providerLabel: "TradeAI Template Fallback",
        isLiveAI: false,
    };
};

const generateOpenAICommunication = async (payload = {}) => {
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
                    "You write concise export-import business emails. Return only JSON with subject and message. Do not make legal, banking or compliance claims. Keep it practical and professional.",
            },
            {
                role: "user",
                content: JSON.stringify(payload),
            },
        ],
        response_format: { type: "json_object" },
        temperature: 0.25,
        max_tokens: 500,
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");

    return {
        subject: String(parsed.subject || ""),
        message: String(parsed.message || ""),
        templateType: payload.templateType,
        provider: "openai",
        providerLabel: "OpenAI customized message",
        isLiveAI: true,
    };
};

const normalizeCountry = (value = "") => {
    const country = normalize(value);

    if (country === "saudi") return "saudi arabia";

    return country;
};

const matchesTariffCountry = (item, country) => {
    if (!country) return true;

    return normalize(item.country) === country;
};

const matchesTariffHsCode = (item, hsCode) => {
    if (!hsCode) return true;

    const cleanHsCode = String(hsCode).replace(/\D/g, "");
    if (!cleanHsCode) return true;

    return item.hsCode.startsWith(cleanHsCode) || cleanHsCode.startsWith(item.hsCode.slice(0, 2));
};

const matchesTariffCategory = (item, productCategory) => {
    if (!productCategory) return true;

    const category = normalize(productCategory);

    return normalize(item.productCategory) === category || normalize(item.productName).includes(category);
};

const matchesTariffDirection = (item, direction) => {
    if (!direction) return true;

    const normalizedDirection = normalize(direction);
    if (normalizedDirection === "export") return normalize(item.direction).includes("export");
    if (normalizedDirection === "import") return normalize(item.direction).includes("import");

    return normalize(item.direction).includes(normalizedDirection);
};

const matchesShipmentMode = (item, shipmentMode) => {
    if (!shipmentMode || shipmentMode === "any") return true;

    return item.shipmentModes.includes(shipmentMode);
};

const matchesUserRole = (item, userRole) => {
    if (!userRole) return true;
    if (userRole === "exporter") return item.recommendedForExport;
    if (userRole === "importer") return item.recommendedForImport;

    return true;
};

const matchesExperienceLevel = (item, experienceLevel) => {
    if (!experienceLevel || experienceLevel === "advanced") return true;
    if (experienceLevel === "beginner") return item.beginnerFriendlyScore >= 5;
    if (experienceLevel === "intermediate") return item.beginnerFriendlyScore >= 4;

    return true;
};

const riskWeight = {
    low: 1,
    medium: 2,
    high: 3,
};

const matchesPaymentFilter = (values, filter) => {
    if (!filter) return true;

    return values.includes(filter);
};

const paymentTermScore = (item, filters) => {
    let score = 0;

    if (matchesPaymentFilter(item.userRoles, filters.userRole)) score += 2;
    if (matchesPaymentFilter(item.buyerTrustLevels, filters.buyerTrustLevel)) score += 2;
    if (matchesPaymentFilter(item.shipmentValues, filters.shipmentValue)) score += 2;
    if (matchesPaymentFilter(item.countryRisks, filters.countryRisk)) score += 2;
    if (item.recommendedForBeginner && filters.buyerTrustLevel === "new") score += 2;
    if (filters.shipmentValue === "high" && item.bankInvolvement === "high") score += 2;
    if (filters.countryRisk === "high" && item.exporterRisk === "low") score += 2;

    score -= riskWeight[item.exporterRisk] || 0;

    return score;
};

const derivePaymentRiskLevel = (item, filters) => {
    const countryRisk = riskWeight[filters.countryRisk] || 2;
    const shipmentRisk = riskWeight[filters.shipmentValue] || 2;
    const roleRisk = filters.userRole === "importer" ? riskWeight[item.importerRisk] : riskWeight[item.exporterRisk];
    const total = countryRisk + shipmentRisk + roleRisk;

    if (total >= 8) return "high";
    if (total >= 5) return "medium";

    return "low";
};

const buildPaymentNextSteps = (item, filters) => {
    const steps = [
        "Verify buyer/supplier company documents before confirming payment terms.",
        "Match beneficiary bank account name with the contracted company.",
        "Keep purchase order, proforma invoice, commercial invoice and payment proof together.",
    ];

    if (item.bankInvolvement === "high") {
        steps.push("Discuss charges, document format and timeline with your authorised dealer bank before shipment.");
    }

    if (filters.buyerTrustLevel === "new") {
        steps.push("Avoid open account for a new counterparty unless insured or backed by strong credit controls.");
    }

    return steps;
};

const normalizeDirection = (value = "") => {
    const direction = normalize(value);

    if (direction.includes("import")) return "import";
    if (direction.includes("export")) return "export";

    return direction;
};

const complexityLabel = (score) => {
    if (score >= 8) return "high";
    if (score >= 5) return "medium";

    return "low";
};

const buildCustomsWorkflow = (workflow, filters) => {
    const category = customsProductCategories.find((item) => normalize(item) === normalize(filters.productCategory)) || "General goods";
    let complexityScore = workflow.baseComplexity;

    if (filters.mode === "sea") complexityScore += 1;
    if (["Food/agri", "Pharma", "Chemicals", "Electronics"].includes(category)) complexityScore += 1;
    if (filters.riskLevel === "high") complexityScore += 2;
    if (filters.riskLevel === "low") complexityScore -= 1;

    const riskWarnings = [
        "Customs clearance should be handled with a licensed CHA/customs broker where required.",
        ...(productRiskWarnings[category] || productRiskWarnings["General goods"]),
    ];

    return {
        direction: workflow.direction,
        title: workflow.title,
        mode: filters.mode || "sea",
        productCategory: category,
        country: filters.country || "",
        requiredDocuments: baseDocuments[workflow.direction],
        estimatedComplexity: complexityLabel(complexityScore),
        complexityScore,
        riskWarnings,
        steps: workflow.steps,
    };
};

const matchesLogisticsCountry = (route, originCountry, destinationCountry) => {
    const origin = normalizeCountry(originCountry || "India");
    const destination = normalizeCountry(destinationCountry);

    if (origin && origin !== normalize(route.originCountry)) return false;
    if (destination && destination !== normalizeCountry(route.destinationCountry)) return false;

    return true;
};

const matchesLogisticsMode = (route, mode) => {
    if (!mode || mode === "any") return true;

    return route.shipmentModes.includes(mode);
};

const suggestedShipmentMode = (filters) => {
    if (filters.mode && filters.mode !== "any") return filters.mode;
    if (filters.shipmentSize === "sample") return "air or LCL";
    if (filters.shipmentSize === "bulk" || filters.shipmentSize === "FCL") return "sea FCL";
    if (filters.shipmentSize === "LCL") return "sea LCL";

    return "sea LCL or air depending on urgency and cargo value";
};

const buildLogisticsResult = (route, filters) => ({
    ...route,
    selectedMode: filters.mode || "any",
    shipmentSize: filters.shipmentSize || "",
    productCategory: filters.productCategory || "",
    suggestedShipmentMode: suggestedShipmentMode(filters),
    freightForwarderChaInvolvement:
        "Use a freight forwarder for booking/routing/documents and a CHA/customs broker for customs filing where required.",
    routeNotes: filters.mode === "air" ? route.airRouteNotes : filters.mode === "sea" ? route.seaRouteNotes : `${route.seaRouteNotes} ${route.airRouteNotes}`,
});

const getHsCodeDirectory = async (req, res) => {
    const search = normalize(req.query.search);
    const country = normalize(req.query.country);
    const category = normalize(req.query.category);
    const exportImportType = normalize(req.query.exportImportType);
    const riskLevel = normalize(req.query.riskLevel);
    const access = req.user
        ? await consumeUsageLimit(req, "hsCodeSearch").catch((error) => ({
            allowed: false,
            plan: error.plan || "free",
            feature: "hsCodeSearch",
            limit: error.limit,
            used: error.used,
            reason: error.code || "limit_reached",
            message: error.message,
        }))
        : await checkFeatureAccess(req, "hsCodeSearch");

    const items = hsCodeExamples.filter((item) =>
        matchesSearch(item, search) &&
        matchesCountry(item, country) &&
        matchesCategory(item, category) &&
        matchesExportImportType(item, exportImportType) &&
        matchesRiskLevel(item, riskLevel),
    );

    const categories = Array.from(
        new Set(hsCodeExamples.map((item) => item.productCategory)),
    ).sort();
    const isPaidPlan = ["growth", "pro", "enterprise"].includes(access.plan);
    const previewLimit = access.plan === "guest" ? 5 : access.allowed ? items.length : 5;
    const visibleItems = isPaidPlan ? items : items.slice(0, previewLimit);

    res.json({
        success: true,
        sourceType: "sample/manual",
        dataType: "sample",
        access: {
            ...access,
            message: access.allowed
                ? access.message
                : "Free limit reached. Showing preview results; login or upgrade to unlock more searches.",
            upgradePrompt: access.plan === "guest" ? "Login to save searches and unlock more examples." : "Upgrade to unlock more HS searches and exports.",
        },
        disclaimer:
            "HS code examples are sample/manual guidance for TradeAI preview. Verify final HS classification, duties and compliance with a customs expert/CHA or official authority.",
        focusCountries,
        filters: {
            categories,
            exportImportTypes: ["export", "import", "both"],
            riskLevels: ["low", "medium", "high"],
        },
        count: visibleItems.length,
        totalMatches: items.length,
        total: hsCodeExamples.length,
        hsCodes: visibleItems,
    });
};

const getTariffExamples = (req, res) => {
    const query = req.cleanQuery || req.query;
    const country = normalizeCountry(query.country);
    const hsCode = String(query.hsCode || "").trim();
    const productCategory = query.productCategory || "";
    const direction = query.direction || "";

    const items = tariffExamples.filter((item) =>
        matchesTariffCountry(item, country) &&
        matchesTariffHsCode(item, hsCode) &&
        matchesTariffCategory(item, productCategory) &&
        matchesTariffDirection(item, direction),
    );

    res.json({
        success: true,
        sourceType: "manual/sample",
        dataType: "sample",
        label: "Sample/manual tariff intelligence — verify final duty with customs or official tariff portal.",
        filters: {
            countries: tariffFocusCountries,
            productCategories: tariffProductCategories,
            directions: ["export from India", "import into India"],
            selected: {
                country: query.country || "",
                hsCode,
                productCategory,
                direction,
            },
        },
        count: items.length,
        tariffs: items,
        fallback:
            items.length === 0
                ? {
                    title: "No exact tariff data available yet",
                    actions: [
                        "Check HS code classification before pricing.",
                        "Consult a CHA/customs broker or official customs tariff portal.",
                        "Generate a trade report for broader product-country guidance.",
                    ],
                }
                : null,
        disclaimer: tariffDisclaimer,
    });
};

const getIncotermsGuide = (req, res) => {
    const query = req.cleanQuery || req.query;
    const shipmentMode = normalize(query.shipmentMode || "any");
    const userRole = normalize(query.userRole);
    const experienceLevel = normalize(query.experienceLevel);

    const items = incotermsGuide
        .filter((item) => matchesShipmentMode(item, shipmentMode))
        .filter((item) => matchesUserRole(item, userRole))
        .filter((item) => matchesExperienceLevel(item, experienceLevel))
        .sort((a, b) => b.beginnerFriendlyScore - a.beginnerFriendlyScore);

    res.json({
        success: true,
        sourceType: "manual/sample",
        dataType: "sample",
        label: "Educational Incoterms guidance - confirm in contract before use.",
        lastUpdated: incotermsLastUpdated,
        filters: {
            shipmentModes: ["any", "sea", "air", "road"],
            userRoles: ["exporter", "importer"],
            experienceLevels: ["beginner", "intermediate", "advanced"],
            selected: {
                shipmentMode: query.shipmentMode || "any",
                userRole: query.userRole || "",
                experienceLevel: query.experienceLevel || "",
            },
        },
        count: items.length,
        incoterms: items,
        disclaimer: incotermsDisclaimer,
    });
};

const getPaymentTermsGuide = (req, res) => {
    const query = req.cleanQuery || req.query;
    const filters = {
        userRole: normalize(query.userRole),
        buyerTrustLevel: normalize(query.buyerTrustLevel),
        shipmentValue: normalize(query.shipmentValue),
        countryRisk: normalize(query.countryRisk),
    };

    const terms = paymentTermsGuide
        .filter((item) => matchesPaymentFilter(item.userRoles, filters.userRole))
        .filter((item) => matchesPaymentFilter(item.buyerTrustLevels, filters.buyerTrustLevel))
        .filter((item) => matchesPaymentFilter(item.shipmentValues, filters.shipmentValue))
        .filter((item) => matchesPaymentFilter(item.countryRisks, filters.countryRisk))
        .map((item) => ({
            ...item,
            riskLevel: derivePaymentRiskLevel(item, filters),
            fitScore: paymentTermScore(item, filters),
            suggestedNextSteps: buildPaymentNextSteps(item, filters),
        }))
        .sort((a, b) => b.fitScore - a.fitScore);

    res.json({
        success: true,
        sourceType: "manual/sample",
        dataType: "sample",
        label: "Educational payment risk guidance - not banking or legal advice.",
        lastUpdated: paymentTermsLastUpdated,
        filters: {
            userRoles: ["exporter", "importer"],
            buyerTrustLevels: ["new", "known", "verified"],
            shipmentValues: ["low", "medium", "high"],
            countryRisks: ["low", "medium", "high"],
            selected: {
                userRole: query.userRole || "",
                buyerTrustLevel: query.buyerTrustLevel || "",
                shipmentValue: query.shipmentValue || "",
                countryRisk: query.countryRisk || "",
            },
        },
        count: terms.length,
        saferPaymentTerms: terms.slice(0, 4),
        paymentTerms: terms,
        redFlags: tradePaymentRedFlags,
        disclaimer: paymentTermsDisclaimer,
    });
};

const getCustomsClearanceGuide = (req, res) => {
    const query = req.cleanQuery || req.query;
    const direction = normalizeDirection(query.direction || "export");
    const filters = {
        direction,
        mode: normalize(query.mode || "sea"),
        productCategory: query.productCategory || "General goods",
        riskLevel: normalize(query.riskLevel || "medium"),
        country: query.country || "",
    };

    const workflows = customsWorkflows
        .filter((workflow) => !filters.direction || workflow.direction === filters.direction)
        .map((workflow) => buildCustomsWorkflow(workflow, filters));

    res.json({
        success: true,
        sourceType: "manual/sample",
        dataType: "sample",
        label: "Sample customs clearance workflow - verify with licensed CHA/customs broker.",
        lastUpdated: customsLastUpdated,
        filters: {
            directions: ["export", "import"],
            modes: ["sea", "air"],
            productCategories: customsProductCategories,
            riskLevels: ["low", "medium", "high"],
            selected: {
                direction: query.direction || "export",
                mode: query.mode || "sea",
                productCategory: query.productCategory || "General goods",
                country: query.country || "",
                riskLevel: query.riskLevel || "medium",
            },
        },
        count: workflows.length,
        workflows,
        disclaimer: customsDisclaimer,
    });
};

const getLogisticsGuide = (req, res) => {
    const query = req.cleanQuery || req.query;
    const filters = {
        originCountry: query.originCountry || "India",
        destinationCountry: query.destinationCountry || "",
        mode: normalize(query.mode || "any"),
        shipmentSize: query.shipmentSize || "",
        productCategory: query.productCategory || "",
    };

    const routes = logisticsRoutes
        .filter((route) => matchesLogisticsCountry(route, filters.originCountry, filters.destinationCountry))
        .filter((route) => matchesLogisticsMode(route, filters.mode))
        .map((route) => buildLogisticsResult(route, filters));

    res.json({
        success: true,
        sourceType: "manual/sample",
        dataType: "sample",
        label: "Sample/manual logistics guidance - no live freight rates.",
        lastUpdated: logisticsLastUpdated,
        filters: {
            originCountries: ["India"],
            destinationCountries: logisticsCountries,
            modes: ["any", "sea", "air"],
            shipmentSizes: ["sample", "LCL", "FCL", "bulk"],
            productCategories: tariffProductCategories,
            selected: {
                originCountry: filters.originCountry,
                destinationCountry: query.destinationCountry || "",
                mode: query.mode || "any",
                shipmentSize: filters.shipmentSize,
                productCategory: filters.productCategory,
            },
        },
        count: routes.length,
        routes,
        education: beginnerLogisticsEducation,
        disclaimer: logisticsDisclaimer,
    });
};

const getCommunicationTemplates = (req, res) => {
    const query = req.cleanQuery || req.query;
    const filters = {
        templateType: normalize(query.templateType),
        userRole: normalize(query.userRole),
        tone: normalize(query.tone),
        country: normalizeCountry(query.country),
        productCategory: normalize(query.productCategory),
    };

    const templates = communicationTemplates.filter((template) => matchesCommunicationFilter(template, filters));

    res.json({
        success: true,
        sourceType: "manual/sample",
        dataType: "sample",
        label: "Sample trade email templates - review before sending.",
        lastUpdated: communicationLastUpdated,
        filters: {
            templateTypes: communicationTemplateTypes,
            userRoles: ["exporter", "importer"],
            tones: ["formal", "simple", "professional"],
            countries: logisticsCountries,
            productCategories: tariffProductCategories,
            selected: {
                templateType: query.templateType || "",
                userRole: query.userRole || "",
                tone: query.tone || "",
                country: query.country || "",
                productCategory: query.productCategory || "",
            },
        },
        count: templates.length,
        templates,
        disclaimer: communicationDisclaimer,
    });
};

const generateCommunicationMessage = async (req, res) => {
    const payload = {
        templateType: normalize(req.body?.templateType),
        productName: String(req.body?.productName || "").trim(),
        country: String(req.body?.country || "").trim(),
        buyerOrSupplierName: String(req.body?.buyerOrSupplierName || "").trim(),
        quantity: String(req.body?.quantity || "").trim(),
        incoterm: String(req.body?.incoterm || "").trim(),
        paymentTerm: String(req.body?.paymentTerm || "").trim(),
        shipmentMode: String(req.body?.shipmentMode || "").trim(),
        tone: normalize(req.body?.tone || "professional"),
    };

    if (!payload.templateType) {
        res.status(400).json({ message: "templateType is required." });
        return;
    }

    let generated = null;

    try {
        generated = await generateOpenAICommunication(payload);
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Communication OpenAI provider failed:", error.message);
        }
    }

    res.json({
        success: true,
        ...(generated || generateFallbackCommunication(payload)),
        disclaimer: communicationDisclaimer,
    });
};

export {
    generateCommunicationMessage,
    getCommunicationTemplates,
    getCustomsClearanceGuide,
    getHsCodeDirectory,
    getIncotermsGuide,
    getLogisticsGuide,
    getPaymentTermsGuide,
    getTariffExamples,
};
