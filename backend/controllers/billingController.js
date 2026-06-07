import Organization from "../models/Organization.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import crypto from "crypto";

const planCatalog = {
    free: {
        name: "Free",
        buyerUnlocks: 0,
        priceMonthly: 0,
    },
    premium_exporter: {
        name: "Premium Exporter",
        buyerUnlocks: 50,
        priceMonthly: 4999,
        priceYearly: 49990,
        productLimit: -1,
        inquiryLimit: -1,
        aiCredits: 250,
    },
    verified_supplier: {
        name: "Verified Supplier",
        buyerUnlocks: 150,
        priceMonthly: 9999,
        priceYearly: 99990,
        productLimit: -1,
        inquiryLimit: -1,
        aiCredits: 500,
    },
    ai_insights: {
        name: "AI Insights",
        buyerUnlocks: 300,
        priceMonthly: 14999,
        priceYearly: 149990,
        productLimit: -1,
        inquiryLimit: -1,
        aiCredits: 1500,
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

planCatalog.free.priceYearly = 0;
planCatalog.free.productLimit = 5;
planCatalog.free.inquiryLimit = 10;
planCatalog.free.aiCredits = 10;

const getBillingStatus = async (req, res, next) => {
    try {
        const organization = await Organization.findById(req.user.organizationId);
        const subscription = await Subscription.findOne({
            organizationId: req.user.organizationId,
        });

        const plan = subscription?.plan || organization?.plan || "free";

        res.json({
            plan,
            planDetails: planCatalog[plan] || planCatalog.free,
            subscription: subscription || { plan, status: "inactive", provider: "manual" },
            paymentGatewayReady: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        });
    } catch (error) {
        next(error);
    }
};

const createCheckoutSession = async (req, res, next) => {
    try {
        const plan = req.body.plan;
        const billingCycle = req.body.billingCycle === "yearly" ? "yearly" : "monthly";

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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400);
            throw new Error("Missing Razorpay payment verification details");
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            res.status(400);
            throw new Error("Payment verification failed");
        }

        const selectedPlan = planCatalog[plan] || planCatalog.premium_exporter;
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        const subscription = await Subscription.findOneAndUpdate(
            { organizationId: req.user.organizationId },
            {
                plan,
                status: "active",
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
                provider: "manual",
                currentPeriodEnd: new Date(),
                productLimit: planCatalog.free.productLimit,
                inquiryLimit: planCatalog.free.inquiryLimit,
                aiCredits: planCatalog.free.aiCredits,
            },
            { new: true, upsert: true, runValidators: true },
        );

        await Organization.findByIdAndUpdate(req.user.organizationId, { plan: "free" });

        res.json({ subscription, message: "Subscription downgraded to free" });
    } catch (error) {
        next(error);
    }
};

const handleRazorpayWebhook = async (req, res, next) => {
    try {
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
