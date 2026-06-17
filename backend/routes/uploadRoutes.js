import express from "express";

import {
    uploadCatalog,
    uploadCertificate,
    uploadInvoice,
    uploadProductImage,
} from "../controllers/uploadController.js";

import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { requirePersistentUploadStorage } from "../services/uploadService.js";

const router = express.Router();

router.use(protect, requirePersistentUploadStorage);

router.post("/product-image", upload.single("file"), uploadProductImage);
router.post("/certificates", upload.single("file"), uploadCertificate);
router.post("/catalogs", upload.single("file"), uploadCatalog);
router.post("/invoices", upload.single("file"), uploadInvoice);

export default router;
