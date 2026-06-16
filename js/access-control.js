(function () {
  window.TradeAI = window.TradeAI || {};

  const storage = window.TradeAI.storage;
  const auth = window.TradeAI.state?.auth || window.TradeAI.auth || window.TradeAI.api?.auth;
  const GUEST_KEY = "tradeai_guest_mode";
  const CHOICE_KEY = "tradeai_access_choice";
  const PROMPT_SEEN_KEY = "tradeai_access_prompt_seen_at";
  const PLAN_KEY = "tradeai_current_plan";
  const PAID_PLANS = new Set(["growth", "pro", "premium_exporter", "verified_supplier", "ai_insights", "ai_pro", "enterprise"]);
  const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const GUEST_PREVIEW_PROMPT_MS = 10 * 1000;
  let guestPreviewTimer = null;

  if (!storage) {
    console.error("access-control: TradeAI.storage is required.");
    return;
  }

  function isLoggedIn() {
    return Boolean(auth?.isLoggedIn?.());
  }

  function getPagePrefix() {
    return window.location.pathname.includes("/pages/") ? "" : "pages/";
  }

  function getLoginPath() {
    return `${getPagePrefix()}login.html`;
  }

  function getRegisterPath() {
    return `${getPagePrefix()}register.html`;
  }

  function getPricingPath() {
    return `${getPagePrefix()}pricing.html`;
  }

  function getCurrentPlan() {
    const user = auth?.getUser?.() || {};
    return storage.get(PLAN_KEY) || user.plan || user.subscriptionPlan || "free";
  }

  function isPaidUser() {
    return PAID_PLANS.has(getCurrentPlan());
  }

  function setChoice(choice) {
    storage.set(CHOICE_KEY, choice);
    storage.set(PROMPT_SEEN_KEY, String(Date.now()));
    storage.set(GUEST_KEY, choice === "guest" ? "true" : "false");
    window.dispatchEvent(new CustomEvent("tradeai:access-choice", { detail: { choice } }));
  }

  function markPromptSeen() {
    storage.set(PROMPT_SEEN_KEY, String(Date.now()));
  }

  function hasRecentlySeenPrompt() {
    const seenAt = Number(storage.get(PROMPT_SEEN_KEY));
    return Number.isFinite(seenAt) && Date.now() - seenAt < PROMPT_COOLDOWN_MS;
  }

  function hasAccess(requiredPlan) {
    if (!requiredPlan || requiredPlan === "free") return true;
    if (requiredPlan === "paid") return isPaidUser();
    return getCurrentPlan() === requiredPlan || getCurrentPlan() === "enterprise";
  }

  function getFeatureGateMessage(feature, state = {}) {
    if (!isLoggedIn()) {
      return "Login to save/download this result and keep your TradeAI workspace history.";
    }

    if (state.reason === "limit_reached" || state.code === "USAGE_LIMIT_REACHED") {
      return "Free limit reached. Upgrade to unlock more searches, reports and downloads.";
    }

    if (feature === "download" || feature === "reportDownload") {
      return isPaidUser()
        ? "Download is available on your plan."
        : "Upgrade to unlock more report downloads.";
    }

    return hasAccess("paid") ? "Feature unlocked." : "Upgrade to unlock this feature.";
  }

  function closeModal(backdrop) {
    if (!backdrop) return;
    backdrop.classList.add("access-modal-closing");
    window.setTimeout(() => backdrop.remove(), 160);
  }

  function openAccessModal(options = {}) {
    const existing = document.querySelector(".access-modal-backdrop");
    if (existing) return;

    const {
      title = "Continue with TradeAI",
      message = "Explore public trade intelligence as a guest, or log in to unlock your saved workspace and protected business tools.",
      reason = "choice",
      allowGuest = true,
    } = options;

    const backdrop = document.createElement("div");
    backdrop.className = "access-modal-backdrop";

    const dialog = document.createElement("div");
    dialog.className = "access-modal";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "accessModalTitle");
    dialog.setAttribute("aria-describedby", "accessModalDesc");

    const closeButton = document.createElement("button");
    closeButton.className = "access-modal-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close access options");
    closeButton.textContent = "x";

    const badge = document.createElement("span");
    badge.className = "access-modal-badge";
    badge.textContent = reason === "paid" ? "Paid feature" : reason === "auth" ? "Login required" : "Choose access";

    const heading = document.createElement("h2");
    heading.id = "accessModalTitle";
    heading.textContent = title;

    const body = document.createElement("p");
    body.id = "accessModalDesc";
    body.textContent = message;

    const list = document.createElement("ul");
    list.className = "access-modal-list";
    [
      "Guest mode can browse public pages and preview trade data.",
      "Login unlocks dashboards, saved profiles, products and inquiries.",
      "Paid plans unlock buyer, exporter and manufacturer contact details.",
    ].forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    const actions = document.createElement("div");
    actions.className = "access-modal-actions";

    const guestButton = document.createElement("button");
    guestButton.type = "button";
    guestButton.className = "secondary";
    guestButton.textContent = "Continue as Guest";

    const loginLink = document.createElement("a");
    loginLink.className = "login-btn";
    loginLink.href = getLoginPath();
    loginLink.textContent = "Login";

    const registerLink = document.createElement("a");
    registerLink.className = "cta-btn";
    registerLink.href = getRegisterPath();
    registerLink.textContent = "Register";

    if (allowGuest) {
      actions.appendChild(guestButton);
    }
    actions.append(loginLink, registerLink);
    dialog.append(closeButton, badge, heading, body, list, actions);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    if (allowGuest) {
      guestButton.addEventListener("click", () => {
        setChoice("guest");
        window.TradeAI?.toast?.("Guest mode enabled. Protected tools unlock after login.", "info");
        closeModal(backdrop);
      });
    }

    closeButton.addEventListener("click", () => {
      markPromptSeen();
      closeModal(backdrop);
    });
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        markPromptSeen();
        closeModal(backdrop);
      }
    });

    const keyHandler = (event) => {
      if (!document.body.contains(backdrop)) {
        document.removeEventListener("keydown", keyHandler);
        return;
      }

      if (event.key === "Escape") {
        markPromptSeen();
        closeModal(backdrop);
      }
    };

    document.addEventListener("keydown", keyHandler);
    if (allowGuest) {
      guestButton.focus();
    } else {
      loginLink.focus();
    }
  }

  function getOrCreatePreviewPanel(anchor) {
    let panel = document.getElementById("guestFeaturePreview");

    if (panel) return panel;

    panel = document.createElement("article");
    panel.id = "guestFeaturePreview";
    panel.className = "guest-preview-panel";
    panel.setAttribute("aria-live", "polite");
    panel.hidden = true;

    const featureGrid = anchor.closest(".feature-grid");
    featureGrid?.insertAdjacentElement("afterend", panel);

    return panel;
  }

  function getFeaturePreviewData(anchor) {
    const card = anchor.closest(".feature-card");
    const title = card?.querySelector("h3")?.textContent?.trim() || "TradeAI tool preview";
    const description =
      card?.querySelector("p")?.textContent?.trim() ||
      "Preview this module as a guest. Login when you want to save data, unlock contacts or use the full workspace.";

    return { title, description };
  }

  function scheduleGuestPreviewPrompt(title) {
    window.clearTimeout(guestPreviewTimer);
    guestPreviewTimer = window.setTimeout(() => {
      if (isLoggedIn()) return;

      openAccessModal({
        reason: "auth",
        title: "Continue with a TradeAI account",
        message: `You previewed ${title}. Login or register to save work, unlock dashboards and use the full tool.`,
        allowGuest: true,
      });
    }, GUEST_PREVIEW_PROMPT_MS);
  }

  function openGuestFeaturePreview(anchor) {
    const { title, description } = getFeaturePreviewData(anchor);
    const panel = getOrCreatePreviewPanel(anchor);

    if (!panel) return false;

    setChoice("guest");
    panel.hidden = false;
    panel.innerHTML = `
      <small>Guest preview</small>
      <h3></h3>
      <p></p>
      <div class="guest-preview-actions">
        <a class="login-btn" href="${getLoginPath()}">Login</a>
        <a class="cta-btn" href="${getRegisterPath()}">Register</a>
      </div>
    `;
    panel.querySelector("h3").textContent = title;
    panel.querySelector("p").textContent = `${description} You can explore this preview for a moment; the full workspace opens after login.`;
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
    scheduleGuestPreviewPrompt(title);

    return true;
  }

  function gateAuth(event, message) {
    if (isLoggedIn()) return true;
    event.preventDefault();
    openAccessModal({
      reason: "auth",
      title: "Login to continue",
      message: message || "This workspace uses your profile, organization and saved activity. Continue as guest for public pages, or log in to use it.",
      allowGuest: false,
    });
    return false;
  }

  function gatePlan(event, requiredPlan, message) {
    if (!isLoggedIn()) {
      return gateAuth(event, "Login first to check your plan and unlock this feature.");
    }

    if (hasAccess(requiredPlan)) return true;

    event.preventDefault();
    openAccessModal({
      reason: "paid",
      title: "Upgrade to unlock business details",
      message:
        message ||
        "Buyer, exporter and manufacturer contact details are available only on paid plans. Upgrade to continue.",
    });
    const pricingLink = document.createElement("a");
    pricingLink.href = getPricingPath();
    pricingLink.className = "feature-btn access-pricing-link";
    pricingLink.textContent = "View pricing";
    document.querySelector(".access-modal-actions")?.appendChild(pricingLink);
    return false;
  }

  function bindAccessGates() {
    document.addEventListener("click", (event) => {
      const previewTarget = event.target.closest("[data-guest-preview]");
      if (previewTarget && !isLoggedIn()) {
        event.preventDefault();
        openGuestFeaturePreview(previewTarget);
        return;
      }

      const authTarget = event.target.closest("[data-requires-auth]");
      if (authTarget && !gateAuth(event, authTarget.dataset.authMessage)) return;

      const planTarget = event.target.closest("[data-requires-plan]");
      if (planTarget) {
        gatePlan(event, planTarget.dataset.requiresPlan || "paid", planTarget.dataset.planMessage);
      }
    });
  }

  function markGuestExperience() {
    if (isLoggedIn()) {
      document.documentElement.classList.remove("guest-mode");
      return;
    }

    if (storage.get(GUEST_KEY) === "true") {
      document.documentElement.classList.add("guest-mode");
    }
  }

  function scheduleVisitorPrompt() {
    const isLandingPage =
      window.location.pathname.endsWith("/") ||
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.split("/").pop() === "";

    if (
      !isLandingPage ||
      isLoggedIn() ||
      storage.get(CHOICE_KEY) ||
      hasRecentlySeenPrompt()
    ) {
      return;
    }

    window.setTimeout(() => {
      if (!isLoggedIn() && !storage.get(CHOICE_KEY) && !hasRecentlySeenPrompt()) {
        markPromptSeen();
        openAccessModal();
      }
    }, 5000);
  }

  async function hydratePlan() {
    if (!isLoggedIn() || !window.TradeAI?.api?.billing?.status) return;

    try {
      const status = await window.TradeAI.api.billing.status();
      if (status?.plan) storage.set(PLAN_KEY, status.plan);
      if (status?.subscription?.status) storage.set("tradeai_subscription_status", status.subscription.status);
    } catch (error) {
      // Access checks fall back to the cached/free plan if billing is unavailable.
    }
  }

  bindAccessGates();
  window.addEventListener("tradeai:auth-change", markGuestExperience);
  window.addEventListener("DOMContentLoaded", () => {
    markGuestExperience();
    hydratePlan();
    scheduleVisitorPrompt();
  });

  window.TradeAI.access = {
    openAccessModal,
    isPaidUser,
    getCurrentPlan,
    getFeatureGateMessage,
    hasAccess,
  };
})();
