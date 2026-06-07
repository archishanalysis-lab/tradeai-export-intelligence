import mongoose from "mongoose";

const kycDocumentSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        companyProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompanyProfile",
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        documentType: {
            type: String,
            enum: ["gst", "iec", "pan", "business_license", "certificate", "other"],
            required: true,
        },
        documentUrl: {
            type: String,
            trim: true,
            required: true,
        },
        documentNumber: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["submitted", "approved", "rejected"],
            default: "submitted",
        },
        adminNotes: {
            type: String,
            trim: true,
            default: "",
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

kycDocumentSchema.index({ organizationId: 1, status: 1 });
kycDocumentSchema.index({ companyProfile: 1, documentType: 1 });

const KycDocument = mongoose.model("KycDocument", kycDocumentSchema);

export default KycDocument;
