import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Buyer",
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        inquiry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inquiry",
        },
        companyName: {
            type: String,
            trim: true,
            default: "",
        },
        contactName: {
            type: String,
            trim: true,
            default: "",
        },
        contactEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        country: {
            type: String,
            trim: true,
            default: "",
        },
        value: {
            type: Number,
            min: 0,
            default: 0,
        },
        currency: {
            type: String,
            trim: true,
            uppercase: true,
            default: "USD",
        },
        stage: {
            type: String,
            enum: [
                "lead_generated",
                "contacted",
                "qualified",
                "quotation_sent",
                "negotiation",
                "won",
                "completed",
                "lost",
            ],
            default: "lead_generated",
        },
        probability: {
            type: Number,
            min: 0,
            max: 100,
            default: 20,
        },
        nextAction: {
            type: String,
            trim: true,
            default: "",
        },
        expectedCloseDate: {
            type: Date,
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    },
);

dealSchema.index({ organizationId: 1, stage: 1, updatedAt: -1 });
dealSchema.index({ createdBy: 1, stage: 1 });
dealSchema.index({ title: "text", companyName: "text", country: "text" });

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
