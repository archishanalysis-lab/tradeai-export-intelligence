import mongoose from "mongoose";

const savedCompanySchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        companyProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompanyProfile",
            required: true,
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
        followed: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

savedCompanySchema.index(
    { organizationId: 1, companyProfile: 1 },
    { unique: true },
);
savedCompanySchema.index({ organizationId: 1, user: 1, createdAt: -1 });

const SavedCompany = mongoose.model("SavedCompany", savedCompanySchema);

export default SavedCompany;
