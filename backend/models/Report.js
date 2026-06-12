import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    productName: {
        type: String,
        trim: true,
        default: "",
    },
    hsCode: {
        type: String,
        trim: true,
        default: "",
    },
    targetCountry: {
        type: String,
        trim: true,
        default: "",
    },
    businessType: {
        type: String,
        trim: true,
        default: "",
    },
    reportData: {
        type: Object,
        default: {},
    },
    isDemo: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

reportSchema.index({ userId: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
