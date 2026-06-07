import express from "express";

import { trackAnalyticsEvents } from "../controllers/analyticsController.js";

const router = express.Router();

router.post("/events", trackAnalyticsEvents);

export default router;
