import CompanyProfile from "../models/CompanyProfile.js";
import CompanyReview from "../models/CompanyReview.js";
import Product from "../models/Product.js";
import { refreshCompanyReputation } from "../services/reputationService.js";
import { buildPagination, buildTextOrRegexSearch } from "../services/searchService.js";

const publicProfileSelect =
    "companyName publicSlug roleType industry businessType country state city address website phone email whatsapp gstNumber iecNumber exportCategories interestedProducts mainProducts hsCodes exportCountries importCountries targetMarkets preferredSupplierCountries buyingQuantity moq annualRevenue productionCapacity certificates logoUrl bannerUrl catalogPdfUrl gallery verificationStatus kycStatus isFeatured ratingAverage reviewsCount responseRate averageResponseHours fulfillmentScore reliabilityScore profileCompletion about createdAt";

const buildProfileQuery = (req, roleType) => ({
    ...(roleType ? { roleType } : {}),
    ...buildTextOrRegexSearch(req.query.search, [
        "companyName",
        "industry",
        "country",
        "state",
        "city",
        "mainProducts",
        "exportCategories",
        "interestedProducts",
        "hsCodes",
    ]),
    ...(req.query.country ? { country: req.query.country } : {}),
    ...(req.query.industry ? { industry: req.query.industry } : {}),
    ...(req.query.verified === "true" ? { verificationStatus: "verified" } : {}),
});

const getCompanies = async (req, res, next) => {
    try {
        const { page, limit, skip } = buildPagination(req.query, { limit: 12 });
        const roleType = req.query.roleType || undefined;
        const query = buildProfileQuery(req, roleType);

        const [companies, total] = await Promise.all([
            CompanyProfile.find(query)
                .select(publicProfileSelect)
                .sort({ isFeatured: -1, verificationStatus: -1, profileCompletion: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CompanyProfile.countDocuments(query),
        ]);

        res.json({
            companies,
            page,
            pages: Math.max(Math.ceil(total / limit), 1),
            total,
        });
    } catch (error) {
        next(error);
    }
};

const getSuppliers = (req, res, next) => {
    req.query.roleType = req.query.roleType || "exporter";
    return getCompanies(req, res, next);
};

const getImporters = (req, res, next) => {
    req.query.roleType = req.query.roleType || "importer";
    return getCompanies(req, res, next);
};

const getMarketplaceProducts = async (req, res, next) => {
    try {
        const { page, limit, skip } = buildPagination(req.query, { limit: 12 });
        const query = {
            ...buildTextOrRegexSearch(req.query.search, [
                "name",
                "description",
                "category",
                "hsCode",
                "exportCountry",
                "tags",
                "keywords",
            ]),
            ...(req.query.category ? { category: req.query.category } : {}),
            ...(req.query.exportCountry ? { exportCountry: req.query.exportCountry } : {}),
        };

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate("organizationId", "name slug plan")
                .populate("createdBy", "name company")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
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

const getCompanyBySlug = async (req, res, next) => {
    try {
        const company = await CompanyProfile.findOne({ publicSlug: req.params.slug })
            .select(publicProfileSelect)
            .populate("organizationId", "name slug plan")
            .lean();

        if (!company) {
            res.status(404);
            throw new Error("Company profile not found");
        }

        const [featuredProducts, reviews] = await Promise.all([
            Product.find({ organizationId: company.organizationId?._id || company.organizationId })
                .sort({ createdAt: -1 })
                .limit(6)
                .lean(),
            CompanyReview.find({ companyProfile: company._id, status: "approved" })
                .populate("reviewer", "name company")
                .sort({ createdAt: -1 })
                .limit(8)
                .lean(),
        ]);

        res.json({ company, featuredProducts, reviews });
    } catch (error) {
        next(error);
    }
};

const createCompanyReview = async (req, res, next) => {
    try {
        const company = await CompanyProfile.findOne({ publicSlug: req.params.slug }).lean();

        if (!company) {
            res.status(404);
            throw new Error("Company profile not found");
        }

        const review = await CompanyReview.findOneAndUpdate(
            { companyProfile: company._id, reviewer: req.user._id },
            {
                companyProfile: company._id,
                reviewer: req.user._id,
                organizationId: req.user.organizationId,
                rating: Number(req.body.rating),
                comment: req.body.comment || "",
                status: "pending",
            },
            { new: true, upsert: true, runValidators: true },
        );

        await refreshCompanyReputation(company._id);

        res.status(201).json({
            review,
            message: "Review submitted for moderation",
        });
    } catch (error) {
        next(error);
    }
};

export {
    createCompanyReview,
    getCompanies,
    getCompanyBySlug,
    getImporters,
    getMarketplaceProducts,
    getSuppliers,
};
