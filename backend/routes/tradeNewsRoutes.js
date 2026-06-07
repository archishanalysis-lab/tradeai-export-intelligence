import express from "express";

import { getTradeNewsFeed } from "../controllers/tradeNewsController.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";
import { apiRateLimit } from "../middleware/securityMiddleware.js";

const router = express.Router();

const tradeNewsLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
});

router.get("/", tradeNewsLimiter, cacheMiddleware({ ttl: 30 * 60 }), getTradeNewsFeed);

export default router;
