import express from "express";

import {
    createCompanyReview,
    getCompanies,
    getCompanyBySlug,
    getImporters,
    getMarketplaceProducts,
    getSuppliers,
} from "../controllers/marketplaceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/companies", getCompanies);
router.get("/suppliers", getSuppliers);
router.get("/importers", getImporters);
router.get("/products", getMarketplaceProducts);
router.get("/companies/:slug", getCompanyBySlug);
router.post("/companies/:slug/reviews", protect, createCompanyReview);

export default router;
