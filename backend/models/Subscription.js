import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            unique: true,
        },
        plan: {
            type: String,
            enum: [
                "free",
                "growth",
                "pro",
                "enterprise",
                "premium_exporter",
                "verified_supplier",
                "ai_insights",
                "ai_pro",
            ],
            default: "free",
        },
        status: {
            type: String,
            enum: ["inactive", "active", "past_due", "cancelled"],
            default: "inactive",
        },
        billingStatus: {
            type: String,
            enum: ["not_required", "pending", "paid", "past_due", "cancelled", "failed"],
            default: "not_required",
        },
        provider: {
            type: String,
            enum: ["manual", "razorpay", "stripe"],
            default: "manual",
        },
        providerCustomerId: {
            type: String,
            trim: true,
            default: "",
        },
        providerSubscriptionId: {
            type: String,
            trim: true,
            default: "",
        },
        currentPeriodEnd: {
            type: Date,
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            default: "monthly",
        },
        aiCredits: {
            type: Number,
            min: 0,
            default: 10,
        },
        buyerUnlocksUsed: {
            type: Number,
            min: 0,
            default: 0,
        },
        productLimit: {
            type: Number,
            default: 5,
        },
        inquiryLimit: {
            type: Number,
            default: 10,
        },
        latestOrderId: {
            type: String,
            trim: true,
            default: "",
        },
        usage: {
            copilot: {
                count: { type: Number, min: 0, default: 0 },
                resetAt: { type: Date },
            },
            reports: {
                count: { type: Number, min: 0, default: 0 },
                resetAt: { type: Date },
            },
            reportDownloads: {
                count: { type: Number, min: 0, default: 0 },
                resetAt: { type: Date },
            },
            hsCodeSearch: {
                count: { type: Number, min: 0, default: 0 },
                resetAt: { type: Date },
            },
            countryComparison: {
                count: { type: Number, min: 0, default: 0 },
                resetAt: { type: Date },
            },
            buyerSearch: {
                count: { type: Number, min: 0, default: 0 },
                resetAt: { type: Date },
            },
        },
        paymentHistory: [
            {
                provider: { type: String, trim: true, default: "razorpay" },
                orderId: { type: String, trim: true, default: "" },
                paymentId: { type: String, trim: true, default: "" },
                amount: { type: Number, default: 0 },
                currency: { type: String, trim: true, default: "INR" },
                status: { type: String, trim: true, default: "created" },
                plan: { type: String, trim: true, default: "" },
                paidAt: { type: Date },
            },
        ],
    },
    {
        timestamps: true,
    },
);

subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ organizationId: 1, "usage.copilot.resetAt": 1 });
subscriptionSchema.index({ organizationId: 1, "usage.reports.resetAt": 1 });
subscriptionSchema.index({ organizationId: 1, "usage.reportDownloads.resetAt": 1 });
subscriptionSchema.index({ organizationId: 1, "usage.hsCodeSearch.resetAt": 1 });
subscriptionSchema.index({ organizationId: 1, "usage.countryComparison.resetAt": 1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
