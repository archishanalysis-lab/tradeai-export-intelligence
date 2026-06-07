import express from "express";

import {
    getAdminOverview,
    listContactFeedback,
    listCompanyProfiles,
    listAdminBuyers,
    listAdminInquiries,
    listAdminProducts,
    listAdminReports,
    listAdminUsers,
    listKycDocuments,
    reviewKycDocument,
    updateContactFeedbackStatus,
    updateProductApproval,
    updateUserStatus,
    verifyBuyer,
} from "../controllers/adminController.js";

import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
    contactFeedbackQuerySchema,
    contactFeedbackStatusSchema,
} from "../utils/validators.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/overview", getAdminOverview);
router.get("/contact-feedback", validate(contactFeedbackQuerySchema), listContactFeedback);
router.patch(
    "/contact-feedback/:id/status",
    validate(contactFeedbackStatusSchema),
    updateContactFeedbackStatus,
);
router.get("/users", listAdminUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/company-profiles", listCompanyProfiles);
router.get("/kyc", listKycDocuments);
router.patch("/kyc/:id/review", reviewKycDocument);
router.get("/buyers", listAdminBuyers);
router.patch("/buyers/:id/verify", verifyBuyer);
router.get("/products", listAdminProducts);
router.patch("/products/:id/approval", updateProductApproval);
router.get("/inquiries", listAdminInquiries);
router.get("/reports", listAdminReports);

export default router;
