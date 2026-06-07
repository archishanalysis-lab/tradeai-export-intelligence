import OpenAI from "openai";

const getOpenAIClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }

    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const buildRecommendationPrompt = (prompt, context = {}) => `
You are TradeAI, an export-import intelligence assistant.
Answer only as concise trade recommendations.
Focus on destination countries, buyer segments, HS-code considerations, and next actions.

User role: ${context.user?.role || "unknown"}
Company: ${context.user?.company || "unknown"}
Question: ${prompt}
`;

const answerTradeQuestion = async ({ prompt, context = {} }) => {
    const cleanPrompt = prompt?.trim();

    if (!cleanPrompt) {
        throw new Error("Prompt is required");
    }

    const client = getOpenAIClient();

    if (client) {
        try {
            const completion = await client.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content:
                            "You produce practical export-import recommendations. Keep the response short, structured, and grounded in the given context.",
                    },
                    {
                        role: "user",
                        content: buildRecommendationPrompt(cleanPrompt, context),
                    },
                ],
                temperature: 0.3,
                max_tokens: 500,
            });

            return {
                answer: completion.choices[0]?.message?.content || "No recommendation generated.",
                suggestedActions: [
                    "Validate demand with trade-data analytics",
                    "Run buyer discovery for the top destination",
                    "Create product-specific AI match cards",
                ],
                contextUsed: Object.keys(context),
                provider: "openai",
            };
        } catch (error) {
            return {
                answer: `The live AI provider is temporarily unavailable, but TradeAI can still process: "${cleanPrompt}". Start by ranking countries by demand, then filter buyer discovery by industry, HS code, and recent trade activity.`,
                suggestedActions: [
                    "Retry AI recommendation after checking provider logs",
                    "Run buyer discovery with product and country filters",
                    "Compare top countries in trade analytics",
                ],
                contextUsed: Object.keys(context),
                provider: "openai-fallback",
            };
        }
    }

    return {
        answer: `TradeAI Copilot understood: "${cleanPrompt}". Based on current product, buyer and trade-data context, start by filtering buyers by country, industry and HS code, then compare trade volume and match score.`,
        suggestedActions: [
            "Run buyer discovery by HS code",
            "Compare top destination countries",
            "Generate AI match recommendations",
        ],
        contextUsed: Object.keys(context),
        provider: "local-rule-engine",
    };
};

export { answerTradeQuestion };
