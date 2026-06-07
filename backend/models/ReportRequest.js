import mongoose from "mongoose";

const reportRequestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        company: {
            type: String,
            trim: true,
            default: "",
        },
        roleType: {
            type: String,
            enum: ["exporter", "importer", "consultant", "investor", "mentor", "technical reviewer", "other", ""],
            trim: true,
            default: "",
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
        originCountry: {
            type: String,
            required: true,
            trim: true,
        },
        targetCountry: {
            type: String,
            trim: true,
            default: "",
        },
        businessType: {
            type: String,
            trim: true,
            default: "",
        },
        reportObjective: {
            type: String,
            trim: true,
            default: "",
        },
        message: {
            type: String,
            trim: true,
            default: "",
        },
        source: {
            type: String,
            trim: true,
            default: "export-opportunity-report",
        },
        status: {
            type: String,
            enum: ["new", "reviewed", "action_required", "closed"],
            default: "new",
        },
        priority: {
            type: String,
            enum: ["High priority", "Medium priority", "Low priority", ""],
            trim: true,
            default: "",
        },
        adminNotes: {
            type: String,
            trim: true,
            default: "",
        },
        isDemo: {
            type: Boolean,
            default: false,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

reportRequestSchema.index({ status: 1, createdAt: -1 });
reportRequestSchema.index({ email: 1, createdAt: -1 });
reportRequestSchema.index({ productName: 1, targetCountry: 1 });
reportRequestSchema.index({ isDemo: 1 });

const ReportRequest = mongoose.model("ReportRequest", reportRequestSchema);

export default ReportRequest;
