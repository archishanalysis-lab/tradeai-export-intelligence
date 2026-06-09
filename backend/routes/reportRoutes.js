import express from "express";

import {
    createAiReport,
    createOpportunityReport,
    exportAiReport,
    generateSampleReport,
    getAiReportById,
    getAiReports,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", generateSampleReport);

router.use(protect);

router.route("/").get(getAiReports).post(createAiReport);
router.post("/opportunity", createOpportunityReport);
router.get("/:id", getAiReportById);
router.get("/:id/export", exportAiReport);

export default router;
