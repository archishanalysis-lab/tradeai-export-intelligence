import mongoose from "mongoose";

// Future placeholder: the active saved report flow uses Report/AiReport.
// Keep this model unmounted until a migration or route explicitly adopts it.
const generatedReportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        guestId: {
            type: String,
            trim: true,
            default: "",
        },
        requesterEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        productName: {
            type: String,
            trim: true,
            default: "",
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
        requestPayload: {
            type: Object,
            default: {},
        },
        report: {
            opportunityScore: { type: Number, min: 0, max: 100, default: 0 },
            marketPotential: { type: String, trim: true, default: "" },
            demandReason: { type: String, trim: true, default: "" },
            buyerType: { type: String, trim: true, default: "" },
            riskLevel: { type: String, trim: true, default: "" },
            complianceNotes: { type: String, trim: true, default: "" },
            suggestedNextActions: { type: [String], default: [] },
            dataSourceLabel: { type: String, trim: true, default: "" },
            isDemo: { type: Boolean, default: true },
            providerLabel: { type: String, trim: true, default: "" },
        },
    },
    {
        timestamps: true,
    },
);

generatedReportSchema.index({ userId: 1, createdAt: -1 });
generatedReportSchema.index({ guestId: 1, createdAt: -1 });
generatedReportSchema.index({ requesterEmail: 1, createdAt: -1 });

const GeneratedReport = mongoose.model("GeneratedReport", generatedReportSchema);

export default GeneratedReport;
