import express from "express";

import {
    cancelSubscription,
    createCheckoutSession,
    getBillingStatus,
    getPaymentHistory,
    handleRazorpayWebhook,
    verifyRazorpayPayment,
} from "../controllers/billingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/webhook/razorpay", handleRazorpayWebhook);
router.get("/status", protect, getBillingStatus);
router.get("/payments", protect, getPaymentHistory);
router.post("/checkout", protect, createCheckoutSession);
router.post("/verify", protect, verifyRazorpayPayment);
router.post("/cancel", protect, cancelSubscription);

export default router;
