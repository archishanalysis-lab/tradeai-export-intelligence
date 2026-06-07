import MarketplaceIntroRequest from "../models/MarketplaceIntroRequest.js";

const createMarketplaceIntroRequest = async (req, res) => {
    try {
        const introRequest = await MarketplaceIntroRequest.create({
            ...req.body,
            source: req.body.source || "marketplace",
        });

        res.status(201).json({
            message: "Marketplace intro request received successfully",
            requestId: introRequest._id,
            status: introRequest.status,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Intro request could not be saved right now. Please try again after backend deployment.",
        });
    }
};

const getMarketplaceIntroRequests = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, priority, requestType, targetType } = req.query;
        const numericLimit = Math.min(Number(limit) || 20, 100);
        const numericPage = Number(page) || 1;
        const skip = (numericPage - 1) * numericLimit;
        const query = {
            ...(status ? { status } : {}),
            ...(priority ? { priority } : {}),
            ...(requestType ? { requestType } : {}),
            ...(targetType ? { targetType } : {}),
        };

        const [requests, total] = await Promise.all([
            MarketplaceIntroRequest.find(query)
                .populate("reviewedBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(numericLimit),
            MarketplaceIntroRequest.countDocuments(query),
        ]);

        res.json({
            requests,
            page: numericPage,
            pages: Math.max(Math.ceil(total / numericLimit), 1),
            total,
        });
    } catch (error) {
        next(error);
    }
};

const updateMarketplaceIntroRequestStatus = async (req, res, next) => {
    try {
        const { status, adminNotes = "" } = req.body;

        const introRequest = await MarketplaceIntroRequest.findByIdAndUpdate(
            req.params.id,
            {
                status,
                adminNotes,
                reviewedBy: req.user._id,
                reviewedAt: new Date(),
            },
            { new: true, runValidators: true },
        ).populate("reviewedBy", "name email");

        if (!introRequest) {
            res.status(404);
            throw new Error("Marketplace intro request not found");
        }

        res.json({ request: introRequest });
    } catch (error) {
        next(error);
    }
};

export {
    createMarketplaceIntroRequest,
    getMarketplaceIntroRequests,
    updateMarketplaceIntroRequestStatus,
};
