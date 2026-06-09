import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { apiRateLimit, sanitizeRequest, securityHeaders } from "./middleware/securityMiddleware.js";

/* ROUTES */

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import copilotRoutes from "./routes/copilot.js";
import dealRoutes from "./routes/dealRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import marketplaceIntroRoutes from "./routes/marketplaceIntroRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reportRequestRoutes from "./routes/reportRequestRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import savedItemRoutes from "./routes/savedItemRoutes.js";
import tradeDataRoutes from "./routes/tradeDataRoutes.js";
import tradeNewsRoutes from "./routes/tradeNewsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

/* DATABASE CONNECTION */

connectDB();

const app = express();

/* MIDDLEWARE */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const configuredOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const localOrigins = ["http://localhost:5500", "http://127.0.0.1:5500"];
const allowedOrigins =
    process.env.NODE_ENV === "production"
        ? configuredOrigins
        : Array.from(new Set([...localOrigins, ...configuredOrigins]));

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
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

/* AUTH ROUTES */

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/marketplace-intros", marketplaceIntroRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/report-requests", reportRequestRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/saved-items", savedItemRoutes);
app.use("/api/trade-data", tradeDataRoutes);
app.use("/api/trade-news", tradeNewsRoutes);
app.use("/api/copilot", copilotRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/uploads", express.static("uploads"));

app.use(notFound);

app.use(errorHandler);

/* PORT */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
