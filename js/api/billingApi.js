(function () {
  const validBillingCycles = new Set(["monthly", "annual"]);
  const validPlans = new Set([
    "free",
    "premium_exporter",
    "verified_supplier",
    "ai_pro",
    "enterprise",
  ]);

  function request(path, options) {
    if (!window.TradeAI?.request) {
      return Promise.reject(new Error("TradeAI API not initialised."));
    }

    return window.TradeAI.request(path, options);
  }

  function assertPlan(plan) {
    if (!validPlans.has(plan)) {
      throw new Error("Invalid billing plan.");
    }
  }

  function assertBillingCycle(billingCycle) {
    if (!validBillingCycles.has(billingCycle)) {
      throw new Error("Invalid billing cycle.");
    }
  }

  async function withBillingErrorContext(action, callback) {
    try {
      return await callback();
    } catch (error) {
      throw new Error(`${action} failed: ${error.message}`);
    }
  }

  /**
   * Billing API helpers for subscription status, checkout and Razorpay verification.
   */
  const billingApi = {
    status() {
      return withBillingErrorContext("Billing status", () =>
        request("/billing/status"),
      );
    },

    checkout(plan, billingCycle = "monthly") {
      assertPlan(plan);
      assertBillingCycle(billingCycle);

      return withBillingErrorContext("Checkout", () =>
        request("/billing/checkout", {
          method: "POST",
          body: JSON.stringify({ plan, billingCycle }),
        }),
      );
    },

    verifyPayment(payload) {
      const {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        plan,
      } = payload || {};

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return Promise.reject(new Error("Invalid payment payload."));
      }

      if (plan) {
        assertPlan(plan);
      }

      return withBillingErrorContext("Payment verification", () =>
        request("/billing/verify", {
          method: "POST",
          body: JSON.stringify({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            plan,
          }),
        }),
      );
    },

    verify(payload) {
      return this.verifyPayment(payload);
    },

    invoices() {
      return withBillingErrorContext("Billing invoices", () =>
        request("/billing/invoices"),
      );
    },

    cancel(subscriptionId) {
      if (!subscriptionId) {
        return Promise.reject(new Error("Subscription id is required."));
      }

      return withBillingErrorContext("Subscription cancellation", () =>
        request(`/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
          method: "POST",
        }),
      );
    },
  };

  window.TradeAI = window.TradeAI || {};
  window.TradeAI.api = window.TradeAI.api || {};
  window.TradeAI.api.billing = billingApi;
})();
