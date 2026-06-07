import Buyer from "../models/Buyer.js";
import {
    buildPagination,
    buildRangeFilter,
    buildSort,
    buildTextOrRegexSearch,
} from "../services/searchService.js";
import { assertCanAccess, userScopeFilter } from "../utils/ownership.js";

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
        const keyword = {
            ...userScopeFilter(req.user),
            ...buildTextOrRegexSearch(req.query.search, [
                "companyName",
                "country",
                "industry",
                "products",
            ]),
            ...(req.query.country ? { country: req.query.country } : {}),
            ...(req.query.industry ? { industry: req.query.industry } : {}),
            ...(req.query.verified ? { verified: req.query.verified === "true" } : {}),
            ...buildRangeFilter(req.query, "tradeVolume"),
        };

        const [buyers, total] = await Promise.all([
            Buyer.find(keyword)

            .populate("createdBy", "name email")

            .sort(sort)

            .skip(skip)

            .limit(limit),

            Buyer.countDocuments(keyword),
        ]);

        res.json({
            buyers,
            page,
            pages: Math.max(Math.ceil(total / limit), 1),
            total,
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
            industry,
            products,
            website,
            contactEmail,
            phone,
            verified,
            tradeVolume,
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

            industry,

            products: productList,

            website,

            contactEmail,

            phone,

            verified,
            tradeVolume,
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
            ...userScopeFilter(req.user),
        })

            .populate("createdBy", "name email");

        if (!buyer) {

            res.status(404);

            throw new Error("Buyer not found");

        }

        res.json(buyer);

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
            industry,
            products,
            website,
            contactEmail,
            phone,
            verified,
            tradeVolume,
        } = req.body;

        buyer.companyName = companyName ?? buyer.companyName;
        buyer.country = country ?? buyer.country;
        buyer.industry = industry ?? buyer.industry;
        buyer.products = Array.isArray(products)
            ? products
            : typeof products === "string"
              ? products.split(",").map((item) => item.trim()).filter(Boolean)
              : buyer.products;
        buyer.website = website ?? buyer.website;
        buyer.contactEmail = contactEmail ?? buyer.contactEmail;
        buyer.phone = phone ?? buyer.phone;
        buyer.verified = verified ?? buyer.verified;
        buyer.tradeVolume = tradeVolume ?? buyer.tradeVolume;

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
