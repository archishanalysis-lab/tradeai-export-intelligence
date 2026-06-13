import mongoose from "mongoose";

const slugify = (value) =>
    (value || "tradeai-company")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 90);

const companyProfileSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            unique: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        roleType: {
            type: String,
            enum: ["exporter", "importer", "explorer", "admin", "consultant", "sme"],
            default: "explorer",
        },
        companyName: {
            type: String,
            trim: true,
            default: "",
        },
        publicSlug: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true,
        },
        contactPerson: {
            type: String,
            trim: true,
            default: "",
        },
        industry: {
            type: String,
            trim: true,
            default: "",
        },
        businessType: {
            type: String,
            trim: true,
            default: "",
        },
        yearEstablished: {
            type: Number,
            min: 1800,
            max: 2100,
        },
        employeeCount: {
            type: String,
            trim: true,
            default: "",
        },
        country: {
            type: String,
            trim: true,
            default: "",
        },
        state: {
            type: String,
            trim: true,
            default: "",
        },
        city: {
            type: String,
            trim: true,
            default: "",
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },
        website: {
            type: String,
            trim: true,
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        whatsapp: {
            type: String,
            trim: true,
            default: "",
        },
        gstNumber: {
            type: String,
            trim: true,
            default: "",
        },
        iecNumber: {
            type: String,
            trim: true,
            default: "",
        },
        exportCategories: {
            type: [String],
            default: [],
        },
        interestedProducts: {
            type: [String],
            default: [],
        },
        mainProducts: {
            type: [String],
            default: [],
        },
        hsCodes: {
            type: [String],
            default: [],
        },
        exportCountries: {
            type: [String],
            default: [],
        },
        importCountries: {
            type: [String],
            default: [],
        },
        targetMarkets: {
            type: [String],
            default: [],
        },
        preferredSupplierCountries: {
            type: [String],
            default: [],
        },
        buyingQuantity: {
            type: String,
            trim: true,
            default: "",
        },
        moq: {
            type: String,
            trim: true,
            default: "",
        },
        annualRevenue: {
            type: String,
            trim: true,
            default: "",
        },
        productionCapacity: {
            type: String,
            trim: true,
            default: "",
        },
        certificates: {
            type: [String],
            default: [],
        },
        logoUrl: {
            type: String,
            trim: true,
            default: "",
        },
        bannerUrl: {
            type: String,
            trim: true,
            default: "",
        },
        catalogPdfUrl: {
            type: String,
            trim: true,
            default: "",
        },
        gallery: {
            type: [String],
            default: [],
        },
        kycDocuments: {
            type: [String],
            default: [],
        },
        kycStatus: {
            type: String,
            enum: ["not_submitted", "submitted", "verified", "rejected"],
            default: "not_submitted",
        },
        about: {
            type: String,
            trim: true,
            default: "",
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        ratingAverage: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        reviewsCount: {
            type: Number,
            min: 0,
            default: 0,
        },
        responseRate: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        averageResponseHours: {
            type: Number,
            min: 0,
            default: 0,
        },
        fulfillmentScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        reliabilityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        profileCompletion: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

companyProfileSchema.index({ roleType: 1, verificationStatus: 1 });
companyProfileSchema.index({ isFeatured: 1, roleType: 1 });
companyProfileSchema.index({ roleType: 1, country: 1, industry: 1 });
companyProfileSchema.index({ verificationStatus: 1, updatedAt: -1 });
companyProfileSchema.index({
    companyName: "text",
    country: "text",
    state: "text",
    city: "text",
    industry: "text",
    exportCategories: "text",
    interestedProducts: "text",
    mainProducts: "text",
    hsCodes: "text",
});

companyProfileSchema.pre("validate", function ensurePublicSlug() {
    if (!this.publicSlug && this.companyName) {
        this.publicSlug = `${slugify(this.companyName)}-${this._id.toString().slice(-6)}`;
    }
});

const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchema);

export default CompanyProfile;
