import express from "express";

import {
    createBuyer,
    getBuyers,
    getBuyerById,
    updateBuyer,
    deleteBuyer,
} from "../controllers/buyerController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
    buyerCreateSchema,
    buyerParamsSchema,
    buyerQuerySchema,
    buyerUpdateSchema,
} from "../utils/validators.js";

const router = express.Router();

/* =========================================
   ALL BUYERS
========================================= */

router
    .route("/")
    .get(protect, validate(buyerQuerySchema), getBuyers)
    .post(protect, validate(buyerCreateSchema), createBuyer);

/* =========================================
   SINGLE BUYER
========================================= */

router
    .route("/:id")
    .get(protect, validate(buyerParamsSchema), getBuyerById)
    .put(protect, validate(buyerUpdateSchema), updateBuyer)
    .delete(protect, validate(buyerParamsSchema), deleteBuyer);

export default router;
