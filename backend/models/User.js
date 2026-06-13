import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
            default: "",
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
        },
        team: {
            type: String,
            trim: true,
            default: "",
        },
        role: {
            type: String,
            enum: ["admin", "explorer", "exporter", "importer", "consultant", "sme"],
            default: "explorer",
        },
        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active",
        },
        isDemo: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.index({ organizationId: 1, role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1, status: 1, createdAt: -1 });
userSchema.index({ isDemo: 1 });

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
