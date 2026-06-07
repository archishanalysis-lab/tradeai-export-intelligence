import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
            "media-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

const sanitizeObject = (value) => {
    if (!value || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeObject);
    }

    return Object.keys(value).reduce((acc, key) => {
        const cleanKey = key.replace(/^\$/, "").replace(/\./g, "_");
        const current = value[key];

        acc[cleanKey] =
            typeof current === "string"
                ? current.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
                : sanitizeObject(current);

        return acc;
    }, {});
};

const sanitizeRequest = (req, res, next) => {
    req.body = mongoSanitize.sanitize(sanitizeObject(req.body), { replaceWith: "_" });
    req.cleanQuery = mongoSanitize.sanitize(sanitizeObject(req.query), { replaceWith: "_" });
    req.cleanParams = mongoSanitize.sanitize(sanitizeObject(req.params), { replaceWith: "_" });
    next();
};

const apiRateLimit = ({ windowMs = 15 * 60 * 1000, max = 300 } = {}) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            message: "Too many requests. Please try again later.",
        },
    });
};

export { apiRateLimit, sanitizeRequest, securityHeaders };
