import express from "express";

import {
    createProduct,
    deleteProduct,
    getProductAnalytics,
    getProductById,
    getProductMatchesController,
    getProducts,
    updateProduct,
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
    productCreateSchema,
    productParamsSchema,
    productQuerySchema,
    productUpdateSchema,
} from "../utils/validators.js";

const router = express.Router();

router
    .route("/")
    .get(protect, validate(productQuerySchema), getProducts)
    .post(protect, validate(productCreateSchema), createProduct);

router.get("/analytics/summary", protect, getProductAnalytics);

router.get("/:id/matches", protect, validate(productParamsSchema), getProductMatchesController);

router
    .route("/:id")
    .get(protect, validate(productParamsSchema), getProductById)
    .put(protect, validate(productUpdateSchema), updateProduct)
    .delete(protect, validate(productParamsSchema), deleteProduct);

export default router;
