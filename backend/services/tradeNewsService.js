const DEFAULT_TIMEOUT_MS = 8000;

const officialSources = [
    {
        id: "wto",
        name: "WTO News",
        type: "rss",
        url: "https://www.wto.org/english/news_e/news_e.xml",
        category: "Global trade",
    },
    {
        id: "dgft-notifications",
        name: "DGFT Notifications",
        type: "html",
        url: "https://www.dgft.gov.in/CP/?opt=notification",
        category: "India export-import policy",
    },
    {
        id: "dgft-public-notices",
        name: "DGFT Public Notices",
        type: "html",
        url: "https://www.dgft.gov.in/CP/?opt=public-notice",
        category: "India export-import policy",
    },
    {
        id: "cbic-customs-notifications",
        name: "CBIC Customs Notifications",
        type: "html",
        url: "https://taxinformation.cbic.gov.in/notifications/customs",
        category: "Customs and documents",
    },
    {
        id: "cbic-customs-circulars",
        name: "CBIC Customs Circulars",
        type: "html",
        url: "https://taxinformation.cbic.gov.in/circulars/customs",
        category: "Customs and documents",
    },
];

const decodeEntities = (value = "") =>
    String(value)
        .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();

const stripTags = (value = "") => decodeEntities(String(value).replace(/<[^>]*>/g, " "));

const normalizeDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const detectTopic = (text = "") => {
    const value = text.toLowerCase();

    if (/\bhs\b|harmoni[sz]ed|tariff|classification|nomenclature/.test(value)) {
        return "HS code / tariff";
    }

    if (/customs|duty|drawback|port|shipping|bill of entry|export document|certificate/.test(value)) {
        return "Customs / documents";
    }

    if (/export|import|foreign trade|dgft|iec|ftp|policy|licen[cs]e/.test(value)) {
        return "Export-import policy";
    }

    return "Trade news";
};

const buildAbsoluteUrl = (baseUrl, link = "") => {
    try {
        return new URL(link, baseUrl).href;
    } catch {
        return baseUrl;
    }
};

const fetchText = async (url) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "TradeAI/1.0 (+https://tradeai.local)",
                Accept: "application/rss+xml, application/xml, text/html;q=0.9, */*;q=0.8",
            },
        });

        if (!response.ok) {
            const error = new Error(`Source returned ${response.status}`);
            error.status = response.status;
            throw error;
        }

        return response.text();
    } finally {
        clearTimeout(timeout);
    }
};

const parseRssItems = (xml, source) => {
    const itemMatches = [...String(xml).matchAll(/<item\b[\s\S]*?<\/item>/gi)];

    return itemMatches.map((match) => {
        const item = match[0];
        const title = decodeEntities(item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
        const link = decodeEntities(item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || source.url);
        const summary = stripTags(item.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || "");
        const publishedAt = normalizeDate(
            item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] ||
                item.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)?.[1],
        );

        return {
            id: `${source.id}:${link || title}`,
            source: source.name,
            category: detectTopic(`${title} ${summary}`) || source.category,
            title,
            summary,
            url: buildAbsoluteUrl(source.url, link),
            publishedAt,
        };
    });
};

const parseHtmlItems = (html, source) => {
    const anchors = [...String(html).matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    const relevantKeywords =
        /notification|public notice|circular|customs|export|import|foreign trade|hs code|tariff|drawback|iec|policy|license|licence|document/i;

    return anchors
        .map((match) => {
            const title = stripTags(match[2]);
            const url = buildAbsoluteUrl(source.url, match[1]);

            return {
                id: `${source.id}:${url}`,
                source: source.name,
                category: detectTopic(title) || source.category,
                title,
                summary: source.category,
                url,
                publishedAt: null,
            };
        })
        .filter((item) => item.title && item.title.length > 8 && relevantKeywords.test(item.title))
        .slice(0, 8);
};

const normalizeItem = (item) => ({
    ...item,
    title: item.title || "Untitled trade update",
    summary: item.summary || "Official trade update",
    fetchedAt: new Date().toISOString(),
});

const fetchSourceItems = async (source) => {
    const text = await fetchText(source.url);
    const items = source.type === "rss" ? parseRssItems(text, source) : parseHtmlItems(text, source);
    return items.map(normalizeItem);
};

const sortItems = (items) =>
    [...items].sort((a, b) => {
        const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bTime - aTime;
    });

const getTradeNews = async ({ limit = 12, topic = "" } = {}) => {
    const settled = await Promise.allSettled(officialSources.map(fetchSourceItems));
    const sourceStatus = settled.map((result, index) => ({
        source: officialSources[index].name,
        url: officialSources[index].url,
        ok: result.status === "fulfilled",
        error: result.status === "rejected" ? result.reason.message : null,
    }));

    const seen = new Set();
    const normalizedTopic = String(topic || "").toLowerCase();
    const items = sortItems(
        settled
            .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
            .filter((item) => {
                const key = `${item.source}:${item.url || item.title}`;
                if (seen.has(key)) return false;
                seen.add(key);

                if (!normalizedTopic) return true;

                return `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(normalizedTopic);
            }),
    ).slice(0, Math.min(Number(limit) || 12, 30));

    return {
        success: true,
        generatedAt: new Date().toISOString(),
        items,
        sourceStatus,
        message: items.length
            ? "Live official trade update feed."
            : "No live trade updates could be loaded from official sources right now.",
    };
};

export { getTradeNews, officialSources };
