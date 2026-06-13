import mongoose from "mongoose";

const marketplaceIntroRequestSchema = new mongoose.Schema(
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
        requestType: {
            type: String,
            enum: [
                "supplier_intro",
                "buyer_intro",
                "importer_intro",
                "product_inquiry",
                "company_profile_intro",
                "partnership",
                "other",
            ],
            required: true,
        },
        targetType: {
            type: String,
            enum: ["company", "supplier", "importer", "product", "buyer", "unknown"],
            default: "unknown",
        },
        targetId: {
            type: String,
            trim: true,
            default: "",
        },
        targetSlug: {
            type: String,
            trim: true,
            default: "",
        },
        targetName: {
            type: String,
            trim: true,
            default: "",
        },
        country: {
            type: String,
            trim: true,
            default: "",
        },
        industry: {
            type: String,
            trim: true,
            default: "",
        },
        product: {
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
            default: "marketplace",
        },
        status: {
            type: String,
            enum: ["new", "reviewed", "action_required", "contacted", "closed"],
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

marketplaceIntroRequestSchema.index({ status: 1, createdAt: -1 });
marketplaceIntroRequestSchema.index({ status: 1, priority: 1, createdAt: -1 });
marketplaceIntroRequestSchema.index({ requestType: 1, targetType: 1 });
marketplaceIntroRequestSchema.index({ email: 1, createdAt: -1 });

const MarketplaceIntroRequest = mongoose.model(
    "MarketplaceIntroRequest",
    marketplaceIntroRequestSchema,
);

export default MarketplaceIntroRequest;
