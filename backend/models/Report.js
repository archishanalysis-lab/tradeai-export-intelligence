import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    productName: {
        type: String,
        trim: true,
        default: "",
    },
    hsCode: {
        type: String,
        trim: true,
        default: "",
    },
    targetCountry: {
        type: String,
        trim: true,
        default: "",
    },
    originCountry: {
        type: String,
        trim: true,
        default: "India",
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        index: true,
    },
    businessType: {
        type: String,
        trim: true,
        default: "",
    },
    reportData: {
        type: Object,
        default: {},
    },
    isDemo: {
        type: Boolean,
        default: true,
    },
    reportType: {
        type: String,
        trim: true,
        default: "trade-readiness",
    },
    sourceDataType: {
        type: String,
        trim: true,
        default: "sample/manual",
    },
    idempotencyKey: {
        type: String,
        trim: true,
        maxlength: 128,
    },
    downloadCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ userId: 1, hsCode: 1, createdAt: -1 });
reportSchema.index({ organizationId: 1, createdAt: -1 });
reportSchema.index(
    { userId: 1, reportType: 1, idempotencyKey: 1 },
    {
        unique: true,
        partialFilterExpression: { idempotencyKey: { $type: "string" } },
    },
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
