import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { apiRateLimit, sanitizeRequest, securityHeaders } from "./middleware/securityMiddleware.js";
import { shouldServeLocalUploads, warnIfCloudinaryMissingInProduction } from "./services/uploadService.js";

/* ROUTES */

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import complianceRoutes from "./routes/complianceRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
// Canonical Copilot router: protected ask/history flow with persistence and usage limits.
import copilotRoutes from "./routes/copilot.js";
import dealRoutes from "./routes/dealRoutes.js";
import guideRoutes from "./routes/guideRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import marketplaceIntroRoutes from "./routes/marketplaceIntroRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import userPreferenceRoutes from "./routes/userPreferenceRoutes.js";
import reportRequestRoutes from "./routes/reportRequestRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import savedItemRoutes from "./routes/savedItemRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import tradeDataRoutes from "./routes/tradeDataRoutes.js";
import tradeNewsRoutes from "./routes/tradeNewsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

/* MIDDLEWARE */

app.use(
    express.json({
        verify: (req, res, buffer) => {
            if (req.originalUrl === "/api/billing/webhook/razorpay") {
                req.rawBody = buffer;
            }
        },
    }),
);
app.use(express.urlencoded({ extended: true }));

const configuredOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const defaultFrontendOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://tradeai-export-intelligence.vercel.app",
];
const allowedOrigins = Array.from(new Set([...defaultFrontendOrigins, ...configuredOrigins]));

// CORS is credentials-enabled, so only exact trusted origins are allowed.
// Vercel preview URLs must be manually added to FRONTEND_URL as comma-separated exact origins.
// Wildcard or pattern-based vercel.app origins are intentionally not allowed.
const isAllowedOrigin = (origin = "") => allowedOrigins.includes(origin);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    }),
);

app.use(morgan("dev"));

app.use(securityHeaders);
app.use(apiRateLimit());
app.use(sanitizeRequest);

/* MAIN ROUTE */

app.get("/", (req, res) => {
  res.send("TradeAI API Running...");
});

app.get("/health", (req, res) => {
    const databaseState = mongoose.connection.readyState === 1 ? "connected" : "not_connected";

    res.set("Cache-Control", "no-store");
    res.json({
        status: "ok",
        service: "TradeAI API",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "local",
        database: databaseState,
        integrations: {
            comtradeConfigured: Boolean(process.env.COMTRADE_API_KEY || process.env.COMTRADE_PRIMARY_KEY),
        },
    });
});

app.get("/api/health", (req, res) => {
    const databaseState = mongoose.connection.readyState === 1 ? "connected" : "not_connected";

    res.set("Cache-Control", "no-store");
    res.json({
        status: "ok",
        service: "TradeAI API",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "local",
        database: databaseState,
        integrations: {
            comtradeConfigured: Boolean(process.env.COMTRADE_API_KEY || process.env.COMTRADE_PRIMARY_KEY),
        },
    });
});

/* AUTH ROUTES */

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/guide", guideRoutes);
app.use("/api/products", productRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/preferences", userPreferenceRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/marketplace-intros", marketplaceIntroRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/report-requests", reportRequestRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/saved-items", savedItemRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/trade-data", tradeDataRoutes);
app.use("/api/trade-news", tradeNewsRoutes);
app.use("/api/copilot", copilotRoutes);
app.use("/api/uploads", uploadRoutes);

if (shouldServeLocalUploads()) {
    app.use("/uploads", express.static("uploads"));
}

app.use(notFound);

app.use(errorHandler);

/* PORT */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    warnIfCloudinaryMissingInProduction();

    app.listen(PORT, () => {
        console.log(`TradeAI API running on port ${PORT}`);
        console.log(`Health checks available at /health and /api/health`);
        console.log(`CORS allows ${allowedOrigins.length} exact configured origin(s).`);
    });
};

startServer();
