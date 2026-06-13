import Buyer from "../models/Buyer.js";
import AiReport from "../models/AiReport.js";
import CompanyProfile from "../models/CompanyProfile.js";
import Contact from "../models/Contact.js";
import KycDocument from "../models/KycDocument.js";
import Inquiry from "../models/Inquiry.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { refreshCompanyReputation } from "../services/reputationService.js";

const getAdminOverview = async (req, res, next) => {
    try {
        const [
            users,
            suspendedUsers,
            buyers,
            verifiedBuyers,
            products,
            pendingProducts,
            inquiries,
            pendingInquiries,
            pendingKyc,
            verifiedCompanies,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: "suspended" }),
            Buyer.countDocuments(),
            Buyer.countDocuments({ verified: true }),
            Product.countDocuments(),
            Product.countDocuments({ approvalStatus: "pending" }),
            Inquiry.countDocuments(),
            Inquiry.countDocuments({ status: "pending" }),
            KycDocument.countDocuments({ status: "submitted" }),
            CompanyProfile.countDocuments({ verificationStatus: "verified" }),
        ]);

        res.json({
            users,
            suspendedUsers,
            buyers,
            verifiedBuyers,
            products,
            pendingProducts,
            inquiries,
            pendingInquiries,
            pendingKyc,
            verifiedCompanies,
        });
    } catch (error) {
        next(error);
    }
};

const listCompanyProfiles = async (req, res, next) => {
    try {
        const profiles = await CompanyProfile.find()
            .populate("owner", "name email")
            .sort({ updatedAt: -1 })
            .limit(80)
            .lean();

        res.json({ profiles });
    } catch (error) {
        next(error);
    }
};

const listKycDocuments = async (req, res, next) => {
    try {
        const documents = await KycDocument.find(req.query.status ? { status: req.query.status } : {})
            .populate("companyProfile", "companyName publicSlug roleType verificationStatus")
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.json({ documents });
    } catch (error) {
        next(error);
    }
};

const listContactFeedback = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, feedbackType, priority } = req.query;
        const numericLimit = Math.min(Number(limit) || 20, 100);
        const numericPage = Number(page) || 1;
        const skip = (numericPage - 1) * numericLimit;
        const query = {
            ...(status ? { status } : {}),
            ...(feedbackType ? { feedbackType } : {}),
            ...(priority ? { priority } : {}),
        };

        const [feedback, total] = await Promise.all([
            Contact.find(query)
                .populate("reviewedBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(numericLimit)
                .lean(),
            Contact.countDocuments(query),
        ]);

        res.json({
            feedback,
            page: numericPage,
            pages: Math.max(Math.ceil(total / numericLimit), 1),
            total,
        });
    } catch (error) {
        next(error);
    }
};

const updateContactFeedbackStatus = async (req, res, next) => {
    try {
        const { status, adminNotes = "" } = req.body;

        const feedback = await Contact.findByIdAndUpdate(
            req.params.id,
            {
                status,
                adminNotes,
                reviewedBy: req.user._id,
                reviewedAt: new Date(),
            },
            { new: true, runValidators: true },
        ).populate("reviewedBy", "name email");

        if (!feedback) {
            res.status(404);
            throw new Error("Contact feedback not found");
        }

        res.json({ feedback });
    } catch (error) {
        next(error);
    }
};

const reviewKycDocument = async (req, res, next) => {
    try {
        const { status, adminNotes = "" } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            res.status(400);
            throw new Error("Invalid KYC review status");
        }

        const document = await KycDocument.findByIdAndUpdate(
            req.cleanParams.id,
            {
                status,
                adminNotes,
                reviewedBy: req.user._id,
                reviewedAt: new Date(),
            },
            { new: true },
        ).populate("companyProfile");

        if (!document) {
            res.status(404);
            throw new Error("KYC document not found");
        }

        const approvedCount = await KycDocument.countDocuments({
            companyProfile: document.companyProfile._id,
            status: "approved",
        });
        const submittedCount = await KycDocument.countDocuments({
            companyProfile: document.companyProfile._id,
            status: "submitted",
        });

        const update = {
            kycStatus: submittedCount ? "submitted" : approvedCount ? "verified" : "rejected",
            verificationStatus: approvedCount >= 2 ? "verified" : status === "rejected" ? "rejected" : "pending",
        };

        await CompanyProfile.findByIdAndUpdate(document.companyProfile._id, update);
        await refreshCompanyReputation(document.companyProfile._id);

        res.json({ document, profileStatus: update });
    } catch (error) {
        next(error);
    }
};

const listAdminUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ users });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!["active", "suspended"].includes(status)) {
            res.status(400);
            throw new Error("Invalid user status");
        }

        const user = await User.findByIdAndUpdate(
            req.cleanParams.id,
            { status },
            { new: true },
        ).select("-password");

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

const listAdminBuyers = async (req, res, next) => {
    try {
        const buyers = await Buyer.find().sort({ createdAt: -1 }).limit(50).lean();
        res.json({ buyers });
    } catch (error) {
        next(error);
    }
};

const verifyBuyer = async (req, res, next) => {
    try {
        const buyer = await Buyer.findByIdAndUpdate(
            req.cleanParams.id,
            { verified: true },
            { new: true },
        );

        if (!buyer) {
            res.status(404);
            throw new Error("Buyer not found");
        }

        res.json(buyer);
    } catch (error) {
        next(error);
    }
};

const listAdminProducts = async (req, res, next) => {
    try {
        const products = await Product.find()
            .populate("createdBy", "name email company")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ products });
    } catch (error) {
        next(error);
    }
};

const updateProductApproval = async (req, res, next) => {
    try {
        const { approvalStatus } = req.body;

        if (!["pending", "approved", "rejected"].includes(approvalStatus)) {
            res.status(400);
            throw new Error("Invalid product approval status");
        }

        const product = await Product.findByIdAndUpdate(
            req.cleanParams.id,
            { approvalStatus },
            { new: true },
        );

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

const listAdminInquiries = async (req, res, next) => {
    try {
        const inquiries = await Inquiry.find()
            .populate("product", "name category hsCode")
            .sort({ updatedAt: -1 })
            .limit(50)
            .lean();

        res.json({ inquiries });
    } catch (error) {
        next(error);
    }
};

const listAdminReports = async (req, res, next) => {
    try {
        const reports = await AiReport.find()
            .populate("createdBy", "name email company")
            .populate("organizationId", "name")
            .select("-answer")
            .sort({ createdAt: -1 })
            .limit(80)
            .lean();

        res.json({ reports });
    } catch (error) {
        next(error);
    }
};

export {
    getAdminOverview,
    listContactFeedback,
    listCompanyProfiles,
    listAdminBuyers,
    listAdminInquiries,
    listAdminProducts,
    listAdminReports,
    listAdminUsers,
    listKycDocuments,
    reviewKycDocument,
    updateContactFeedbackStatus,
    updateProductApproval,
    updateUserStatus,
    verifyBuyer,
};
