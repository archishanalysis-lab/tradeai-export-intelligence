import express from "express";

import {
    getHsCodeAnalytics,
    getTradeBuyerDiscovery,
    getTradeRecords,
} from "../controllers/tradeDataController.js";

import { protect } from "../middleware/authMiddleware.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";
import { apiRateLimit } from "../middleware/securityMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { tradeDataQuerySchema } from "../utils/validators.js";

const router = express.Router();

const heavyDataLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
});

router.get(
    "/records",
    protect,
    validate(tradeDataQuerySchema),
    cacheMiddleware({ ttl: 60 * 15 }),
    getTradeRecords,
);

router.get(
    "/hs-code-analytics",
    protect,
    validate(tradeDataQuerySchema),
    cacheMiddleware({ ttl: 60 * 60 * 24 }),
    getHsCodeAnalytics,
);

router.get(
    "/buyer-discovery",
    protect,
    heavyDataLimiter,
    validate(tradeDataQuerySchema),
    getTradeBuyerDiscovery,
);

export default router;
