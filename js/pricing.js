(function () {
  const auth = window.TradeAI?.state?.auth;
  const billingApi = window.TradeAI?.api?.billing;
  const validPlans = new Set([
    "free",
    "premium_exporter",
    "verified_supplier",
    "ai_pro",
    "enterprise",
  ]);

  function getPlanFromButton(button) {
    const plan = button.dataset.plan;

    if (!plan || !validPlans.has(plan)) {
      throw new Error("This pricing button is missing a valid plan.");
    }

    return plan;
  }

  function withTimeout(promise, message, timeoutMs = 15000) {
    let timeoutId;

    const timeout = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => {
      window.clearTimeout(timeoutId);
    });
  }

  function track(eventName, payload = {}) {
    window.TradeAI?.analytics?.track(eventName, payload);
  }

  function loadRazorpay() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.dataset.paymentProvider = "razorpay";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
      document.head.appendChild(script);
    });
  }

  async function openRazorpayCheckout(result) {
    await loadRazorpay();

    const user = auth?.getUser?.() || {};
    const checkout = new window.Razorpay({
      key: result.keyId,
      amount: result.amount,
      currency: result.currency,
      name: "TradeAI",
      description: `${result.plan} subscription`,
      order_id: result.order.id,
      prefill: {
        name: user.name || "",
        email: user.email || "",
      },
      handler: async (response) => {
        try {
          await billingApi.verify({
            ...response,
            plan: result.plan,
          });

          track("payment_verified", {
            plan: result.plan,
            provider: result.provider,
          });
          window.TradeAI?.toast?.("Payment successful. Plan activated.");
          window.setTimeout(() => window.location.reload(), 900);
        } catch (error) {
          track("payment_verification_failed", {
            plan: result.plan,
            provider: result.provider,
            message: error.message,
          });
          window.TradeAI?.toast?.(
            "Payment received but verification failed. Contact support.",
            "error",
          );
        }
      },
      modal: {
        ondismiss: () => {
          track("checkout_cancelled", {
            plan: result.plan,
            provider: result.provider,
          });
          window.TradeAI?.toast?.("Checkout cancelled.", "info");
        },
      },
      theme: {
        color: "#34d399",
      },
    });

    checkout.open();
  }

  async function handleCheckout(event) {
    const button = event.target.closest("[data-plan]");
    if (!button || !billingApi) return;

    event.preventDefault();

    if (!auth?.isLoggedIn?.()) {
      window.TradeAI?.toast?.("Login first to activate a plan.", "error");
      window.location.href = "login.html";
      return;
    }

    let plan;

    try {
      plan = getPlanFromButton(button);
    } catch (error) {
      window.TradeAI?.toast?.(error.message, "error");
      return;
    }

    const originalHTML = button.innerHTML;
    button.setAttribute("aria-busy", "true");
    button.innerHTML = "Preparing checkout...";

    try {
      const result = await withTimeout(
        billingApi.checkout(plan),
        "Checkout is taking too long. Please try again.",
      );

      track("checkout_started", {
        plan: result.plan,
        provider: result.provider,
      });

      if (result.provider === "razorpay" && result.order && result.keyId) {
        await openRazorpayCheckout(result);
      } else {
        window.TradeAI?.toast?.(
          result.message || "Checkout is ready for payment gateway integration.",
        );
      }
    } catch (error) {
      track("checkout_failed", {
        plan,
        message: error.message,
      });
      window.TradeAI?.toast?.(error.message, "error");
    } finally {
      button.removeAttribute("aria-busy");
      button.innerHTML = originalHTML;
    }
  }

  async function hydrateBillingStatus() {
    const statusNode = document.querySelector("[data-billing-status]");
    if (!statusNode || !billingApi || !auth?.isLoggedIn?.()) return;

    try {
      const status = await billingApi.status();
      statusNode.textContent = `Current plan: ${status.planDetails?.name || status.plan}`;
    } catch (error) {
      statusNode.textContent = "Unable to load plan. Try refreshing.";
    }
  }

  document.addEventListener("click", handleCheckout);
  hydrateBillingStatus();
})();
