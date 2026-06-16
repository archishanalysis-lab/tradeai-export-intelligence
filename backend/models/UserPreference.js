import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            index: true,
        },
        profile: {
            fullName: { type: String, trim: true, maxlength: 120, default: "" },
            email: { type: String, trim: true, lowercase: true, maxlength: 160, default: "" },
            company: { type: String, trim: true, maxlength: 160, default: "" },
        },
        notifications: {
            emailNotifications: { type: Boolean, default: true },
            aiMarketAlerts: { type: Boolean, default: true },
            buyerUpdates: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
    },
);

userPreferenceSchema.index({ organizationId: 1, updatedAt: -1 });

const UserPreference = mongoose.model("UserPreference", userPreferenceSchema);

export default UserPreference;
