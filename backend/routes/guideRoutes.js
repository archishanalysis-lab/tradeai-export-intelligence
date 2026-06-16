import express from "express";

import { getExportImportProcessGuide } from "../controllers/guideController.js";
import { apiRateLimit } from "../middleware/securityMiddleware.js";

const router = express.Router();

const guideLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 180,
});

router.get("/export-import-process", guideLimiter, getExportImportProcessGuide);

export default router;
