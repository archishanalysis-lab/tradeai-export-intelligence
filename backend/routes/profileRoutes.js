import express from "express";

import { getMyProfile, submitKycDocuments, updateMyProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/me").get(protect, getMyProfile).put(protect, updateMyProfile);
router.post("/kyc", protect, submitKycDocuments);

export default router;
