import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true,
        },

        country: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            trim: true,
            default: "",
        },

        industry: {
            type: String,
            required: true,
            trim: true,
        },

        products: {
            type: [String],
            default: [],
        },

        productCategories: {
            type: [String],
            default: [],
        },

        hsCodes: {
            type: [String],
            default: [],
        },

        buyerType: {
            type: String,
            trim: true,
            default: "importer",
        },

        importerType: {
            type: String,
            trim: true,
            default: "",
        },

        website: {
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

        publicContactEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        verified: {
            type: Boolean,
            default: false,
        },
        tradeVolume: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastShipmentDate: {
            type: Date,
        },
        source: {
            type: String,
            enum: ["manual", "trade_data", "imported"],
            default: "manual",
        },
        sourceName: {
            type: String,
            trim: true,
            default: "",
        },
        sourceUrl: {
            type: String,
            trim: true,
            default: "",
        },
        sourceType: {
            type: String,
            enum: ["manual", "public-directory", "trade-fair", "paid-data", "user-submitted"],
            default: "user-submitted",
        },
        verificationStatus: {
            type: String,
            enum: ["unverified", "manually_verified", "claimed", "rejected"],
            default: "unverified",
        },
        lastVerifiedAt: {
            type: Date,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },
        isDemo: {
            type: Boolean,
            default: false,
        },
        isPublic: {
            type: Boolean,
            default: false,
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

buyerSchema.index({
    companyName: "text",
    country: "text",
    industry: "text",
    products: "text",
    productCategories: "text",
    hsCodes: "text",
});
buyerSchema.index({ organizationId: 1, country: 1, industry: 1 });
buyerSchema.index({ organizationId: 1, createdAt: -1 });
buyerSchema.index({ country: 1, industry: 1, verified: 1 });
buyerSchema.index({ tradeVolume: -1 });
buyerSchema.index({ isDemo: 1 });
buyerSchema.index({ isPublic: 1, country: 1, verificationStatus: 1 });
buyerSchema.index({ verificationStatus: 1, sourceType: 1, lastVerifiedAt: -1 });

const Buyer = mongoose.model("Buyer", buyerSchema);

export default Buyer;
