import express from "express";

import {
    createAiReport,
    createOpportunityReport,
    createTradeReadinessReport,
    deleteAiReportById,
    deleteMyReportById,
    exportAiReport,
    exportMyReportById,
    exportReportsCsv,
    generateSampleReport,
    getAiReportById,
    getAiReports,
    getMyReportById,
    getMyReports,
} from "../controllers/reportController.js";
import { optionalProtect, protect } from "../middleware/authMiddleware.js";
import { apiRateLimit } from "../middleware/securityMiddleware.js";

const router = express.Router();
const reportGenerationLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
});
const publicTradeReadinessLimiter = apiRateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
});
const reportExportLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
});

router.post("/trade-readiness", publicTradeReadinessLimiter, optionalProtect, createTradeReadinessReport);

router.use(protect);

router.post("/generate", reportGenerationLimiter, generateSampleReport);
router.get("/my-reports", getMyReports);
router.get("/my-reports/:id/export", exportMyReportById);
router.route("/my-reports/:id").get(getMyReportById).delete(deleteMyReportById);
router.route("/").get(getAiReports).post(reportGenerationLimiter, createAiReport);
router.post("/opportunity", reportGenerationLimiter, createOpportunityReport);
router.get("/export/csv", reportExportLimiter, exportReportsCsv);
router.route("/:id").get(getAiReportById).delete(deleteAiReportById);
router.get("/:id/export", exportAiReport);

export default router;
