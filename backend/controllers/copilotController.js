import { answerTradeQuestion } from "../services/tradeCopilotService.js";

const askCopilot = async (req, res, next) => {
    try {
        const response = await answerTradeQuestion({
            prompt: req.body.prompt,
            context: {
                user: {
                    role: req.user.role,
                    company: req.user.company,
                },
                filters: req.body.filters || {},
            },
        });

        res.json(response);
    } catch (error) {
        next(error);
    }
};

export { askCopilot };
