import express from "express";

import {
    createReportRequest,
    getReportRequests,
    updateReportRequestStatus,
} from "../controllers/reportRequestController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
    reportRequestCreateSchema,
    reportRequestQuerySchema,
    reportRequestStatusSchema,
} from "../utils/validators.js";

const router = express.Router();

router.post("/", validate(reportRequestCreateSchema), createReportRequest);
router.get("/", protect, adminOnly, validate(reportRequestQuerySchema), getReportRequests);
router.patch(
    "/:id/status",
    protect,
    adminOnly,
    validate(reportRequestStatusSchema),
    updateReportRequestStatus,
);

export default router;
