import express from "express";

import {
    addInquiryMessage,
    createInquiry,
    getInquiries,
    getInquiryById,
    updateInquiryStatus,
} from "../controllers/inquiryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
    inquiryCreateSchema,
    inquiryMessageSchema,
    inquiryStatusSchema,
    productParamsSchema,
} from "../utils/validators.js";

const router = express.Router();

router.route("/").get(protect, getInquiries).post(protect, validate(inquiryCreateSchema), createInquiry);

router.get("/:id", protect, validate(productParamsSchema), getInquiryById);
router.patch("/:id/status", protect, validate(inquiryStatusSchema), updateInquiryStatus);
router.put("/:id/status", protect, validate(inquiryStatusSchema), updateInquiryStatus);
router.post("/:id/messages", protect, validate(inquiryMessageSchema), addInquiryMessage);

export default router;
