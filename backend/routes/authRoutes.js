import express from "express";

import {
    getMe,
    loginUser,
    registerUser,
    requestPasswordReset,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
    authForgotPasswordSchema,
    authLoginSchema,
    authRegisterSchema,
} from "../utils/validators.js";

const router = express.Router();

router.post("/register", validate(authRegisterSchema), registerUser);

router.post("/login", validate(authLoginSchema), loginUser);

router.post("/forgot-password", validate(authForgotPasswordSchema), requestPasswordReset);

router.get("/me", protect, getMe);

export default router;
