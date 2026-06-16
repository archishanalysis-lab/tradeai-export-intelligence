import mongoose from "mongoose";

const copilotMessageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            index: true,
        },
        question: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        response: {
            type: Object,
            default: {},
        },
        providerLabel: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

copilotMessageSchema.index({ userId: 1, createdAt: -1 });
copilotMessageSchema.index({ organizationId: 1, createdAt: -1 });

const CopilotMessage = mongoose.model("CopilotMessage", copilotMessageSchema);

export default CopilotMessage;
