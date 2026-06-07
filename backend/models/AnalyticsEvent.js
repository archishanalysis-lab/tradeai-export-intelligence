import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
    {
        event: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80,
        },
        properties: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        path: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        href: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        userId: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "anonymous",
        },
        sessionId: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        performanceTime: {
            type: Number,
            default: 0,
        },
        ts: {
            type: Date,
            default: Date.now,
        },
        receivedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

analyticsEventSchema.index({ event: 1, createdAt: -1 });
analyticsEventSchema.index({ sessionId: 1, createdAt: -1 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

export default AnalyticsEvent;
