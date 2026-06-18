import express from "express";

import { getCountryRecommendations } from "../controllers/recommendationController.js";
import { optionalProtect } from "../middleware/authMiddleware.js";
import { apiRateLimit } from "../middleware/securityMiddleware.js";

const router = express.Router();

const recommendationLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
});

router.get("/country", recommendationLimiter, optionalProtect, getCountryRecommendations);
router.post("/country-fit", recommendationLimiter, optionalProtect, getCountryRecommendations);

export default router;
