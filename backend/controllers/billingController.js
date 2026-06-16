import Organization from "../models/Organization.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { getPlanLimits, normalizePlanName, serializeUsage } from "../services/usageLimitService.js";
import crypto from "crypto";

const planCatalog = {
    free: {
        name: "Free",
        buyerUnlocks: 0,
        priceMonthly: 0,
        priceYearly: 0,
        productLimit: 5,
        inquiryLimit: 10,
        aiCredits: 10,
    },
    growth: {
        name: "Growth",
        buyerUnlocks: 150,
        priceMonthly: 14999,
        priceYearly: 149990,
        productLimit: -1,
        inquiryLimit: -1,
        aiCredits: 500,
    },
    pro: {
        name: "Pro",
        buyerUnlocks: 300,
        priceMonthly: 4999,
        priceYearly: 49990,
        productLimit: -1,
        inquiryLimit: -1,
        aiCredits: 250,
    },
    enterprise: {
        name: "Enterprise",
        buyerUnlocks: 1000,
        priceMonthly: 49999,
        priceYearly: 499990,
        productLimit: -1,
        inquiryLimit: -1,
        aiCredits: 5000,
    },
};

planCatalog.premium_exporter = planCatalog.growth;
planCatalog.verified_supplier = planCatalog.growth;
planCatalog.ai_insights = planCatalog.pro;
planCatalog.ai_pro = planCatalog.pro;

const signaturesMatch = (expected, received = "") => {
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(String(received));

    return (
        expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    );
};

const getBillingStatus = async (req, res, next) => {
    try {
        const organization = await Organization.findById(req.user.organizationId);
        const subscription = await Subscription.findOne({
            organizationId: req.user.organizationId,
        });

        const plan = normalizePlanName(subscription?.plan || organization?.plan || "free");
        const usageStatus = serializeUsage(subscription || { plan });

        res.json({
            plan,
            planDetails: {
                ...(planCatalog[plan] || planCatalog.free),
                usageLimits: getPlanLimits(plan),
            },
            featureAccess: {
                copilotPromptsPerDay: getPlanLimits(plan).copilotPromptsPerDay,
                reportDownloadsPerMonth: getPlanLimits(plan).reportDownloadsPerMonth,
                hsCodeSearchesPerDay: getPlanLimits(plan).hsCodeSearchesPerDay,
                countryComparisonsPerDay: getPlanLimits(plan).countryComparisonsPerDay,
                savedReportsLimit: getPlanLimits(plan).savedReportsLimit,
            },
            usage: usageStatus.usage,
            limits: usageStatus.limits,
            subscription: subscription || {
                plan,
                status: "inactive",
                billingStatus: plan === "free" ? "not_required" : "pending",
                provider: "manual",
            },
            paymentGatewayReady: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        });
    } catch (error) {
        next(error);
    }
};

const createCheckoutSession = async (req, res, next) => {
    try {
        const plan = normalizePlanName(req.body.plan);
        const billingCycle = ["yearly", "annual"].includes(req.body.billingCycle) ? "yearly" : "monthly";

        if (!planCatalog[plan] || plan === "free") {
            res.status(400);
            throw new Error("Choose a paid plan");
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            res.status(501);
            throw new Error("Razorpay credentials are not configured yet");
        }

        const selectedPlan = planCatalog[plan];
        const amount = billingCycle === "yearly" ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
        const receipt = `tradeai_${req.user.organizationId}_${Date.now()}`.slice(0, 40);
        const credentials = Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
        ).toString("base64");

        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: amount * 100,
                currency: "INR",
                receipt,
                notes: {
                    plan,
                    billingCycle,
                    organizationId: req.user.organizationId.toString(),
                    userId: req.user._id.toString(),
                },
            }),
        });

        const order = await response.json();

        if (!response.ok) {
            res.status(response.status);
            throw new Error(order.error?.description || "Unable to create Razorpay order");
        }

        await Subscription.findOneAndUpdate(
            { organizationId: req.user.organizationId },
            {
                organizationId: req.user.organizationId,
                plan,
                status: "inactive",
                billingStatus: "pending",
                billingCycle,
                provider: "razorpay",
                latestOrderId: order.id,
                $push: {
                    paymentHistory: {
                        provider: "razorpay",
                        orderId: order.id,
                        amount,
                        currency: "INR",
                        status: "created",
                        plan,
                    },
                },
            },
            { new: true, upsert: true, runValidators: true },
        );

        await Payment.findOneAndUpdate(
            { orderId: order.id },
            {
                organizationId: req.user.organizationId,
                user: req.user._id,
                provider: "razorpay",
                plan,
                billingCycle,
                orderId: order.id,
                amount,
                currency: "INR",
                status: "created",
                rawPayload: order,
            },
            { new: true, upsert: true, runValidators: true },
        );

        res.json({
            provider: "razorpay",
            plan,
            billingCycle,
            order,
            keyId: process.env.RAZORPAY_KEY_ID,
            amount: amount * 100,
            currency: "INR",
            message: "Razorpay order created",
        });
    } catch (error) {
        next(error);
    }
};

const verifyRazorpayPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const plan = normalizePlanName(req.body.plan);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400);
            throw new Error("Missing Razorpay payment verification details");
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            res.status(501);
            throw new Error("Razorpay verification is not configured yet");
        }

        if (!planCatalog[plan] || plan === "free") {
            res.status(400);
            throw new Error("Choose a valid paid plan");
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            res.status(400);
            throw new Error("Payment verification failed");
        }

        const selectedPlan = planCatalog[plan];
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        const subscription = await Subscription.findOneAndUpdate(
            { organizationId: req.user.organizationId },
            {
                plan,
                status: "active",
                billingStatus: "paid",
                provider: "razorpay",
                currentPeriodEnd,
                productLimit: selectedPlan.productLimit,
                inquiryLimit: selectedPlan.inquiryLimit,
                aiCredits: selectedPlan.aiCredits,
                $push: {
                    paymentHistory: {
                        provider: "razorpay",
                        orderId: razorpay_order_id,
                        paymentId: razorpay_payment_id,
                        amount: selectedPlan.priceMonthly,
                        currency: "INR",
                        status: "paid",
                        plan,
                        paidAt: new Date(),
                    },
                },
            },
            { new: true, upsert: true, runValidators: true },
        );

        await Organization.findByIdAndUpdate(req.user.organizationId, { plan });
        await User.findByIdAndUpdate(req.user._id, {
            plan,
            subscriptionStatus: "active",
        });

        await Payment.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                organizationId: req.user.organizationId,
                user: req.user._id,
                subscription: subscription._id,
                paymentId: razorpay_payment_id,
                status: "paid",
                plan,
                amount: selectedPlan.priceMonthly,
                paidAt: new Date(),
                rawPayload: req.body,
            },
            { new: true, upsert: true, runValidators: true },
        );

        res.json({ subscription, message: "Payment verified and plan activated" });
    } catch (error) {
        next(error);
    }
};

const getPaymentHistory = async (req, res, next) => {
    try {
        const payments = await Payment.find({ organizationId: req.user.organizationId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ payments });
    } catch (error) {
        next(error);
    }
};

const cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOneAndUpdate(
            { organizationId: req.user.organizationId },
            {
                plan: "free",
                status: "cancelled",
                billingStatus: "cancelled",
                provider: "manual",
                currentPeriodEnd: new Date(),
                productLimit: planCatalog.free.productLimit,
                inquiryLimit: planCatalog.free.inquiryLimit,
                aiCredits: planCatalog.free.aiCredits,
            },
            { new: true, upsert: true, runValidators: true },
        );

        await Organization.findByIdAndUpdate(req.user.organizationId, { plan: "free" });
        await User.findByIdAndUpdate(req.user._id, {
            plan: "free",
            subscriptionStatus: "cancelled",
        });

        res.json({ subscription, message: "Subscription downgraded to free" });
    } catch (error) {
        next(error);
    }
};

const handleRazorpayWebhook = async (req, res, next) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const receivedSignature = req.headers["x-razorpay-signature"];

        if (!webhookSecret) {
            res.status(501);
            throw new Error("Razorpay webhook verification is not configured yet");
        }

        if (!req.rawBody || !receivedSignature) {
            res.status(400);
            throw new Error("Missing Razorpay webhook signature");
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.rawBody)
            .digest("hex");

        if (!signaturesMatch(expectedSignature, receivedSignature)) {
            res.status(400);
            throw new Error("Invalid Razorpay webhook signature");
        }

        const event = req.body?.event;
        const paymentEntity = req.body?.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;

        if (!event || !orderId) {
            res.status(400);
            throw new Error("Invalid Razorpay webhook payload");
        }

        const status = event === "payment.failed" ? "failed" : event === "payment.captured" ? "paid" : "created";

        await Payment.findOneAndUpdate(
            { orderId },
            {
                paymentId: paymentEntity?.id || "",
                status,
                failureReason: paymentEntity?.error_description || "",
                rawPayload: req.body,
                ...(status === "paid" ? { paidAt: new Date() } : {}),
            },
            { new: true },
        );

        res.json({ received: true });
    } catch (error) {
        next(error);
    }
};

export {
    cancelSubscription,
    createCheckoutSession,
    getBillingStatus,
    getPaymentHistory,
    handleRazorpayWebhook,
    verifyRazorpayPayment,
};
