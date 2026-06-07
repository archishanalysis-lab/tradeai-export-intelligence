import express from "express";

import {
    createDeal,
    deleteDeal,
    getDealById,
    getDeals,
    updateDeal,
} from "../controllers/dealController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
    dealCreateSchema,
    dealParamsSchema,
    dealQuerySchema,
    dealUpdateSchema,
} from "../utils/validators.js";

const router = express.Router();

router
    .route("/")
    .get(protect, validate(dealQuerySchema), getDeals)
    .post(protect, validate(dealCreateSchema), createDeal);

router
    .route("/:id")
    .get(protect, validate(dealParamsSchema), getDealById)
    .put(protect, validate(dealUpdateSchema), updateDeal)
    .delete(protect, validate(dealParamsSchema), deleteDeal);

export default router;
