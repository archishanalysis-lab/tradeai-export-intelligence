import {
    buildHsCodeAnalytics,
    discoverBuyersFromTradeData,
    fetchComtradeRecords,
    getCountryTrends,
} from "../services/tradeDataService.js";
import { generateTradeInsights } from "../services/analyticsIntelligenceService.js";
import { runJobInline } from "../services/queueService.js";

const getValidatedQuery = (req) => req.validated?.query || req.query || {};

const logJobFailure = (jobName, error) => {
    console.error(`[TradeAI job failure] ${jobName}: ${error.message}`);
};

const getTradeRecords = async (req, res, next) => {
    try {
        const result = await fetchComtradeRecords(getValidatedQuery(req));
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const getHsCodeAnalytics = async (req, res, next) => {
    try {
        const job = await runJobInline(
            "trade.analytics.hs_code",
            getValidatedQuery(req),
            async (payload) => {
                try {
                    const result = await fetchComtradeRecords(payload);
                    const analytics = buildHsCodeAnalytics(result.records);
                    const trends = getCountryTrends(result.records);
                    const insights = generateTradeInsights({ records: result.records, analytics });

                    return {
                        ...result,
                        success: true,
                        analytics,
                        trends,
                        insights,
                    };
                } catch (innerError) {
                    logJobFailure("trade.analytics.hs_code", innerError);
                    throw innerError;
                }
            },
        );

        if (!job || job.status === "failed" || !job.result) {
            res.status(500);
            throw new Error("Failed to compile market analytics. Please check your query parameters.");
        }

        res.json(job.result);
    } catch (error) {
        next(error);
    }
};

const getTradeBuyerDiscovery = async (req, res, next) => {
    try {
        const result = await fetchComtradeRecords(getValidatedQuery(req));
        const buyers = discoverBuyersFromTradeData(result.records);

        res.json({
            source: result.source,
            buyers,
            total: buyers.length,
        });
    } catch (error) {
        next(error);
    }
};

export { getHsCodeAnalytics, getTradeBuyerDiscovery, getTradeRecords };
