import AnalyticsEvent from "../models/AnalyticsEvent.js";

const MAX_BATCH_SIZE = 75;
const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]{1,79}$/;

const sanitizeString = (value, maxLength) =>
    typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";

const normalizeEvent = (event) => {
    if (!event || typeof event !== "object") {
        return null;
    }

    const eventName = sanitizeString(event.event, 80);
    if (!EVENT_NAME_PATTERN.test(eventName)) {
        return null;
    }

    const timestamp = event.ts ? new Date(event.ts) : new Date();

    return {
        event: eventName,
        properties:
            event.properties && typeof event.properties === "object" && !Array.isArray(event.properties)
                ? event.properties
                : {},
        path: sanitizeString(event.path, 300),
        href: sanitizeString(event.href, 500),
        userId: sanitizeString(event.userId, 120) || "anonymous",
        sessionId: sanitizeString(event.sessionId, 120),
        performanceTime: Number.isFinite(Number(event.performanceTime))
            ? Number(event.performanceTime)
            : 0,
        ts: Number.isNaN(timestamp.getTime()) ? new Date() : timestamp,
        receivedAt: new Date(),
    };
};

const trackAnalyticsEvents = async (req, res, next) => {
    try {
        const events = Array.isArray(req.body?.events) ? req.body.events : [];
        const normalizedEvents = events
            .slice(0, MAX_BATCH_SIZE)
            .map(normalizeEvent)
            .filter(Boolean);

        if (normalizedEvents.length) {
            await AnalyticsEvent.insertMany(normalizedEvents, { ordered: false });
        }

        res.status(202).json({
            message: "Analytics events accepted",
            accepted: normalizedEvents.length,
        });
    } catch (error) {
        next(error);
    }
};

export { trackAnalyticsEvents };
