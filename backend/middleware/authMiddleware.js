import jwt from "jsonwebtoken";

import User from "../models/User.js";

const createAuthError = (message, status = 401) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const getBearerToken = (req) => {
    const header = req.headers.authorization || "";
    return header.startsWith("Bearer ") ? header.split(" ")[1] : null;
};

const getCookieToken = (req) => {
    const cookieHeader = req.headers.cookie || "";
    const tokenCookie = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("tradeai_token="));

    return tokenCookie ? decodeURIComponent(tokenCookie.split("=").slice(1).join("=")) : null;
};

const buildUserFromToken = (decoded) => ({
    _id: decoded.id,
    id: decoded.id,
    role: decoded.role,
    status: decoded.status,
    organizationId: decoded.organizationId,
    company: decoded.company,
    email: decoded.email,
    name: decoded.name,
});

const protect = async (req, res, next) => {
    const token = getBearerToken(req) || getCookieToken(req);

    if (!token) {
        next(createAuthError("Not authorized, no token", 401));
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        let user = buildUserFromToken(decoded);

        // Backward compatibility for older tokens that only contain an id.
        if (!user.role || !user.organizationId || !user.status) {
            const dbUser = await User.findById(decoded.id).select("-password");

            if (!dbUser) {
                next(createAuthError("Not authorized, user not found", 401));
                return;
            }

            user = dbUser;
        }

        if (user.status === "suspended") {
            next(createAuthError("This account has been suspended", 403));
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        next(
            createAuthError(
                error.name === "TokenExpiredError"
                    ? "Token expired"
                    : "Not authorized, token failed",
                401,
            ),
        );
    }
};

const authorizeRoles =
    (...allowedRoles) =>
    (req, res, next) => {
        if (req.user?.role && allowedRoles.includes(req.user.role)) {
            next();
            return;
        }

        next(createAuthError("You do not have permission to access this resource", 403));
    };

const adminOnly = authorizeRoles("admin");

export { adminOnly, authorizeRoles, protect };
