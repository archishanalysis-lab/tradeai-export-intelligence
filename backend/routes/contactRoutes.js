import express from "express";

import { createContactMessage } from "../controllers/contactController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { contactCreateSchema } from "../utils/validators.js";

const router = express.Router();

router.post("/", validate(contactCreateSchema), createContactMessage);

export default router;
