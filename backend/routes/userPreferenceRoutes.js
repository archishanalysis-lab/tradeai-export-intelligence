import express from "express";
import mongoose from "mongoose";

import UserPreference from "../models/UserPreference.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const normalizeString = (value, maxLength = 160) =>
    String(value || "").trim().slice(0, maxLength);

const buildDefaultPreferences = (user) => ({
    profile: {
        fullName: normalizeString(user?.name, 120),
        email: normalizeString(user?.email, 160).toLowerCase(),
        company: normalizeString(user?.company, 160),
    },
    notifications: {
        emailNotifications: true,
        aiMarketAlerts: true,
        buyerUpdates: false,
    },
});

const getAuthenticatedUserId = (req) => req.user?._id || req.user?.id || req.user?.userId || null;

const isValidObjectId = (value) =>
    Boolean(value) && mongoose.Types.ObjectId.isValid(String(value));

const buildPreferenceUpdate = (body = {}) => {
    const update = {};

    if (body.profile && typeof body.profile === "object") {
        update.profile = {
            fullName: normalizeString(body.profile.fullName, 120),
            email: normalizeString(body.profile.email, 160).toLowerCase(),
            company: normalizeString(body.profile.company, 160),
        };
    }

    if (body.notifications && typeof body.notifications === "object") {
        update.notifications = {
            emailNotifications: Boolean(body.notifications.emailNotifications),
            aiMarketAlerts: Boolean(body.notifications.aiMarketAlerts),
            buyerUpdates: Boolean(body.notifications.buyerUpdates),
        };
    }

    return update;
};

const isValidEmail = (value) =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

router.use(protect);

router.get("/", async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);
        const defaults = buildDefaultPreferences(req.user);

        if (!isValidObjectId(userId)) {
            res.status(401);
            throw new Error("Authentication required to view preferences.");
        }

        let preferences = await UserPreference.findOne({ userId }).lean();

        if (!preferences) {
            preferences = await UserPreference.create({
                userId,
                organizationId: req.user?.organizationId || undefined,
                ...defaults,
            });
        }

        res.json({ preferences });
    } catch (error) {
        next(error);
    }
});

router.put("/", async (req, res, next) => {
    try {
        const userId = getAuthenticatedUserId(req);
        const update = buildPreferenceUpdate(req.body);

        if (!isValidObjectId(userId)) {
            res.status(401);
            throw new Error("Authentication required to update preferences.");
        }

        if (!update.profile && !update.notifications) {
            res.status(400);
            throw new Error("Profile or notification preferences are required.");
        }

        if (update.profile && !isValidEmail(update.profile.email)) {
            res.status(400);
            throw new Error("Please enter a valid email address.");
        }

        const preferences = await UserPreference.findOneAndUpdate(
            { userId },
            {
                $set: {
                    organizationId: req.user?.organizationId || undefined,
                    ...update,
                },
                $setOnInsert: {
                    userId,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            },
        ).lean();

        res.json({ preferences });
    } catch (error) {
        next(error);
    }
});

export default router;
