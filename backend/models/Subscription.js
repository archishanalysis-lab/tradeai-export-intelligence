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
            enum: ["free", "premium_exporter", "verified_supplier", "ai_insights", "enterprise"],
            default: "free",
        },
        status: {
            type: String,
            enum: ["inactive", "active", "past_due", "cancelled"],
            default: "inactive",
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

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
