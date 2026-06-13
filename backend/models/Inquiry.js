import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Buyer",
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        exporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        buyerName: {
            type: String,
            trim: true,
            default: "",
        },
        buyerEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        companyName: {
            type: String,
            trim: true,
            default: "",
        },
        message: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed"],
            default: "pending",
        },
        negotiationMessages: {
            type: [
                {
                    sender: {
                        type: String,
                        enum: ["buyer", "exporter", "system"],
                        default: "buyer",
                    },
                    message: {
                        type: String,
                        trim: true,
                        required: true,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            default: [],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
        },
        isDemo: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

inquirySchema.index({ exporter: 1, status: 1, updatedAt: -1 });
inquirySchema.index({ organizationId: 1, status: 1 });
inquirySchema.index({ organizationId: 1, updatedAt: -1 });
inquirySchema.index({ createdBy: 1, status: 1, createdAt: -1 });
inquirySchema.index({ product: 1, createdAt: -1 });
inquirySchema.index({ isDemo: 1 });

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
