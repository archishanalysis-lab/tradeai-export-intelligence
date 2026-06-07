import AiReport from "../models/AiReport.js";
import Subscription from "../models/Subscription.js";
import { answerTradeQuestion } from "../services/tradeCopilotService.js";

const buildReportPrompt = ({ reportType, product, hsCode, targetCountry, prompt }) => {
    const reportLabel = {
        buyer_opportunity: "buyer opportunity report",
        market_forecast: "market forecast",
        hs_code_demand: "HS code demand analysis",
        pricing: "pricing recommendation",
        custom: "custom trade intelligence report",
    }[reportType || "custom"];

    return `
Generate a concise ${reportLabel}.
Product: ${product || "not specified"}
HS Code: ${hsCode || "not specified"}
Target Country: ${targetCountry || "not specified"}
User Request: ${prompt || "Recommend best opportunities and next actions."}
Include: opportunity summary, buyer segments, risk notes, next actions.
`;
};

const createAiReport = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId });

        if ((subscription?.aiCredits ?? 10) <= 0) {
            res.status(402);
            throw new Error("AI credits exhausted. Upgrade your plan to generate more reports.");
        }

        const reportPrompt = buildReportPrompt(req.body);
        const response = await answerTradeQuestion({
            prompt: reportPrompt,
            context: {
                user: {
                    role: req.user.role,
                    company: req.user.company,
                },
                reportType: req.body.reportType || "custom",
            },
        });

        const report = await AiReport.create({
            organizationId: req.user.organizationId,
            createdBy: req.user._id,
            title: req.body.title || `${req.body.product || req.body.hsCode || "Trade"} intelligence report`,
            reportType: req.body.reportType || "custom",
            prompt: req.body.prompt || reportPrompt,
            product: req.body.product || "",
            hsCode: req.body.hsCode || "",
            targetCountry: req.body.targetCountry || "",
            answer: response.answer,
            suggestedActions: response.suggestedActions || [],
            provider: response.provider,
        });

        await Subscription.findOneAndUpdate(
            { organizationId: req.user.organizationId },
            { $inc: { aiCredits: -1 } },
        );

        res.status(201).json({ report });
    } catch (error) {
        next(error);
    }
};

const getAiReports = async (req, res, next) => {
    try {
        const reports = await AiReport.find({ organizationId: req.user.organizationId })
            .select("-answer")
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ reports });
    } catch (error) {
        next(error);
    }
};

const getAiReportById = async (req, res, next) => {
    try {
        const report = await AiReport.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
        });

        if (!report) {
            res.status(404);
            throw new Error("AI report not found");
        }

        res.json(report);
    } catch (error) {
        next(error);
    }
};

const exportAiReport = async (req, res, next) => {
    try {
        const report = await AiReport.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
        });

        if (!report) {
            res.status(404);
            throw new Error("AI report not found");
        }

        const format = req.query.format === "csv" ? "csv" : "txt";

        if (format === "csv") {
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="${report._id}.csv"`);
            res.send(`title,type,product,hsCode,targetCountry,answer\n"${report.title}","${report.reportType}","${report.product}","${report.hsCode}","${report.targetCountry}","${report.answer.replace(/"/g, '""')}"`);
            return;
        }

        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="${report._id}.txt"`);
        res.send(`${report.title}\n\n${report.answer}\n\nActions:\n${report.suggestedActions.map((item) => `- ${item}`).join("\n")}`);
    } catch (error) {
        next(error);
    }
};

export { createAiReport, exportAiReport, getAiReportById, getAiReports };
