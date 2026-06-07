import Product from "../models/Product.js";
import Subscription from "../models/Subscription.js";
import { getProductMatches } from "../services/aiMatchingService.js";
import {
    buildPagination,
    buildRangeFilter,
    buildSort,
    buildTextOrRegexSearch,
} from "../services/searchService.js";
import { parseUploadUrl } from "../services/uploadService.js";
import { assertCanAccess, userScopeFilter } from "../utils/ownership.js";

const parseList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => item.toString().trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
    }

    return [];
};

const buildProductPayload = (body, userId) => {
    const tags = parseList(body.tags);
    const keywords = parseList(body.keywords);

    return {
        name: body.name,
        description: body.description,
        category: body.category,
        hsCode: body.hsCode,
        imageUrl: parseUploadUrl(body.imageUrl),
        moq: Number(body.moq) || 0,
        price: {
            amount: Number(body.price?.amount ?? body.priceAmount ?? body.price) || 0,
            currency: body.price?.currency || body.currency || "USD",
        },
        exportCountry: body.exportCountry,
        availability: body.availability,
        targetCountries: parseList(body.targetCountries),
        tags,
        keywords: keywords.length ? keywords : tags,
        createdBy: userId,
        organizationId: body.organizationId,
    };
};

const getProducts = async (req, res, next) => {
    try {
        const { page, limit, skip } = buildPagination(req.query, { limit: 12 });
        const sort = buildSort(req.query.sort || "-createdAt", [
            "createdAt",
            "name",
            "category",
            "hsCode",
            "exportCountry",
            "availability",
        ]);

        const query = {
            ...userScopeFilter(req.user),
            ...buildTextOrRegexSearch(req.query.search, [
                "name",
                "category",
                "hsCode",
                "exportCountry",
                "tags",
            ]),
            ...(req.query.category ? { category: req.query.category } : {}),
            ...(req.query.availability ? { availability: req.query.availability } : {}),
            ...(req.query.exportCountry ? { exportCountry: req.query.exportCountry } : {}),
            ...buildRangeFilter(req.query, "price", "price.amount"),
            ...buildRangeFilter(req.query, "moq"),
        };

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate("createdBy", "name email company")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Product.countDocuments(query),
        ]);

        res.json({
            products,
            page,
            pages: Math.max(Math.ceil(total / limit), 1),
            total,
        });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId });
        const productLimit = subscription?.productLimit ?? 5;

        if (productLimit !== -1) {
            const currentProductCount = await Product.countDocuments({
                organizationId: req.user.organizationId,
            });

            if (currentProductCount >= productLimit) {
                res.status(402);
                throw new Error("Product limit reached. Upgrade your plan to add more products.");
            }
        }

        const payload = buildProductPayload(
            { ...req.body, organizationId: req.user.organizationId },
            req.user._id,
        );

        if (!payload.name || !payload.category) {
            res.status(400);
            throw new Error("Product name and category are required");
        }

        const product = await Product.create(payload);
        const matches = await getProductMatches(product, 5);

        res.status(201).json({ product, matches });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user),
        }).populate("createdBy", "name email company");

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user),
        });

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        if (!assertCanAccess(product, req.user)) {
            res.status(403);
            throw new Error("Not authorized to update this product");
        }

        const payload = buildProductPayload(
            { ...req.body, organizationId: req.user.organizationId },
            req.user._id,
        );

        product.name = payload.name ?? product.name;
        product.description = payload.description ?? product.description;
        product.category = payload.category ?? product.category;
        product.hsCode = payload.hsCode ?? product.hsCode;
        product.imageUrl = payload.imageUrl || product.imageUrl;
        product.moq = payload.moq ?? product.moq;
        product.price = payload.price ?? product.price;
        product.exportCountry = payload.exportCountry ?? product.exportCountry;
        product.availability = payload.availability ?? product.availability;
        product.targetCountries = payload.targetCountries.length
            ? payload.targetCountries
            : product.targetCountries;
        product.tags = payload.tags.length ? payload.tags : product.tags;
        product.keywords = payload.keywords.length ? payload.keywords : product.keywords;

        if (!product.name || !product.category) {
            res.status(400);
            throw new Error("Product name and category are required");
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user),
        });

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        if (!assertCanAccess(product, req.user)) {
            res.status(403);
            throw new Error("Not authorized to delete this product");
        }

        await product.deleteOne();

        res.json({ message: "Product removed successfully" });
    } catch (error) {
        next(error);
    }
};

const getProductAnalytics = async (req, res, next) => {
    try {
        const products = await Product.find(
            userScopeFilter(req.user),
        );
        const activeProducts = products.filter((item) => item.availability === "available").length;
        const totalValue = products.reduce(
            (sum, item) => sum + (Number(item.price?.amount) || 0),
            0,
        );
        const countries = new Set(products.flatMap((item) => item.targetCountries || []));
        const categories = products.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});

        res.json({
            totalProducts: products.length,
            activeProducts,
            estimatedCatalogValue: totalValue,
            targetCountryCount: countries.size,
            topCategories: Object.entries(categories)
                .map(([category, count]) => ({ category, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5),
        });
    } catch (error) {
        next(error);
    }
};

const getProductMatchesController = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user),
        });

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        const matches = await getProductMatches(product, Number(req.query.limit) || 8);
        res.json({ product, matches });
    } catch (error) {
        next(error);
    }
};

export {
    createProduct,
    deleteProduct,
    getProductAnalytics,
    getProductById,
    getProductMatchesController,
    getProducts,
    updateProduct,
};
