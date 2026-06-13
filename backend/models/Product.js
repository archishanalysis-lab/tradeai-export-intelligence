import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        hsCode: {
            type: String,
            trim: true,
            default: "",
        },
        imageUrl: {
            type: String,
            trim: true,
            default: "",
        },
        moq: {
            type: Number,
            default: 0,
            min: 0,
        },
        price: {
            amount: {
                type: Number,
                default: 0,
                min: 0,
            },
            currency: {
                type: String,
                trim: true,
                uppercase: true,
                default: "USD",
            },
        },
        exportCountry: {
            type: String,
            trim: true,
            default: "",
        },
        availability: {
            type: String,
            enum: ["available", "limited", "on_request", "out_of_stock"],
            default: "available",
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        isDemo: {
            type: Boolean,
            default: false,
        },
        targetCountries: {
            type: [String],
            default: [],
        },
        tags: {
            type: [String],
            default: [],
        },
        keywords: {
            type: [String],
            default: [],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
        },
    },
    {
        timestamps: true,
    },
);

productSchema.index({
    name: "text",
    category: "text",
    hsCode: "text",
    exportCountry: "text",
    tags: "text",
    keywords: "text",
});
productSchema.index({ organizationId: 1, category: 1, availability: 1 });
productSchema.index({ approvalStatus: 1 });
productSchema.index({ organizationId: 1, createdAt: -1 });
productSchema.index({ organizationId: 1, hsCode: 1, createdAt: -1 });
productSchema.index({ organizationId: 1, exportCountry: 1, category: 1 });
productSchema.index({ hsCode: 1, exportCountry: 1 });
productSchema.index({ isDemo: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
