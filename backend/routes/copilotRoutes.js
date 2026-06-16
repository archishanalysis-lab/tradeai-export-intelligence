import express from "express";

import { askCopilot } from "../controllers/copilotController.js";
import { protect } from "../middleware/authMiddleware.js";
import { apiRateLimit } from "../middleware/securityMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { copilotAskSchema } from "../utils/validators.js";

const router = express.Router();
const copilotAskLimiter = apiRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
});

router.post("/ask", protect, copilotAskLimiter, validate(copilotAskSchema), askCopilot);

export default router;
