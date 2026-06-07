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

        industry: {
            type: String,
            required: true,
            trim: true,
        },

        products: {
            type: [String],
            default: [],
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
});
buyerSchema.index({ organizationId: 1, country: 1, industry: 1 });
buyerSchema.index({ tradeVolume: -1 });

const Buyer = mongoose.model("Buyer", buyerSchema);

export default Buyer;
