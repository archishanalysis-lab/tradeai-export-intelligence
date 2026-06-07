import CompanyProfile from "../models/CompanyProfile.js";
import KycDocument from "../models/KycDocument.js";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";

const parseList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => item.toString().trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
    }

    return [];
};

const slugify = (value) =>
    (value || "tradeai-company")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 90);

const completionFields = [
    "companyName",
    "contactPerson",
    "industry",
    "businessType",
    "country",
    "state",
    "city",
    "address",
    "phone",
    "email",
    "about",
];

const calculateCompletion = (profile) => {
    const scalarScore = completionFields.reduce(
        (sum, field) => sum + (profile[field] ? 1 : 0),
        0,
    );
    const listScore = [
        profile.exportCategories?.length,
        profile.interestedProducts?.length,
        profile.mainProducts?.length,
        profile.hsCodes?.length,
        profile.certificates?.length,
        profile.targetMarkets?.length || profile.preferredSupplierCountries?.length,
    ].filter(Boolean).length;

    return Math.round(((scalarScore + listScore) / (completionFields.length + 6)) * 100);
};

const ensureOrganization = async (user) => {
    if (user.organizationId) {
        return user.organizationId;
    }

    const organization = await Organization.create({
        name: user.company || `${user.name}'s Company`,
        slug: `${(user.company || user.name || "tradeai")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
        plan: "free",
        owner: user._id,
    });

    user.organizationId = organization._id;
    await user.save();

    await Subscription.create({
        organizationId: organization._id,
        plan: "free",
        status: "inactive",
        provider: "manual",
    });

    return organization._id;
};

const getMyProfile = async (req, res, next) => {
    try {
        const organizationId = await ensureOrganization(req.user);

        const [organization, subscription] = await Promise.all([
            Organization.findById(organizationId),
            Subscription.findOne({ organizationId }),
        ]);

        let profile = await CompanyProfile.findOne({ organizationId });

        if (!profile) {
            profile = await CompanyProfile.create({
                organizationId,
                owner: req.user._id,
                roleType: req.user.role,
                companyName: req.user.company || organization?.name || "",
                contactPerson: req.user.name,
            });
        }

        res.json({
            profile,
            organization,
            subscription: subscription || { plan: organization?.plan || "free", status: "inactive" },
        });
    } catch (error) {
        next(error);
    }
};

const updateMyProfile = async (req, res, next) => {
    try {
        const organizationId = await ensureOrganization(req.user);

        const payload = {
            roleType: req.user.role,
            companyName: req.body.companyName,
            contactPerson: req.body.contactPerson,
            industry: req.body.industry,
            businessType: req.body.businessType,
            yearEstablished: req.body.yearEstablished || undefined,
            employeeCount: req.body.employeeCount,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            address: req.body.address,
            website: req.body.website,
            phone: req.body.phone,
            email: req.body.email,
            whatsapp: req.body.whatsapp,
            gstNumber: req.body.gstNumber,
            iecNumber: req.body.iecNumber,
            exportCategories: parseList(req.body.exportCategories),
            interestedProducts: parseList(req.body.interestedProducts),
            mainProducts: parseList(req.body.mainProducts),
            hsCodes: parseList(req.body.hsCodes),
            exportCountries: parseList(req.body.exportCountries),
            importCountries: parseList(req.body.importCountries),
            targetMarkets: parseList(req.body.targetMarkets),
            preferredSupplierCountries: parseList(req.body.preferredSupplierCountries),
            buyingQuantity: req.body.buyingQuantity,
            moq: req.body.moq,
            annualRevenue: req.body.annualRevenue,
            productionCapacity: req.body.productionCapacity,
            certificates: parseList(req.body.certificates),
            kycDocuments: parseList(req.body.kycDocuments),
            logoUrl: req.body.logoUrl,
            bannerUrl: req.body.bannerUrl,
            catalogPdfUrl: req.body.catalogPdfUrl,
            gallery: parseList(req.body.gallery),
            about: req.body.about,
        };

        payload.profileCompletion = calculateCompletion(payload);

        const existingProfile = await CompanyProfile.findOne({ organizationId }).select("publicSlug");

        if (!existingProfile?.publicSlug && payload.companyName) {
            payload.publicSlug = `${slugify(payload.companyName)}-${organizationId.toString().slice(-6)}`;
        }

        const profile = await CompanyProfile.findOneAndUpdate(
            { organizationId },
            {
                $set: payload,
                $setOnInsert: {
                    organizationId,
                    owner: req.user._id,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            },
        );

        await Organization.findByIdAndUpdate(organizationId, {
            name: payload.companyName || req.user.company || "TradeAI Company",
        });

        res.json(profile);
    } catch (error) {
        next(error);
    }
};

const submitKycDocuments = async (req, res, next) => {
    try {
        const organizationId = await ensureOrganization(req.user);
        const profile = await CompanyProfile.findOne({ organizationId });

        if (!profile) {
            res.status(404);
            throw new Error("Company profile not found");
        }

        const documents = Array.isArray(req.body.documents) ? req.body.documents : [];

        if (!documents.length) {
            res.status(400);
            throw new Error("At least one KYC document is required");
        }

        const createdDocuments = await KycDocument.insertMany(
            documents.map((document) => ({
                organizationId,
                companyProfile: profile._id,
                uploadedBy: req.user._id,
                documentType: document.documentType,
                documentUrl: document.documentUrl,
                documentNumber: document.documentNumber || "",
            })),
        );

        profile.kycStatus = "submitted";
        profile.verificationStatus = "pending";
        profile.kycDocuments = [
            ...new Set([
                ...(profile.kycDocuments || []),
                ...createdDocuments.map((document) => document.documentUrl),
            ]),
        ];
        await profile.save();

        res.status(201).json({
            documents: createdDocuments,
            profile,
            message: "KYC documents submitted for admin review",
        });
    } catch (error) {
        next(error);
    }
};

export { getMyProfile, submitKycDocuments, updateMyProfile };
