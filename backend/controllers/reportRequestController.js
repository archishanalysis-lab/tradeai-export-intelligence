import ReportRequest from "../models/ReportRequest.js";

const createReportRequest = async (req, res) => {
    try {
        const reportRequest = await ReportRequest.create({
            ...req.body,
            source: req.body.source || "export-opportunity-report",
        });

        res.status(201).json({
            message: "Report request received successfully",
            requestId: reportRequest._id,
            status: reportRequest.status,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Report request could not be saved right now. Please try again after backend deployment.",
        });
    }
};

const getReportRequests = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, priority } = req.query;
        const numericLimit = Math.min(Number(limit) || 20, 100);
        const numericPage = Number(page) || 1;
        const skip = (numericPage - 1) * numericLimit;
        const query = {
            ...(status ? { status } : {}),
            ...(priority ? { priority } : {}),
        };

        const [requests, total] = await Promise.all([
            ReportRequest.find(query)
                .populate("reviewedBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(numericLimit)
                .lean(),
            ReportRequest.countDocuments(query),
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

const updateReportRequestStatus = async (req, res, next) => {
    try {
        const { status, adminNotes = "" } = req.body;

        const reportRequest = await ReportRequest.findByIdAndUpdate(
            req.params.id,
            {
                status,
                adminNotes,
                reviewedBy: req.user._id,
                reviewedAt: new Date(),
            },
            { new: true, runValidators: true },
        ).populate("reviewedBy", "name email");

        if (!reportRequest) {
            res.status(404);
            throw new Error("Report request not found");
        }

        res.json({ request: reportRequest });
    } catch (error) {
        next(error);
    }
};

export { createReportRequest, getReportRequests, updateReportRequestStatus };
