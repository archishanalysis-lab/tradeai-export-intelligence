import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        plan: {
            type: String,
            enum: ["free", "premium_exporter", "verified_supplier", "ai_insights"],
            default: "free",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    },
);

organizationSchema.index({ plan: 1 });

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
