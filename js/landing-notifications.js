(function () {
  const toggle = document.getElementById("notificationToggle");
  const panel = document.getElementById("notificationPanel");
  const list = document.getElementById("notificationList");
  const count = document.getElementById("notificationCount");

  if (!toggle || !panel || !list) {
    return;
  }

  const storage = window.TradeAI?.storage;
  const auth = window.TradeAI?.auth || window.TradeAI?.state?.auth;

  function getUser() {
    return auth?.getUser?.() || storage?.getJson?.("tradeai_user") || null;
  }

  function isLoggedIn() {
    return Boolean(auth?.isLoggedIn?.() || storage?.get("tradeai_logged_in") === "true");
  }

  function buildBaseAlerts() {
    return [
      {
        type: "Trade news",
        title: "Freight lane watch",
        message: "Review shipping lead times before confirming new export quotes this week.",
        tone: "warning",
      },
      {
        type: "Compliance",
        title: "Document readiness",
        message: "Keep GST, IEC, catalog and certification files ready for buyer verification.",
        tone: "info",
      },
      {
        type: "Market signal",
        title: "Quote protection",
        message: "Currency movement can affect margins. Recheck price validity on open inquiries.",
        tone: "success",
      },
    ];
  }

  function buildUserReminders(user) {
    if (!isLoggedIn()) {
      return [
        {
          type: "Account",
          title: "Create your TradeAI account",
          message: "Register to receive buyer match alerts, saved supplier reminders and pricing updates.",
          tone: "info",
        },
      ];
    }

    const role = user?.role || "explorer";
    const reminders = [
      {
        type: "Profile",
        title: "Complete company profile",
        message: "Add logo, GST/IEC, products and export countries to improve marketplace trust.",
        tone: "warning",
      },
    ];

    if (role === "exporter") {
      reminders.push({
        type: "Exporter",
        title: "Upload products for matching",
        message: "Products with HS codes, MOQ and target countries generate stronger buyer recommendations.",
        tone: "success",
      });
    }

    if (role === "importer") {
      reminders.push({
        type: "Importer",
        title: "Save suppliers you want to compare",
        message: "Saved companies help TradeAI shape future supplier and product recommendations.",
        tone: "success",
      });
    }

    return reminders;
  }

  async function buildBillingReminder() {
    const token = auth?.getToken?.() || storage?.get?.("tradeai_token");

    if (!isLoggedIn() || !token || !window.TradeAI?.API_BASE_URL) {
      return null;
    }

    try {
      const response = await fetch(`${window.TradeAI.API_BASE_URL}/billing/status`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const subscription = data.subscription || data;
      const plan = subscription?.plan || "free";

      if (plan === "free") {
        return {
          type: "Billing",
          title: "Buyer unlock available on premium plans",
          message: "Upgrade when you are ready to reveal verified buyer contact details.",
          tone: "warning",
        };
      }

      return {
        type: "Billing",
        title: `${plan} plan active`,
        message: "Your purchase history is connected. Track renewals and unlock usage from pricing.",
        tone: "success",
      };
    } catch (error) {
      return null;
    }
  }

  function render(items) {
    list.innerHTML = items
      .map(
        (item) => `
          <article class="notification-menu-item ${item.tone || "info"}">
            <span class="notification-menu-dot" aria-hidden="true"></span>
            <div>
              <small>${item.type}</small>
              <strong>${item.title}</strong>
              <p>${item.message}</p>
            </div>
          </article>
        `,
      )
      .join("");

    if (count) {
      count.textContent = String(items.length);
      count.hidden = items.length === 0;
    }
  }

  function setOpen(isOpen) {
    panel.hidden = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  async function init() {
    const user = getUser();
    const items = [...buildBaseAlerts(), ...buildUserReminders(user)];
    const billingReminder = await buildBillingReminder();

    if (billingReminder) {
      items.splice(1, 0, billingReminder);
    }

    render(items);
  }

  toggle.addEventListener("click", () => {
    setOpen(panel.hidden);
  });

  document.addEventListener("click", (event) => {
    if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

  window.addEventListener("tradeai:auth-change", init);

  init();
})();
