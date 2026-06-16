import mongoose from "mongoose";

// Demo-seed storage only. Do not present these records as live verified trade data.
const demoIntelligenceSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["corridor_insight", "hs_code_opportunity", "report_metadata"],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        corridor: {
            type: String,
            trim: true,
            default: "",
        },
        country: {
            type: String,
            trim: true,
            default: "",
        },
        sector: {
            type: String,
            trim: true,
            default: "",
        },
        hsCode: {
            type: String,
            trim: true,
            default: "",
        },
        sourceLabel: {
            type: String,
            trim: true,
            default: "TradeAI sample intelligence",
        },
        lastUpdatedLabel: {
            type: String,
            trim: true,
            default: "June 2026",
        },
        summary: {
            type: String,
            trim: true,
            default: "",
        },
        signals: {
            type: [String],
            default: [],
        },
        challenges: {
            type: [String],
            default: [],
        },
        suggestedActions: {
            type: [String],
            default: [],
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        isDemo: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

demoIntelligenceSchema.index({ type: 1, corridor: 1, hsCode: 1 });
demoIntelligenceSchema.index({ isDemo: 1 });

const DemoIntelligence = mongoose.model("DemoIntelligence", demoIntelligenceSchema);

export default DemoIntelligence;
