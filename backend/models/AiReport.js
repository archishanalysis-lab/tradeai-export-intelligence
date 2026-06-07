import mongoose from "mongoose";

const aiReportSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            trim: true,
            required: true,
        },
        reportType: {
            type: String,
            enum: ["buyer_opportunity", "market_forecast", "hs_code_demand", "pricing", "custom"],
            default: "custom",
        },
        prompt: {
            type: String,
            trim: true,
            required: true,
        },
        product: {
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
        answer: {
            type: String,
            trim: true,
            default: "",
        },
        suggestedActions: {
            type: [String],
            default: [],
        },
        provider: {
            type: String,
            trim: true,
            default: "local-rule-engine",
        },
        exportFormats: {
            type: [String],
            default: ["pdf", "csv"],
        },
        status: {
            type: String,
            enum: ["generated", "failed"],
            default: "generated",
        },
    },
    {
        timestamps: true,
    },
);

aiReportSchema.index({ organizationId: 1, createdAt: -1 });
aiReportSchema.index({ reportType: 1, hsCode: 1, targetCountry: 1 });

const AiReport = mongoose.model("AiReport", aiReportSchema);

export default AiReport;
