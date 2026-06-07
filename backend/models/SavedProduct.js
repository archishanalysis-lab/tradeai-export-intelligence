import mongoose from "mongoose";

const savedProductSchema = new mongoose.Schema(
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
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

savedProductSchema.index({ organizationId: 1, product: 1 }, { unique: true });

const SavedProduct = mongoose.model("SavedProduct", savedProductSchema);

export default SavedProduct;
