import mongoose from "mongoose";

const savedItemSchema = new mongoose.Schema(
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
        itemType: {
            type: String,
            enum: ["buyer", "supplier", "product", "market"],
            required: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Buyer",
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        title: {
            type: String,
            trim: true,
            default: "",
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

savedItemSchema.index({ organizationId: 1, itemType: 1, createdAt: -1 });
savedItemSchema.index({ organizationId: 1, buyer: 1 }, { unique: true, sparse: true });

const SavedItem = mongoose.model("SavedItem", savedItemSchema);

export default SavedItem;
