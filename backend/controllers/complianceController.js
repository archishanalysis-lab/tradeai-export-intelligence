import { documentRules, focusCountries, productProfiles } from "../data/documentRules.js";
import {
    complianceCountries,
    complianceProductCategories,
    countryComplianceRules,
} from "../data/countryComplianceRules.js";
import { focusCountryNames, getCuratedGuidance } from "../data/focusCountryGuidance.js";

const normalize = (value = "") => String(value || "").trim().toLowerCase();

const normalizeCountry = (value = "") => {
    const country = normalize(value);

    if (country === "saudi") return "saudi arabia";

    return country;
};

const normalizeDirection = (value = "") => {
    const direction = normalize(value);

    if (direction === "export") return "export from india";
    if (direction === "import") return "import into india";

    return direction;
};

const splitPrefixes = (value = "") =>
    String(value)
        .split(",")
        .map((prefix) => prefix.trim())
        .filter(Boolean);

const unique = (items = []) => Array.from(new Set(items.filter(Boolean)));

const matchesHsCode = (rule, hsCode) => {
    if (!hsCode) return true;

    const cleanHsCode = String(hsCode).replace(/\D/g, "");
    if (!cleanHsCode) return true;

    return splitPrefixes(rule.hsCodePrefix).some((prefix) => cleanHsCode.startsWith(prefix.replace(/\D/g, "")));
};

const scoreRule = (rule, filters) => {
    let score = 0;

    if (filters.country && normalize(rule.country) === filters.country) score += 3;
    if (filters.direction && normalize(rule.direction) === filters.direction) score += 3;
    if (filters.productCategory && normalize(rule.productCategory) === filters.productCategory) score += 2;
    if (filters.hsCode && matchesHsCode(rule, filters.hsCode)) score += 1;

    return score;
};

const getDocumentChecklist = (req, res) => {
    const query = req.cleanQuery || req.query;
    const filters = {
        country: normalizeCountry(query.country),
        direction: normalizeDirection(query.direction),
        productCategory: normalize(query.productCategory),
        hsCode: String(query.hsCode || "").trim(),
    };

    const matchedRules = documentRules
        .filter((rule) => !filters.country || normalize(rule.country) === filters.country)
        .filter((rule) => !filters.direction || normalize(rule.direction) === filters.direction)
        .filter((rule) => !filters.productCategory || normalize(rule.productCategory) === filters.productCategory)
        .filter((rule) => matchesHsCode(rule, filters.hsCode))
        .sort((a, b) => scoreRule(b, filters) - scoreRule(a, filters));

    const selectedRules = matchedRules.slice(0, 12);
    const highestRisk = selectedRules.some((rule) => rule.riskLevel === "high")
        ? "high"
        : selectedRules.some((rule) => rule.riskLevel === "medium")
            ? "medium"
            : "low";

    res.json({
        success: true,
        sourceType: "sample/manual",
        dataType: "sample",
        filters: {
            countries: focusCountries,
            directions: ["export from India", "import into India"],
            productCategories: productProfiles.map((profile) => profile.productCategory),
            selected: {
                country: query.country || "",
                direction: query.direction || "",
                productCategory: query.productCategory || "",
                hsCode: filters.hsCode,
            },
        },
        count: selectedRules.length,
        mandatoryDocuments: unique(selectedRules.flatMap((rule) => rule.requiredDocuments)),
        conditionalDocuments: unique(selectedRules.flatMap((rule) => rule.conditionalDocuments)),
        productSpecificDocuments: unique(selectedRules.flatMap((rule) => rule.productSpecificDocuments)),
        authorityOrDepartment: unique(selectedRules.flatMap((rule) => rule.authorityOrDepartment)),
        countrySpecificNotes: unique(selectedRules.map((rule) => rule.notes)),
        riskLevel: selectedRules.length ? highestRisk : "medium",
        rules: selectedRules,
        disclaimer:
            "This document checklist is sample/manual guidance for TradeAI preview. Verify final documents, licences, HS classification, duty and compliance with a CHA, customs broker, customs authority, DGFT, product regulator or qualified professional before shipment.",
    });
};

const getCountryComplianceRules = (req, res) => {
    const query = req.cleanQuery || req.query;
    const filters = {
        country: normalizeCountry(query.country),
        direction: normalizeDirection(query.direction),
        productCategory: normalize(query.productCategory),
        riskLevel: normalize(query.riskLevel),
    };

    const rules = countryComplianceRules
        .filter((rule) => !filters.country || normalize(rule.country) === filters.country)
        .filter((rule) => !filters.direction || normalize(rule.exportImportDirection) === filters.direction)
        .filter((rule) => !filters.riskLevel || normalize(rule.riskLevel) === filters.riskLevel)
        .filter(
            (rule) =>
                !filters.productCategory ||
                rule.applicableProductCategories.some(
                    (category) => normalize(category) === filters.productCategory || normalize(category) === "general goods",
                ),
        );

    res.json({
        success: true,
        sourceType: "sample/manual",
        dataType: "sample",
        label: "Sample compliance intelligence — verify with official authority.",
        filters: {
            countries: complianceCountries,
            directions: ["export from India", "import into India"],
            productCategories: complianceProductCategories,
            riskLevels: ["low", "medium", "high"],
            selected: {
                country: query.country || "",
                direction: query.direction || "",
                productCategory: query.productCategory || "",
                riskLevel: query.riskLevel || "",
            },
        },
        count: rules.length,
        rules,
        disclaimer:
            "This is sample compliance intelligence, not live official regulatory data. Verify requirements, documents, restrictions, certifications and authority guidance with the official authority, CHA/customs broker, importer, bank or qualified professional before shipment.",
    });
};

const getFocusCountryGuidance = (req, res) => {
    const query = req.cleanQuery || req.query;
    const guidance = getCuratedGuidance(query.country);

    res.json({
        success: true,
        sourceType: "curated-guidance",
        dataType: "curated",
        label: "Curated compliance and tariff guidance - not live official data.",
        filters: {
            countries: focusCountryNames,
            selected: {
                country: query.country || "",
            },
        },
        guidance: guidance ? [guidance] : focusCountryNames.map((country) => getCuratedGuidance(country)),
        disclaimer:
            "This is curated country guidance for TradeAI MVP screening. It is not live customs, tariff, legal, banking or compliance data. Verify exact requirements with official authorities, importer, bank, CHA/customs broker or qualified professional.",
    });
};

export { getCountryComplianceRules, getDocumentChecklist, getFocusCountryGuidance };
