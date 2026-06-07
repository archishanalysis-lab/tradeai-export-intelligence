import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
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
        feedbackType: {
            type: String,
            enum: ["UI", "Business model", "MVP features", "Technical review", "Pricing", "Market opportunity", "Partnership", ""],
            trim: true,
            default: "",
        },
        priority: {
            type: String,
            enum: ["High priority", "Medium priority", "Low priority", "Very useful", "Needs work", ""],
            trim: true,
            default: "",
        },
        subject: {
            type: String,
            trim: true,
            default: "TradeAI stakeholder feedback",
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        source: {
            type: String,
            trim: true,
            default: "mvp-feedback",
        },
        interest: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["new", "reviewed", "action_required", "closed"],
            default: "new",
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

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ feedbackType: 1, priority: 1 });
contactSchema.index({ email: 1, createdAt: -1 });

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
