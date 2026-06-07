import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
        },
        provider: {
            type: String,
            enum: ["razorpay", "stripe", "manual"],
            default: "razorpay",
        },
        plan: {
            type: String,
            trim: true,
            required: true,
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            default: "monthly",
        },
        orderId: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        paymentId: {
            type: String,
            trim: true,
            default: "",
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            trim: true,
            default: "INR",
        },
        status: {
            type: String,
            enum: ["created", "paid", "failed", "refunded", "expired"],
            default: "created",
        },
        invoiceUrl: {
            type: String,
            trim: true,
            default: "",
        },
        failureReason: {
            type: String,
            trim: true,
            default: "",
        },
        rawPayload: {
            type: mongoose.Schema.Types.Mixed,
        },
        paidAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

paymentSchema.index({ organizationId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, provider: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
