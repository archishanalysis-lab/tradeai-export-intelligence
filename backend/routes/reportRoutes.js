import express from "express";

import {
    createAiReport,
    createOpportunityReport,
    exportAiReport,
    generateSampleReport,
    getAiReportById,
    getAiReports,
    getMyReportById,
    getMyReports,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", generateSampleReport);

router.use(protect);

router.get("/my-reports", getMyReports);
router.get("/my-reports/:id", getMyReportById);
router.route("/").get(getAiReports).post(createAiReport);
router.post("/opportunity", createOpportunityReport);
router.get("/:id", getAiReportById);
router.get("/:id/export", exportAiReport);

export default router;
