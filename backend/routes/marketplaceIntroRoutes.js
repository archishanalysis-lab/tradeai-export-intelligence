import express from "express";

import {
    createMarketplaceIntroRequest,
    getMarketplaceIntroRequests,
    updateMarketplaceIntroRequestStatus,
} from "../controllers/marketplaceIntroController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
    marketplaceIntroCreateSchema,
    marketplaceIntroQuerySchema,
    marketplaceIntroStatusSchema,
} from "../utils/validators.js";

const router = express.Router();

router.post("/", validate(marketplaceIntroCreateSchema), createMarketplaceIntroRequest);
router.get("/", protect, adminOnly, validate(marketplaceIntroQuerySchema), getMarketplaceIntroRequests);
router.patch(
    "/:id/status",
    protect,
    adminOnly,
    validate(marketplaceIntroStatusSchema),
    updateMarketplaceIntroRequestStatus,
);

export default router;
