const percent = (value) => `${Math.round(value)}%`;

const generateTradeInsights = ({ records = [], analytics = {} }) => {
    const insights = [];
    const topCountry = analytics.topCountries?.[0];

    if (topCountry) {
        insights.push({
            type: "opportunity",
            title: `${topCountry.country} is the strongest current demand signal`,
            summary: `This market represents ${percent(
                (topCountry.value / Math.max(analytics.totalTradeValue || 1, 1)) * 100,
            )} of analyzed trade value.`,
            confidence: 84,
        });
    }

    if (records.length >= 3) {
        insights.push({
            type: "trend",
            title: "Multi-country demand is visible",
            summary: `${records.length} trade records were analyzed across partner markets.`,
            confidence: 76,
        });
    }

    if (!insights.length) {
        insights.push({
            type: "next_step",
            title: "Add HS code and target country data",
            summary: "TradeAI can generate stronger insights when products include HS code and destination markets.",
            confidence: 62,
        });
    }

    return insights;
};

export { generateTradeInsights };
