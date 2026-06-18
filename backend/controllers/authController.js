import generateToken from "../utils/generateToken.js";
import CompanyProfile from "../models/CompanyProfile.js";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";

const PUBLIC_REGISTRATION_ROLES = ["explorer", "exporter", "importer", "consultant", "sme"];

const slugify = (value = "") =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48) || `org-${Date.now()}`;

const ensureUserWorkspace = async (user) => {
    if (user.organizationId) {
        return user;
    }

    const organization = await Organization.create({
        name: user.company || `${user.name}'s Company`,
        slug: `${slugify(user.company || user.name)}-${Date.now().toString(36)}`,
        plan: "free",
        owner: user._id,
    });

    user.organizationId = organization._id;
    user.plan = user.plan || "free";
    user.subscriptionStatus = user.subscriptionStatus || "inactive";
    await user.save();

    await Promise.all([
        CompanyProfile.create({
            organizationId: organization._id,
            owner: user._id,
            roleType: user.role,
            companyName: user.company || "",
            contactPerson: user.name,
            profileCompletion: user.company ? 20 : 10,
        }),
        Subscription.create({
            organizationId: organization._id,
            plan: "free",
            status: "inactive",
            provider: "manual",
        }),
    ]);

    return user;
};

const buildSafeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    company: user.company,
    organizationId: user.organizationId,
    role: user.role,
    status: user.status,
    plan: user.plan || "free",
    subscriptionStatus: user.subscriptionStatus || "inactive",
});

const buildUserResponse = (user) => ({
    ...buildSafeUser(user),
    token: generateToken(user),
});

const setAuthCookie = (res, token) => {
    res.cookie("tradeai_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
    });
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const getPasswordIssues = (password) => {
    const issues = [];

    if (password.length < 8) {
        issues.push("at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
        issues.push("one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        issues.push("one lowercase letter");
    }

    if (!/\d/.test(password)) {
        issues.push("one number");
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        issues.push("one special character");
    }

    return issues;
};

const registerUser = async (req, res, next) => {
    try {
        const {
            name,
            email,
            company,
            password,
            role,
            signupSource = "",
            signupIntent = "",
            interestCountry = "",
            interestProduct = "",
        } = req.body;

        if (!name || !email || !password || !role) {
            res.status(400);
            throw new Error("Name, email, account type and password are required");
        }

        if (!PUBLIC_REGISTRATION_ROLES.includes(role)) {
            res.status(400);
            throw new Error("Please choose a valid account type");
        }

        if (!isValidEmail(email)) {
            res.status(400);
            throw new Error("Please enter a valid email address");
        }

        const passwordIssues = getPasswordIssues(password);

        if (passwordIssues.length) {
            res.status(400);
            throw new Error(
                `Password must include ${passwordIssues.join(", ")}`,
            );
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(409);
            throw new Error("User already exists");
        }

        const orgSlug = `${slugify(company || name)}-${Date.now().toString(36)}`;
        const organization = await Organization.create({
            name: company || `${name}'s Company`,
            slug: orgSlug,
            plan: "free",
        });

        const user = await User.create({
            name,
            email,
            company,
            password,
            role,
            organizationId: organization._id,
            plan: "free",
            subscriptionStatus: "inactive",
            signupSource,
            signupIntent,
            interestCountry,
            interestProduct,
        });

        organization.owner = user._id;
        await organization.save();

        await Promise.all([
            CompanyProfile.create({
                organizationId: organization._id,
                owner: user._id,
                roleType: role,
                companyName: company || "",
                contactPerson: name,
                profileCompletion: company ? 20 : 10,
            }),
            Subscription.create({
                organizationId: organization._id,
                plan: "free",
                status: "inactive",
                provider: "manual",
            }),
        ]);

        const responseBody = buildUserResponse(user);
        setAuthCookie(res, responseBody.token);
        res.status(201).json(responseBody);
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error("Email and password are required");
        }

        if (!isValidEmail(email)) {
            res.status(400);
            throw new Error("Please enter a valid email address");
        }

        const user = await User.findOne({ email }).select("+password");

        if (user?.status === "suspended") {
            res.status(403);
            throw new Error("This account has been suspended");
        }

        if (user && (await user.matchPassword(password))) {
            const upgradedUser = await ensureUserWorkspace(user);
            const responseBody = buildUserResponse(upgradedUser);
            setAuthCookie(res, responseBody.token);
            res.json(responseBody);
            return;
        }

        res.status(401);
        throw new Error("Invalid email or password");
    } catch (error) {
        next(error);
    }
};

const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            await sendEmail({
                to: email,
                subject: "TradeAI password reset request",
                message:
                    "We received a request to reset your TradeAI password. The secure reset-link flow is being prepared. Contact support if you did not request this.",
            });
        }

        res.json({
            message:
                "If an account exists for this email, password reset instructions will be sent.",
        });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res) => {
    res.json(buildSafeUser(req.user));
};

export { getMe, loginUser, registerUser, requestPasswordReset };
