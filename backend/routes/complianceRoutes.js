import express from "express";

import { getCountryComplianceRules, getDocumentChecklist } from "../controllers/complianceController.js";
import { apiRateLimit } from "../middleware/securityMiddleware.js";

const router = express.Router();

const documentsLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
});

router.get("/documents", documentsLimiter, getDocumentChecklist);
router.get("/country-rules", documentsLimiter, getCountryComplianceRules);

export default router;
