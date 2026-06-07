const COMTRADE_API_ROOT = "https://comtradeapi.un.org";

const safeNumber = (value) => Number(value) || 0;

const countryCodeMap = new Map([
    ["0", "World"],
    ["4", "Afghanistan"],
    ["8", "Albania"],
    ["12", "Algeria"],
    ["24", "Angola"],
    ["32", "Argentina"],
    ["36", "Australia"],
    ["40", "Austria"],
    ["50", "Bangladesh"],
    ["56", "Belgium"],
    ["68", "Bolivia"],
    ["76", "Brazil"],
    ["100", "Bulgaria"],
    ["104", "Myanmar"],
    ["116", "Cambodia"],
    ["124", "Canada"],
    ["144", "Sri Lanka"],
    ["152", "Chile"],
    ["156", "China"],
    ["170", "Colombia"],
    ["188", "Costa Rica"],
    ["191", "Croatia"],
    ["203", "Czechia"],
    ["208", "Denmark"],
    ["218", "Ecuador"],
    ["231", "Ethiopia"],
    ["246", "Finland"],
    ["251", "France"],
    ["276", "Germany"],
    ["288", "Ghana"],
    ["300", "Greece"],
    ["320", "Guatemala"],
    ["344", "Hong Kong"],
    ["348", "Hungary"],
    ["356", "India"],
    ["360", "Indonesia"],
    ["364", "Iran"],
    ["368", "Iraq"],
    ["372", "Ireland"],
    ["376", "Israel"],
    ["381", "Italy"],
    ["392", "Japan"],
    ["400", "Jordan"],
    ["404", "Kenya"],
    ["410", "Republic of Korea"],
    ["414", "Kuwait"],
    ["458", "Malaysia"],
    ["484", "Mexico"],
    ["504", "Morocco"],
    ["524", "Nepal"],
    ["528", "Netherlands"],
    ["554", "New Zealand"],
    ["566", "Nigeria"],
    ["579", "Norway"],
    ["586", "Pakistan"],
    ["604", "Peru"],
    ["608", "Philippines"],
    ["616", "Poland"],
    ["620", "Portugal"],
    ["634", "Qatar"],
    ["642", "Romania"],
    ["643", "Russia"],
    ["682", "Saudi Arabia"],
    ["699", "India"],
    ["702", "Singapore"],
    ["704", "Viet Nam"],
    ["710", "South Africa"],
    ["724", "Spain"],
    ["752", "Sweden"],
    ["756", "Switzerland"],
    ["764", "Thailand"],
    ["792", "Turkiye"],
    ["784", "United Arab Emirates"],
    ["804", "Ukraine"],
    ["818", "Egypt"],
    ["826", "United Kingdom"],
    ["840", "United States"],
    ["842", "United States"],
    ["858", "Uruguay"],
]);

const getCountryName = (code, fallback = "") => {
    const key = code === undefined || code === null ? "" : String(code);
    return countryCodeMap.get(key) || fallback || (key ? `Country ${key}` : "");
};

const normalizeRecord = (record = {}) => ({
    year: record.period || record.refYear || record.year,
    reporterCode: record.reporterCode || "",
    reporter: record.reporterDesc || getCountryName(record.reporterCode, record.reporter),
    partnerCode: record.partnerCode || "",
    partner: record.partnerDesc || getCountryName(record.partnerCode, record.partner),
    hsCode: record.cmdCode || record.hsCode || "",
    product: record.cmdDesc || record.product || "",
    tradeFlow: record.flowDesc || record.tradeFlow || "",
    tradeValue: safeNumber(record.primaryValue || record.tradeValue),
    quantity: safeNumber(record.qty || record.quantity),
    source: "UN Comtrade",
});

const fallbackPartners = [
    ["404", "Kenya", 920000],
    ["834", "Tanzania", 760000],
    ["800", "Uganda", 610000],
    ["646", "Rwanda", 430000],
    ["784", "United Arab Emirates", 1450000],
    ["682", "Saudi Arabia", 1320000],
    ["512", "Oman", 580000],
    ["634", "Qatar", 690000],
    ["156", "China", 1180000],
];

const buildFallbackRecords = ({
    hsCode,
    reporterCode = "356",
    partnerCode = "0",
    flowCode = "X",
    period,
    limit = 100,
} = {}) => {
    const resolvedPeriod = period || String(new Date().getFullYear() - 1);
    const productLabel = hsCode
        ? `Sample HS ${hsCode} opportunity category`
        : "Sample export opportunity category";
    const partners =
        partnerCode && partnerCode !== "0"
            ? fallbackPartners.filter(([code]) => code === String(partnerCode))
            : fallbackPartners;

    return partners.slice(0, Math.min(Number(limit) || 100, partners.length)).map(([code, country, value], index) => ({
        year: resolvedPeriod,
        reporterCode,
        reporter: getCountryName(reporterCode, "India"),
        partnerCode: code,
        partner: country,
        hsCode: hsCode || "0910",
        product: productLabel,
        tradeFlow: flowCode,
        tradeValue: value + index * 37500,
        quantity: 0,
        source: "MVP sample trade-data fallback",
    }));
};

const buildFallbackResult = (query = {}, reason = "Live UN Comtrade data is unavailable") => ({
    source: "mvp_sample_fallback",
    sourceLabel: `${reason}. Showing MVP sample data, not live verified trade data.`,
    period: query.period || String(new Date().getFullYear() - 1),
    flowCode: query.flowCode || "X",
    isDemo: true,
    records: buildFallbackRecords(query),
});

const getCandidatePeriods = (period) => {
    if (period) return [String(period)];

    const latestLikelyYear = new Date().getFullYear() - 1;
    return Array.from({ length: 5 }, (_, index) => String(latestLikelyYear - index));
};

const buildComtradeUrl = ({
    hsCode,
    reporterCode,
    partnerCode,
    flowCode,
    period,
    limit,
}) => {
    const endpoint = [
        COMTRADE_API_ROOT,
        "data/v1/get",
        "C",
        /^\d{6}$/.test(String(period)) ? "M" : "A",
        "HS",
    ].join("/");

    const params = new URLSearchParams({
        reporterCode,
        partnerCode,
        cmdCode: hsCode,
        flowCode,
        period,
        maxRecords: String(limit),
        format: "json",
        aggregateBy: "none",
        breakdownMode: "classic",
        includeDesc: "true",
    });

    if (process.env.COMTRADE_API_KEY) {
        params.set("subscription-key", process.env.COMTRADE_API_KEY);
    }

    return `${endpoint}?${params.toString()}`;
};

const createComtradeHeaders = () => {
    const headers = {
        Accept: "application/json",
    };

    if (process.env.COMTRADE_API_KEY) {
        headers["Ocp-Apim-Subscription-Key"] = process.env.COMTRADE_API_KEY;
    }

    return headers;
};

const requestComtradePeriod = async ({
    hsCode,
    reporterCode,
    partnerCode,
    flowCode,
    period,
    limit,
}) => {
    const url = buildComtradeUrl({
        hsCode,
        reporterCode,
        partnerCode,
        flowCode,
        period,
        limit,
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response;

    try {
        response = await fetch(url, {
            headers: createComtradeHeaders(),
            signal: controller.signal,
        });
    } catch (error) {
        if (error.name === "AbortError") {
            const timeoutError = new Error("UN Comtrade request timed out. Please try again.");
            timeoutError.status = 504;
            throw timeoutError;
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        const upstreamMessage = await response.text().catch(() => "");
        const retryAfter = response.headers.get("retry-after");
        const rateLimitMessage = retryAfter
            ? `UN Comtrade rate limit reached. Try again in ${retryAfter} seconds.`
            : "UN Comtrade rate limit reached. Please try again shortly.";
        const error = new Error(
            response.status === 429
                ? rateLimitMessage
                : upstreamMessage
                ? `UN Comtrade request failed with status ${response.status}: ${upstreamMessage.slice(0, 180)}`
                : `UN Comtrade request failed with status ${response.status}`,
        );
        error.status = response.status;
        error.retryAfter = retryAfter;
        throw error;
    }

    const data = await response.json();
    return data.data || data.dataset || [];
};

const fetchComtradeRecords = async ({
    hsCode,
    reporterCode = "842",
    partnerCode = "0",
    flowCode = "X",
    period,
    limit = 100,
} = {}) => {
    if (!process.env.COMTRADE_API_KEY) {
        return buildFallbackResult(
            { hsCode, reporterCode, partnerCode, flowCode, period, limit },
            "COMTRADE_API_KEY is not configured",
        );
    }

    if (!hsCode) {
        const error = new Error("HS code is required for live trade data lookup.");
        error.status = 422;
        throw error;
    }

    const candidatePeriods = getCandidatePeriods(period);
    const reporterCodes = [reporterCode];
    const requestLimit = Math.min(Number(limit) || 100, 100);
    let rawRecords = [];
    let resolvedPeriod = candidatePeriods[0];
    let lastError = null;

    for (const candidatePeriod of candidatePeriods) {
        resolvedPeriod = candidatePeriod;

        for (const currentReporterCode of reporterCodes) {
            try {
                const records = await requestComtradePeriod({
                    hsCode,
                    reporterCode: currentReporterCode,
                    partnerCode,
                    flowCode,
                    period: candidatePeriod,
                    limit: requestLimit,
                });

                rawRecords.push(...records);
            } catch (error) {
                if (error.status === 429) {
                    lastError = error;
                    break;
                }

                lastError = error;
            }

            if (rawRecords.length) break;
        }

        if (rawRecords.length) break;
    }

    if (!rawRecords.length && lastError) {
        return buildFallbackResult(
            { hsCode, reporterCode, partnerCode, flowCode, period, limit },
            lastError.status === 429
                ? "UN Comtrade rate limit reached"
                : "UN Comtrade did not return usable records",
        );
    }

    return {
        source: "live",
        period: resolvedPeriod,
        flowCode,
        records: rawRecords.map(normalizeRecord),
    };
};

const buildHsCodeAnalytics = (records = [], { groupBy = "partner" } = {}) => {
    const totalTradeValue = records.reduce((sum, record) => sum + safeNumber(record.tradeValue), 0);
    const countryTotals = records.reduce((acc, record) => {
        const country =
            groupBy === "reporter"
                ? record.reporter || "Unknown"
                : record.partner || "Unknown";
        acc[country] = (acc[country] || 0) + safeNumber(record.tradeValue);
        return acc;
    }, {});

    return {
        totalTradeValue,
        recordCount: records.length,
        topCountries: Object.entries(countryTotals)
            .map(([country, value]) => ({ country, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10),
    };
};

const getCountryTrends = (records = []) => {
    const trendMap = records.reduce((acc, record) => {
        const key = `${record.partner || "Unknown"}-${record.year || "Unknown"}`;
        acc[key] = acc[key] || {
            country: record.partner || "Unknown",
            year: record.year || "Unknown",
            value: 0,
        };
        acc[key].value += safeNumber(record.tradeValue);
        return acc;
    }, {});

    return Object.values(trendMap).sort((a, b) => String(a.country).localeCompare(String(b.country)));
};

const discoverBuyersFromTradeData = (records = []) =>
    records.slice(0, 12).map((record, index) => ({
        companyName: `${record.partner || "Global"} Importer ${index + 1}`,
        country: record.partner || "",
        industry: record.product || "General trade",
        products: [record.product || record.hsCode].filter(Boolean),
        tradeVolume: record.tradeValue,
        source: record.source,
    }));

export {
    buildHsCodeAnalytics,
    discoverBuyersFromTradeData,
    fetchComtradeRecords,
    getCountryTrends,
};
