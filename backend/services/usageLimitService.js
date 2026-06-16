import Subscription from "../models/Subscription.js";

const PLAN_ALIASES = {
    starter: "free",
    premium_exporter: "growth",
    verified_supplier: "growth",
    ai_insights: "pro",
    ai_pro: "pro",
};

const PLAN_LIMITS = {
    free: {
        name: "Free",
        copilotQuestionsPerDay: 5,
        reportsPerMonth: 2,
        savedReports: 20,
        buyerSearchesPerDay: 10,
    },
    growth: {
        name: "Growth",
        copilotQuestionsPerDay: 50,
        reportsPerMonth: 20,
        savedReports: 200,
        buyerSearchesPerDay: 100,
    },
    pro: {
        name: "Pro",
        copilotQuestionsPerDay: 200,
        reportsPerMonth: 100,
        savedReports: 1000,
        buyerSearchesPerDay: 500,
    },
    enterprise: {
        name: "Enterprise",
        copilotQuestionsPerDay: -1,
        reportsPerMonth: -1,
        savedReports: -1,
        buyerSearchesPerDay: -1,
    },
};

const FEATURE_CONFIG = {
    copilot: {
        usageKey: "copilot",
        limitKey: "copilotQuestionsPerDay",
        period: "day",
        label: "Copilot questions",
    },
    reports: {
        usageKey: "reports",
        limitKey: "reportsPerMonth",
        period: "month",
        label: "export reports",
    },
    buyerSearch: {
        usageKey: "buyerSearch",
        limitKey: "buyerSearchesPerDay",
        period: "day",
        label: "buyer discovery searches",
    },
};

function normalizePlanName(plan = "free") {
    const normalized = String(plan || "free").trim().toLowerCase();
    return PLAN_ALIASES[normalized] || normalized;
}

function getPlanLimits(plan = "free") {
    return PLAN_LIMITS[normalizePlanName(plan)] || PLAN_LIMITS.free;
}

function getNextResetAt(period, from = new Date()) {
    const resetAt = new Date(from);

    if (period === "day") {
        resetAt.setDate(resetAt.getDate() + 1);
        resetAt.setHours(0, 0, 0, 0);
        return resetAt;
    }

    resetAt.setMonth(resetAt.getMonth() + 1, 1);
    resetAt.setHours(0, 0, 0, 0);
    return resetAt;
}

function isAdmin(req) {
    return req.user?.role === "admin";
}

function isActiveForPlan(subscription, plan) {
    if (plan === "free") {
        return true;
    }

    return subscription?.status === "active" && subscription?.billingStatus !== "past_due";
}

function formatResetDate(resetAt) {
    return resetAt ? new Date(resetAt).toISOString() : null;
}

function buildUsageError({ status, code, message, plan, feature, limit, used, resetAt }) {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    error.plan = plan;
    error.feature = feature;
    error.limit = limit;
    error.used = used;
    error.resetAt = resetAt;
    return error;
}

async function findOrCreateSubscription(req) {
    if (!req.user?.organizationId) {
        throw buildUsageError({
            status: 403,
            code: "WORKSPACE_REQUIRED",
            message: "Workspace is required before using this feature.",
            plan: "free",
        });
    }

    return Subscription.findOneAndUpdate(
        { organizationId: req.user.organizationId },
        {
            $setOnInsert: {
                organizationId: req.user.organizationId,
                plan: "free",
                status: "inactive",
                billingStatus: "not_required",
                provider: "manual",
            },
        },
        { new: true, upsert: true, runValidators: true },
    );
}

function ensureCounter(subscription, config, now) {
    const usage = subscription.usage || {};
    const current = usage[config.usageKey] || {};
    const resetAt = current.resetAt ? new Date(current.resetAt) : null;
    const shouldReset = !resetAt || resetAt <= now;

    if (shouldReset) {
        subscription.usage = {
            ...usage,
            [config.usageKey]: {
                count: 0,
                resetAt: getNextResetAt(config.period, now),
            },
        };
        return subscription.usage[config.usageKey];
    }

    return current;
}

async function consumeUsageLimit(req, feature) {
    if (isAdmin(req)) {
        return { bypassed: true, reason: "admin" };
    }

    const config = FEATURE_CONFIG[feature];

    if (!config) {
        throw new Error(`Unknown usage limit feature: ${feature}`);
    }

    const now = new Date();
    const subscription = await findOrCreateSubscription(req);
    const plan = normalizePlanName(subscription.plan);
    const limits = getPlanLimits(plan);

    if (!isActiveForPlan(subscription, plan)) {
        throw buildUsageError({
            status: 402,
            code: subscription.billingStatus === "past_due" ? "BILLING_ISSUE" : "PLAN_INACTIVE",
            message:
                subscription.billingStatus === "past_due"
                    ? "Billing issue detected. Please update billing to continue."
                    : "Plan inactive. Please activate your plan to continue.",
            plan,
            feature,
        });
    }

    const limit = limits[config.limitKey];
    const counter = ensureCounter(subscription, config, now);

    if (limit === -1) {
        await subscription.save();
        return {
            allowed: true,
            plan,
            feature,
            limit,
            used: counter.count || 0,
            resetAt: formatResetDate(counter.resetAt),
        };
    }

    const used = Number(counter.count || 0);

    if (used >= limit) {
        throw buildUsageError({
            status: 429,
            code: "USAGE_LIMIT_REACHED",
            message: `${limits.name} limit reached for ${config.label}. Upgrade required. Usage resets on ${formatResetDate(counter.resetAt)}.`,
            plan,
            feature,
            limit,
            used,
            resetAt: formatResetDate(counter.resetAt),
        });
    }

    counter.count = used + 1;
    subscription.usage[config.usageKey] = counter;
    await subscription.save();

    return {
        allowed: true,
        plan,
        feature,
        limit,
        used: counter.count,
        resetAt: formatResetDate(counter.resetAt),
    };
}

function usageLimitMiddleware(feature) {
    return async (req, res, next) => {
        try {
            await consumeUsageLimit(req, feature);
            next();
        } catch (error) {
            next(error);
        }
    };
}

function serializeUsage(subscription) {
    const plan = normalizePlanName(subscription?.plan || "free");
    const limits = getPlanLimits(plan);
    const usage = subscription?.usage || {};

    return {
        plan,
        limits,
        usage: {
            copilot: {
                used: Number(usage.copilot?.count || 0),
                limit: limits.copilotQuestionsPerDay,
                resetAt: formatResetDate(usage.copilot?.resetAt),
            },
            reports: {
                used: Number(usage.reports?.count || 0),
                limit: limits.reportsPerMonth,
                resetAt: formatResetDate(usage.reports?.resetAt),
            },
            buyerSearch: {
                used: Number(usage.buyerSearch?.count || 0),
                limit: limits.buyerSearchesPerDay,
                resetAt: formatResetDate(usage.buyerSearch?.resetAt),
            },
        },
    };
}

export {
    PLAN_LIMITS,
    consumeUsageLimit,
    getPlanLimits,
    normalizePlanName,
    serializeUsage,
    usageLimitMiddleware,
};
