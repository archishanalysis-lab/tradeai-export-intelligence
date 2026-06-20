import Buyer from "../models/Buyer.js";
import {
    buildPagination,
    buildRangeFilter,
    buildSort,
    buildTextOrRegexSearch,
} from "../services/searchService.js";
import { assertCanAccess, userScopeFilter } from "../utils/ownership.js";

const buyerReadScope = (user) => {
    if (user.role === "admin") return {};

    return {
        $or: [
            ...(user.organizationId ? [{ organizationId: user.organizationId }] : [{ createdBy: user._id }]),
            { isPublic: true, verificationStatus: "manually_verified" },
        ],
    };
};

const getDataSourceCategory = (buyer) => {
    if (buyer.isDemo) return "Sample/demo";

    if (
        buyer.source === "trade_data" ||
        (buyer.verificationStatus === "manually_verified" && buyer.sourceName && buyer.sourceUrl)
    ) {
        return "Real/API-backed";
    }

    return "Curated/rule-engine";
};

const sanitizeBuyerForViewer = (buyer, user) => {
    const sameOrganization =
        buyer.organizationId && user.organizationId && String(buyer.organizationId) === String(user.organizationId);
    const isOwner = String(buyer.createdBy?._id || buyer.createdBy || "") === String(user._id);
    const canSeePrivateContact = user.role === "admin" || sameOrganization || isOwner;
    const sourceMetadata = {
        dataSourceCategory: getDataSourceCategory(buyer),
        contactAccess: canSeePrivateContact ? "organization-private" : "public-only",
    };

    if (canSeePrivateContact) {
        return { ...buyer, ...sourceMetadata };
    }

    const { contactEmail, phone, notes, ...publicBuyer } = buyer;
    return { ...publicBuyer, ...sourceMetadata };
};

/* =========================================
   GET ALL BUYERS
========================================= */

const getBuyers = async (req, res, next) => {

    try {
        const { page, limit, skip } = buildPagination(req.query, { limit: 8 });
        const sort = buildSort(req.query.sort || "-createdAt", [
            "createdAt",
            "companyName",
            "country",
            "industry",
            "tradeVolume",
        ]);
        const searchFilter = buildTextOrRegexSearch(req.query.search, [
                "companyName",
                "country",
                "industry",
                "products",
                "productCategories",
                "hsCodes",
            ]);
        const productFilter = buildTextOrRegexSearch(req.query.product, [
            "products",
            "productCategories",
            "industry",
        ]);
        const hsCodeFilter = buildTextOrRegexSearch(req.query.hsCode, ["hsCodes"]);
        const keyword = {
            $and: [buyerReadScope(req.user), searchFilter, productFilter, hsCodeFilter],
            ...(req.query.country ? { country: req.query.country } : {}),
            ...(req.query.industry ? { industry: req.query.industry } : {}),
            ...(req.query.verified ? { verified: req.query.verified === "true" } : {}),
            ...buildRangeFilter(req.query, "tradeVolume"),
        };

        const [buyers, total] = await Promise.all([
            Buyer.find(keyword)

            .populate("createdBy", "name")

            .sort(sort)

            .skip(skip)

            .limit(limit)

            .lean(),

            Buyer.countDocuments(keyword),
        ]);

        res.json({
            buyers: buyers.map((buyer) => sanitizeBuyerForViewer(buyer, req.user)),
            page,
            pages: Math.max(Math.ceil(total / limit), 1),
            total,
            query: {
                product: req.query.product || "",
                hsCode: req.query.hsCode || "",
                country: req.query.country || "",
            },
        });

    } catch (error) {

        next(error);

    }

};

/* =========================================
   CREATE BUYER
========================================= */

const createBuyer = async (req, res, next) => {

    try {

        const {
            companyName,
            country,
            city,
            industry,
            products,
            productCategories,
            hsCodes,
            buyerType,
            importerType,
            website,
            contactEmail,
            publicContactEmail,
            phone,
            tradeVolume,
            sourceName,
            sourceUrl,
            sourceType,
            notes,
        } = req.body;

        const productList = Array.isArray(products)
            ? products
            : typeof products === "string"
              ? products.split(",").map((item) => item.trim()).filter(Boolean)
              : [];

        /* VALIDATION */

        if (!companyName || !country || !industry) {

            res.status(400);

            throw new Error(
                "Company name, country and industry are required"
            );

        }

        /* CREATE BUYER */

        const buyer = await Buyer.create({

            companyName,

            country,

            city,

            industry,

            products: productList,

            productCategories,

            hsCodes,

            buyerType,

            importerType,

            website,

            contactEmail,

            publicContactEmail,

            phone,

            verified: false,
            verificationStatus: "unverified",
            tradeVolume,
            sourceName,
            sourceUrl,
            sourceType: sourceType || "user-submitted",
            notes,
            organizationId: req.user.organizationId,

            createdBy: req.user._id,

        });

        res.status(201).json(buyer);

    } catch (error) {

        next(error);

    }

};

/* =========================================
   GET SINGLE BUYER
========================================= */

const getBuyerById = async (req, res, next) => {

    try {

        const buyer = await Buyer.findOne({
            _id: req.params.id,
            ...buyerReadScope(req.user),
        })

            .populate("createdBy", "name")

            .lean();

        if (!buyer) {

            res.status(404);

            throw new Error("Buyer not found");

        }

        res.json(sanitizeBuyerForViewer(buyer, req.user));

    } catch (error) {

        next(error);

    }

};

/* =========================================
   UPDATE BUYER
========================================= */

const updateBuyer = async (req, res, next) => {

    try {

        const buyer = await Buyer.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user),
        });

        if (!buyer) {

            res.status(404);

            throw new Error("Buyer not found");

        }

        if (!assertCanAccess(buyer, req.user)) {
            res.status(403);
            throw new Error("Not authorized to update this buyer");
        }

        const {
            companyName,
            country,
            city,
            industry,
            products,
            productCategories,
            hsCodes,
            buyerType,
            importerType,
            website,
            contactEmail,
            publicContactEmail,
            phone,
            tradeVolume,
            sourceName,
            sourceUrl,
            sourceType,
            notes,
        } = req.body;

        buyer.companyName = companyName ?? buyer.companyName;
        buyer.country = country ?? buyer.country;
        buyer.city = city ?? buyer.city;
        buyer.industry = industry ?? buyer.industry;
        buyer.products = Array.isArray(products)
            ? products
            : typeof products === "string"
              ? products.split(",").map((item) => item.trim()).filter(Boolean)
              : buyer.products;
        buyer.productCategories = productCategories ?? buyer.productCategories;
        buyer.hsCodes = hsCodes ?? buyer.hsCodes;
        buyer.buyerType = buyerType ?? buyer.buyerType;
        buyer.importerType = importerType ?? buyer.importerType;
        buyer.website = website ?? buyer.website;
        buyer.contactEmail = contactEmail ?? buyer.contactEmail;
        buyer.publicContactEmail = publicContactEmail ?? buyer.publicContactEmail;
        buyer.phone = phone ?? buyer.phone;
        buyer.tradeVolume = tradeVolume ?? buyer.tradeVolume;
        buyer.sourceName = sourceName ?? buyer.sourceName;
        buyer.sourceUrl = sourceUrl ?? buyer.sourceUrl;
        buyer.sourceType = sourceType ?? buyer.sourceType;
        buyer.notes = notes ?? buyer.notes;

        if (!buyer.companyName || !buyer.country || !buyer.industry) {

            res.status(400);

            throw new Error(
                "Company name, country and industry are required"
            );

        }

        const updatedBuyer = await buyer.save();

        res.json(updatedBuyer);

    } catch (error) {

        next(error);

    }

};

/* =========================================
   DELETE BUYER
========================================= */

const deleteBuyer = async (req, res, next) => {

    try {

        const buyer = await Buyer.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user),
        });

        if (!buyer) {

            res.status(404);

            throw new Error("Buyer not found");

        }

        if (!assertCanAccess(buyer, req.user)) {
            res.status(403);
            throw new Error("Not authorized to delete this buyer");
        }

        await buyer.deleteOne();

        res.json({
            message: "Buyer removed successfully",
        });

    } catch (error) {

        next(error);

    }

};

export {
    createBuyer,
    getBuyers,
    getBuyerById,
    updateBuyer,
    deleteBuyer,
};
