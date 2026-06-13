import Deal from "../models/Deal.js";
import { assertCanAccess, userScopeFilter } from "../utils/ownership.js";

const STAGE_ORDER = [
    "lead_generated",
    "contacted",
    "qualified",
    "quotation_sent",
    "negotiation",
    "won",
    "completed",
    "lost",
];

const getDeals = async (req, res, next) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);
        const skip = (page - 1) * limit;
        const query = {
            ...userScopeFilter(req.user),
            ...(req.query.stage ? { stage: req.query.stage } : {}),
        };

        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        const [deals, total, summary] = await Promise.all([
            Deal.find(query)
                .populate("buyer", "companyName country industry")
                .populate("product", "name category hsCode")
                .populate("inquiry", "status")
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Deal.countDocuments(query),
            Deal.aggregate([
                { $match: userScopeFilter(req.user) },
                {
                    $group: {
                        _id: "$stage",
                        count: { $sum: 1 },
                        value: { $sum: "$value" },
                    },
                },
            ]),
        ]);

        res.json({
            deals,
            total,
            page,
            pages: Math.max(1, Math.ceil(total / limit)),
            summary: STAGE_ORDER.map((stage) => ({
                stage,
                count: summary.find((item) => item._id === stage)?.count || 0,
                value: summary.find((item) => item._id === stage)?.value || 0,
            })),
        });
    } catch (error) {
        next(error);
    }
};

const getDealById = async (req, res, next) => {
    try {
        const deal = await Deal.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user),
        })
            .populate("buyer", "companyName country industry contactEmail")
            .populate("product", "name category hsCode")
            .populate("inquiry", "status negotiationMessages")
            .lean();

        if (!deal) {
            res.status(404);
            throw new Error("Deal not found");
        }

        res.json(deal);
    } catch (error) {
        next(error);
    }
};

const createDeal = async (req, res, next) => {
    try {
        const deal = await Deal.create({
            ...req.body,
            organizationId: req.user.organizationId,
            createdBy: req.user._id,
        });

        res.status(201).json(deal);
    } catch (error) {
        next(error);
    }
};

const updateDeal = async (req, res, next) => {
    try {
        const deal = await Deal.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user),
        });

        if (!deal) {
            res.status(404);
            throw new Error("Deal not found");
        }

        if (!assertCanAccess(deal, req.user)) {
            res.status(403);
            throw new Error("Not authorized to update this deal");
        }

        Object.assign(deal, req.body);
        const updatedDeal = await deal.save();

        res.json(updatedDeal);
    } catch (error) {
        next(error);
    }
};

const deleteDeal = async (req, res, next) => {
    try {
        const deal = await Deal.findOne({
            _id: req.params.id,
            ...userScopeFilter(req.user),
        });

        if (!deal) {
            res.status(404);
            throw new Error("Deal not found");
        }

        if (!assertCanAccess(deal, req.user)) {
            res.status(403);
            throw new Error("Not authorized to delete this deal");
        }

        await deal.deleteOne();
        res.json({ message: "Deal deleted" });
    } catch (error) {
        next(error);
    }
};

export { createDeal, deleteDeal, getDealById, getDeals, updateDeal };
