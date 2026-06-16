import mongoose from "mongoose";

const reportExportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            index: true,
        },
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Report",
        },
        reportType: {
            type: String,
            trim: true,
            required: true,
            index: true,
        },
        country: {
            type: String,
            trim: true,
            default: "",
        },
        productCategory: {
            type: String,
            trim: true,
            default: "",
        },
        hsCode: {
            type: String,
            trim: true,
            default: "",
        },
        sourceDataType: {
            type: String,
            trim: true,
            default: "sample/manual",
        },
        format: {
            type: String,
            enum: ["csv"],
            default: "csv",
        },
        downloadCount: {
            type: Number,
            default: 1,
            min: 1,
        },
    },
    {
        timestamps: true,
    },
);

reportExportSchema.index({ userId: 1, createdAt: -1 });
reportExportSchema.index({ userId: 1, reportType: 1, createdAt: -1 });

const ReportExport = mongoose.model("ReportExport", reportExportSchema);

export default ReportExport;
