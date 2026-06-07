import Inquiry from "../models/Inquiry.js";
import Product from "../models/Product.js";
import { sendEmail } from "../services/emailService.js";
import { assertCanAccess, userScopeFilter } from "../utils/ownership.js";

const getInquiries = async (req, res, next) => {
    try {
        const status = req.query.status;
        const query = {
            ...userScopeFilter(req.user, "exporter"),
            ...(status ? { status } : {}),
        };

        const inquiries = await Inquiry.find(query)
            .populate("buyer", "companyName country industry contactEmail")
            .populate("product", "name category hsCode imageUrl")
            .sort({ updatedAt: -1 });

        res.json({ inquiries, total: inquiries.length });
    } catch (error) {
        next(error);
    }
};

const createInquiry = async (req, res, next) => {
    try {
        const product = await Product.findById(req.body.product);

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        const inquiry = await Inquiry.create({
            buyer: req.body.buyer || undefined,
            product: product._id,
            exporter: product.createdBy,
            buyerName: req.body.buyerName,
            buyerEmail: req.body.buyerEmail,
            companyName: req.body.companyName,
            message: req.body.message,
            createdBy: req.user?._id,
            organizationId: product.organizationId || req.user?.organizationId,
            negotiationMessages: req.body.message
                ? [{ sender: "buyer", message: req.body.message }]
                : [],
        });

        await sendEmail({
            to: req.body.exporterEmail,
            subject: `New inquiry for ${product.name}`,
            message: req.body.message,
        });

        res.status(201).json(inquiry);
    } catch (error) {
        next(error);
    }
};

const getInquiryById = async (req, res, next) => {
    try {
        const inquiry = await Inquiry.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user, "exporter"),
        })
            .populate("buyer", "companyName country industry contactEmail")
            .populate("product", "name category hsCode imageUrl");

        if (!inquiry) {
            res.status(404);
            throw new Error("Inquiry not found");
        }

        res.json(inquiry);
    } catch (error) {
        next(error);
    }
};

const updateInquiryStatus = async (req, res, next) => {
    try {
        const inquiry = await Inquiry.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user, "exporter"),
        });

        if (!inquiry) {
            res.status(404);
            throw new Error("Inquiry not found");
        }

        if (!assertCanAccess(inquiry, req.user, "exporter")) {
            res.status(403);
            throw new Error("Not authorized to update this inquiry");
        }

        inquiry.status = req.body.status ?? inquiry.status;
        const updatedInquiry = await inquiry.save();

        res.json(updatedInquiry);
    } catch (error) {
        next(error);
    }
};

const addInquiryMessage = async (req, res, next) => {
    try {
        const inquiry = await Inquiry.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user, "exporter"),
        });

        if (!inquiry) {
            res.status(404);
            throw new Error("Inquiry not found");
        }

        if (!assertCanAccess(inquiry, req.user, "exporter")) {
            res.status(403);
            throw new Error("Not authorized to message this inquiry");
        }

        if (!req.body.message) {
            res.status(400);
            throw new Error("Message is required");
        }

        inquiry.negotiationMessages.push({
            sender: req.body.sender || "exporter",
            message: req.body.message,
        });

        const updatedInquiry = await inquiry.save();

        res.json(updatedInquiry);
    } catch (error) {
        next(error);
    }
};

export {
    addInquiryMessage,
    createInquiry,
    getInquiries,
    getInquiryById,
    updateInquiryStatus,
};
