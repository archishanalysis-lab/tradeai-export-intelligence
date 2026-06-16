import express from "express";

import {
    generateCommunicationMessage,
    getCommunicationTemplates,
    getCustomsClearanceGuide,
    getHsCodeDirectory,
    getIncotermsGuide,
    getLogisticsGuide,
    getPaymentTermsGuide,
    getTariffExamples,
} from "../controllers/tradeController.js";
import { optionalProtect, protect } from "../middleware/authMiddleware.js";
import { apiRateLimit } from "../middleware/securityMiddleware.js";

const router = express.Router();

const hsDirectoryLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
});

const communicationGenerateLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
});

router.get("/communication-templates", hsDirectoryLimiter, getCommunicationTemplates);
router.post("/communication-generate", protect, communicationGenerateLimiter, generateCommunicationMessage);
router.get("/customs-clearance", hsDirectoryLimiter, getCustomsClearanceGuide);
router.get("/hs-codes", hsDirectoryLimiter, optionalProtect, getHsCodeDirectory);
router.get("/incoterms", hsDirectoryLimiter, getIncotermsGuide);
router.get("/logistics", hsDirectoryLimiter, getLogisticsGuide);
router.get("/payment-terms", hsDirectoryLimiter, getPaymentTermsGuide);
router.get("/tariffs", hsDirectoryLimiter, getTariffExamples);

export default router;
