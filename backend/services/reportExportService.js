import { countryComplianceRules } from "../data/countryComplianceRules.js";
import { countryProductScores } from "../data/countryRecommendationScores.js";
import { communicationTemplates } from "../data/communicationTemplates.js";
import { documentRules } from "../data/documentRules.js";
import { hsCodeExamples } from "../data/hsCodeExamples.js";
import { logisticsRoutes } from "../data/logisticsGuide.js";
import { tariffExamples } from "../data/tariffExamples.js";

const normalize = (value = "") => String(value || "").trim().toLowerCase();

const escapeCsv = (value = "") => {
    const text = Array.isArray(value)
        ? value.join("; ")
        : typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : String(value ?? "");

    return `"${text.replace(/"/g, '""')}"`;
};

const toCsv = (headers = [], rows = []) => [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
].join("\n");

const flattenReportData = (report = {}) => {
    const data = report.reportData || {};

    return [{
        reportType: data.reportTitle ? "trade-readiness-report" : "export-opportunity-report",
        title: data.reportTitle || `${report.productName || "TradeAI"} report`,
        country: data.country || report.targetCountry || "",
        productCategory: data.productName || report.productName || "",
        hsCode: data.hsCodeOrCategory || report.hsCode || "",
        riskLevel: data.riskLevel || "",
        summary: data.opportunitySummary || data.marketPotential || data.demandReason || "",
        sourceDataType: data.sourceType || data.providerLabel || data.dataSourceLabel || "sample/manual",
        createdAt: report.createdAt || "",
    }];
};

const filterRows = (rows, filters = {}) =>
    rows.filter((row) => {
        const rowCountries = [
            row.country,
            row.destinationCountry,
            ...(Array.isArray(row.commonCountries) ? row.commonCountries : []),
            ...(Array.isArray(row.countries) ? row.countries : []),
        ].filter(Boolean);
        const rowHsCode = row.hsCode || row.hsCodePrefix || "";

        if (filters.country && !rowCountries.some((country) => normalize(country) === normalize(filters.country))) return false;
        if (filters.productCategory && !normalize(row.productCategory).includes(normalize(filters.productCategory))) return false;
        if (filters.hsCode && !normalize(rowHsCode).startsWith(normalize(filters.hsCode))) return false;
        return true;
    });

const buildRowsForReportType = ({ reportType, filters, savedReport }) => {
    if (savedReport) {
        return {
            headers: ["reportType", "title", "country", "productCategory", "hsCode", "riskLevel", "summary", "sourceDataType", "createdAt"],
            rows: flattenReportData(savedReport),
        };
    }

    if (reportType === "hs-codes") {
        return {
            headers: ["hsCode", "productName", "productCategory", "description", "exportImportType", "riskLevel", "dataType"],
            rows: filterRows(hsCodeExamples, filters),
        };
    }

    if (reportType === "document-checklist") {
        return {
            headers: ["country", "direction", "productCategory", "hsCodePrefix", "requiredDocuments", "conditionalDocuments", "riskLevel", "dataType"],
            rows: filterRows(documentRules, filters),
        };
    }

    if (reportType === "compliance-checklist") {
        return {
            headers: ["country", "exportImportDirection", "applicableProductCategories", "complianceRuleName", "authority", "riskLevel", "dataType"],
            rows: filterRows(
                countryComplianceRules.map((rule) => ({
                    ...rule,
                    productCategory: rule.applicableProductCategories.join("; "),
                })),
                filters,
            ),
        };
    }

    if (reportType === "duty-tariff") {
        return {
            headers: ["country", "hsCode", "productName", "productCategory", "direction", "dutyType", "estimatedDutyRate", "taxNotes", "riskLevel", "sourceType"],
            rows: filterRows(tariffExamples, filters),
        };
    }

    if (reportType === "logistics-checklist") {
        return {
            headers: ["originCountry", "destinationCountry", "commonPorts", "commonAirports", "shipmentModes", "estimatedTransitTimeRange", "fclLclSuitability", "dataType"],
            rows: logisticsRoutes
                .filter((row) => !filters.country || normalize(row.destinationCountry) === normalize(filters.country))
                .map((row) => ({ ...row, country: row.destinationCountry, productCategory: filters.productCategory || "" })),
        };
    }

    if (reportType === "country-recommendation") {
        return {
            headers: ["country", "productCategory", "demandScore", "competitionScore", "complianceComplexity", "paymentRisk", "logisticsEase", "tariffRisk", "marketEntryDifficulty", "recommendedFor", "notRecommendedFor", "dataType"],
            rows: filterRows(countryProductScores, filters),
        };
    }

    if (reportType === "communication-history") {
        return {
            headers: ["templateType", "title", "subject", "userRoles", "tones", "countries", "productCategories", "dataType"],
            rows: communicationTemplates
                .filter((template) => !filters.country || template.countries.some((country) => normalize(country) === normalize(filters.country)))
                .filter((template) => !filters.productCategory || template.productCategories.some((category) => normalize(category).includes(normalize(filters.productCategory)))),
        };
    }

    if (reportType === "export-opportunity-report") {
        return {
            headers: ["message", "reportType", "sourceDataType"],
            rows: [{
                message: "Generate and save an export opportunity or trade readiness report, then export that saved report by reportId.",
                reportType,
                sourceDataType: "sample/manual",
            }],
        };
    }

    return {
        headers: ["message", "reportType", "sourceDataType"],
        rows: [{
            message: "No export data is available for this report type yet. Generate or save the related workflow first.",
            reportType,
            sourceDataType: "sample/manual",
        }],
    };
};

const buildCsvExport = ({ reportType, filters = {}, savedReport = null, watermark = "" }) => {
    const { headers, rows } = buildRowsForReportType({ reportType, filters, savedReport });
    const finalHeaders = watermark ? ["notice", ...headers] : headers;
    const finalRows = watermark ? rows.map((row) => ({ notice: watermark, ...row })) : rows;

    return {
        csv: toCsv(finalHeaders, finalRows),
        rowCount: finalRows.length,
        sourceDataType: savedReport?.reportData?.sourceType || savedReport?.reportData?.dataSourceLabel || "sample/manual",
    };
};

export { buildCsvExport };
