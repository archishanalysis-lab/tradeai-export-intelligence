import { getTradeNews } from "../services/tradeNewsService.js";

const getTradeNewsFeed = async (req, res, next) => {
    try {
        const feed = await getTradeNews({
            limit: req.query.limit,
            topic: req.query.topic,
        });

        res.json(feed);
    } catch (error) {
        next(error);
    }
};

export { getTradeNewsFeed };
