import Buyer from "../models/Buyer.js";
import CompanyProfile from "../models/CompanyProfile.js";
import Product from "../models/Product.js";
import SavedCompany from "../models/SavedCompany.js";
import SavedItem from "../models/SavedItem.js";
import SavedProduct from "../models/SavedProduct.js";
import { userScopeFilter } from "../utils/ownership.js";

const getSavedItems = async (req, res, next) => {
    try {
        if (!req.user.organizationId) {
            res.json({ savedItems: [], total: 0 });
            return;
        }

        const savedItems = await SavedItem.find(userScopeFilter(req.user, "user"))
            .populate("buyer", "companyName country industry contactEmail products verified tradeVolume")
            .populate("product", "name category hsCode imageUrl")
            .sort({ createdAt: -1 });
        const [savedCompanies, savedProducts] = await Promise.all([
            SavedCompany.find({ organizationId: req.user.organizationId, user: req.user._id })
                .populate("companyProfile", "companyName publicSlug roleType industry country city logoUrl verificationStatus ratingAverage")
                .sort({ createdAt: -1 }),
            SavedProduct.find({ organizationId: req.user.organizationId, user: req.user._id })
                .populate("product", "name category hsCode imageUrl price exportCountry")
                .sort({ createdAt: -1 }),
        ]);

        res.json({
            savedItems,
            savedCompanies,
            savedProducts,
            total: savedItems.length + savedCompanies.length + savedProducts.length,
        });
    } catch (error) {
        next(error);
    }
};

const saveCompany = async (req, res, next) => {
    try {
        if (!req.user.organizationId) {
            res.status(400);
            throw new Error("Please complete company profile setup before saving companies");
        }

        const company = await CompanyProfile.findById(req.body.companyProfile);

        if (!company) {
            res.status(404);
            throw new Error("Company profile not found");
        }

        const savedCompany = await SavedCompany.findOneAndUpdate(
            {
                organizationId: req.user.organizationId,
                companyProfile: company._id,
            },
            {
                organizationId: req.user.organizationId,
                user: req.user._id,
                companyProfile: company._id,
                notes: req.body.notes || "",
                followed: true,
            },
            { new: true, upsert: true, runValidators: true },
        ).populate("companyProfile", "companyName publicSlug roleType industry country city logoUrl verificationStatus ratingAverage");

        res.status(201).json(savedCompany);
    } catch (error) {
        next(error);
    }
};

const saveProduct = async (req, res, next) => {
    try {
        if (!req.user.organizationId) {
            res.status(400);
            throw new Error("Please complete company profile setup before saving products");
        }

        const product = await Product.findById(req.body.product);

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        const savedProduct = await SavedProduct.findOneAndUpdate(
            {
                organizationId: req.user.organizationId,
                product: product._id,
            },
            {
                organizationId: req.user.organizationId,
                user: req.user._id,
                product: product._id,
                notes: req.body.notes || "",
            },
            { new: true, upsert: true, runValidators: true },
        ).populate("product", "name category hsCode imageUrl price exportCountry");

        res.status(201).json(savedProduct);
    } catch (error) {
        next(error);
    }
};

const saveBuyer = async (req, res, next) => {
    try {
        if (!req.user.organizationId) {
            res.status(400);
            throw new Error("Please complete company profile setup before saving buyers");
        }

        const buyer = await Buyer.findById(req.body.buyer);

        if (!buyer) {
            res.status(404);
            throw new Error("Buyer not found");
        }

        const savedItem = await SavedItem.findOneAndUpdate(
            {
                organizationId: req.user.organizationId,
                buyer: buyer._id,
            },
            {
                organizationId: req.user.organizationId,
                user: req.user._id,
                itemType: "buyer",
                buyer: buyer._id,
                title: buyer.companyName,
                notes: req.body.notes || "",
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            },
        ).populate("buyer", "companyName country industry contactEmail products verified tradeVolume");

        res.status(201).json(savedItem);
    } catch (error) {
        next(error);
    }
};

const removeSavedItem = async (req, res, next) => {
    try {
        const savedItem = await SavedItem.findOneAndDelete({
            _id: req.cleanParams.id,
            ...userScopeFilter(req.user, "user"),
        });

        if (!savedItem) {
            res.status(404);
            throw new Error("Saved item not found");
        }

        res.json({ message: "Saved item removed" });
    } catch (error) {
        next(error);
    }
};

export { getSavedItems, removeSavedItem, saveBuyer, saveCompany, saveProduct };
