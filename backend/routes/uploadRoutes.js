import express from "express";

import {
    uploadCatalog,
    uploadCertificate,
    uploadInvoice,
    uploadProductImage,
} from "../controllers/uploadController.js";

import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/product-image", protect, upload.single("file"), uploadProductImage);
router.post("/certificates", protect, upload.single("file"), uploadCertificate);
router.post("/catalogs", protect, upload.single("file"), uploadCatalog);
router.post("/invoices", protect, upload.single("file"), uploadInvoice);

export default router;
