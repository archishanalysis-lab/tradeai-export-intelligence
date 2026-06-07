import express from "express";

import { askCopilot } from "../controllers/copilotController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { copilotAskSchema } from "../utils/validators.js";

const router = express.Router();

router.post("/ask", protect, validate(copilotAskSchema), askCopilot);

export default router;
