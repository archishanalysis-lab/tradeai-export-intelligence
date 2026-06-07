import express from "express";

import { getSavedItems, removeSavedItem, saveBuyer, saveCompany, saveProduct } from "../controllers/savedItemController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getSavedItems);
router.post("/buyers", protect, saveBuyer);
router.post("/companies", protect, saveCompany);
router.post("/products", protect, saveProduct);
router.delete("/:id", protect, removeSavedItem);

export default router;
