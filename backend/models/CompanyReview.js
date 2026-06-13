import mongoose from "mongoose";

const companyReviewSchema = new mongoose.Schema(
    {
        companyProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompanyProfile",
            required: true,
        },
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    },
);

companyReviewSchema.index({ companyProfile: 1, reviewer: 1 }, { unique: true });
companyReviewSchema.index({ companyProfile: 1, status: 1 });
companyReviewSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

const CompanyReview = mongoose.model("CompanyReview", companyReviewSchema);

export default CompanyReview;
