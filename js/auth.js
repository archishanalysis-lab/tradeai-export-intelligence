/* =========================================================
   TRADEAI AUTH SYSTEM
========================================================= */

const API_BASE_URL =
  window.TradeAI?.config?.API_URL ||
  (window.TRADEAI_API_URL ? `${window.TRADEAI_API_URL.replace(/\/$/, "")}/api` : "") ||
  (["localhost", "127.0.0.1", ""].includes(window.location.hostname)
    ? "http://localhost:5000/api"
    : "https://tradeai-export-intelligence-1.onrender.com/api");
const AUTH_BACKEND_UNAVAILABLE_MESSAGE =
  "Cannot connect to the TradeAI backend. Start the backend on http://localhost:5000 and try again.";

const AUTH_KEY = "tradeai_logged_in";
const USER_KEY = "tradeai_user";
const TOKEN_KEY = "tradeai_token";
const TOKEN_EXPIRY_KEY = "tradeai_token_expiry";
const PRIVACY_PENDING_KEY = "tradeai_privacy_pending";
const authState = window.TradeAI?.state?.auth;
const storage = window.TradeAI?.storage || {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Browser storage can be unavailable in private browsing.
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Browser storage can be unavailable in private browsing.
    }
  },
  getJson(key) {
    try {
      const value = this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  },
  setJson(key, value) {
    this.set(key, JSON.stringify(value));
  },
};

const DASHBOARD_PATHS = {
  explorer: "explorer-dashboard.html",
  exporter: "export-dash.html",
  importer: "importer-dashboard.html",
  consultant: "analytics-dashboard.html",
  sme: "explorer-dashboard.html",
  admin: "admin-panel.html",
};

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutButtons = document.querySelectorAll(".logout-btn");
const privacyConfirmSection = document.getElementById("privacyConfirmSection");
const privacyConfirmButton = document.getElementById("privacyConfirmButton");

const protectedPages = [
  "setting",
  "saved-search",
  "notification",
  "market-analysis",
  "buyer-dashboard",
  "add-buyer",
  "product-upload",
  "product-dashboard",
  "inquiry-dashboard",
  "analytics-dashboard",
  "ai-reports",
  "copilot",
  "deals",
  "search-result",
  "hs-code-detail",
  "explorer-dashboard",
  "export-dash",
  "importer-dashboard",
  "admin-panel",
];

const currentPage = window.location.pathname
  .split("/")
  .pop()
  .replace(".html", "");

const authPages = ["login", "register"];
const roleGuardMap = {
  "export-dash": ["exporter", "admin"],
  "product-upload": ["exporter", "admin"],
  "product-dashboard": ["exporter", "admin"],
  "inquiry-dashboard": ["exporter", "importer", "admin"],
  deals: ["exporter", "admin"],
  "importer-dashboard": ["importer", "admin"],
  "admin-panel": ["admin"],
};

function isLoggedIn() {
  if (authState?.isLoggedIn) {
    return authState.isLoggedIn();
  }

  const token = getToken();

  return (
    storage.get(AUTH_KEY) === "true" &&
    Boolean(token) &&
    !isTokenExpired(token)
  );
}

function getToken() {
  if (authState?.getToken) {
    return authState.getToken();
  }

  return storage.get(TOKEN_KEY);
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = window.atob(normalizedPayload);

    return JSON.parse(
      decodeURIComponent(
        decodedPayload
          .split("")
          .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(""),
      ),
    );
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

function saveUser(userData) {
  storage.setJson(USER_KEY, userData);
}

function getUser() {
  if (authState?.getUser) {
    return authState.getUser();
  }

  return storage.getJson(USER_KEY);
}

function loginUser(userData) {
  if (authState?.saveSession) {
    return authState.saveSession(userData);
  }

  storage.set(AUTH_KEY, "true");
  storage.set(TOKEN_KEY, userData.token);
  saveUser({
    id: userData._id || userData.id,
    name: userData.name,
    email: userData.email,
    company: userData.company || "",
    organizationId: userData.organizationId || "",
    role: userData.role || "explorer",
  });
}

function clearSession() {
  if (authState?.clearSession) {
    authState.clearSession();
    return;
  }

  storage.remove(AUTH_KEY);
  storage.remove(USER_KEY);
  storage.remove(TOKEN_KEY);
  storage.remove(TOKEN_EXPIRY_KEY);
}

function getLoginPath() {
  if (authState?.getLoginPath) {
    return authState.getLoginPath();
  }

  return window.location.pathname.includes("/pages/")
    ? "login.html"
    : "pages/login.html";
}

function getPagePath(page) {
  return window.location.pathname.includes("/pages/") ? page : `pages/${page}`;
}

function getDashboardPath(role) {
  return getPagePath(DASHBOARD_PATHS[role] || DASHBOARD_PATHS.explorer);
}

function logoutUser() {
  clearSession();
  window.location.href = getLoginPath();
}

function requireAuth() {
  if (isLoggedIn()) {
    return true;
  }

  window.TradeAI?.toast?.("Please login first.", "error");
  window.location.href = getLoginPath();
  return false;
}

async function verifyServerSession() {
  if (!protectedPages.includes(currentPage) || !isLoggedIn() || !window.TradeAI?.request) {
    return;
  }

  try {
    const user = await window.TradeAI.request("/auth/me", { retries: 0 });
    const currentUser = getUser() || {};
    saveUser({
      ...currentUser,
      id: user._id || user.id || currentUser.id,
      name: user.name || currentUser.name,
      email: user.email || currentUser.email,
      company: user.company || currentUser.company || null,
      organizationId: user.organizationId || currentUser.organizationId || null,
      role: user.role || currentUser.role,
      status: user.status || currentUser.status,
    });
  } catch (error) {
    clearSession();
    window.location.href = getLoginPath();
  }
}

function applyRoleVisibility() {
  const user = getUser();
  const role = user?.role || "guest";

  document.querySelectorAll("[data-role-allow], [data-role-deny]").forEach((element) => {
    const allow = (element.dataset.roleAllow || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const deny = (element.dataset.roleDeny || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const allowed = (!allow.length || allow.includes(role)) && !deny.includes(role);

    element.hidden = !allowed;
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getPasswordIssues(password) {
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
}

function setFieldError(input, message) {
  if (!input) return;

  input.setCustomValidity(message);
  input.reportValidity();
}

function clearFieldError(input) {
  if (!input) return;

  input.setCustomValidity("");
}

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch (error) {
    throw new Error(AUTH_BACKEND_UNAVAILABLE_MESSAGE);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : { message: await response.text().catch(() => "") };

  if (!response.ok) {
    const error = new Error(
      response.status >= 500
        ? data.message || "TradeAI backend returned a server error. Please try again."
        : data.message || "Authentication could not be completed. Please try again.",
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

function getAuthFriendlyError(error) {
  return error?.message || "Authentication could not be completed. Please try again.";
}

function setSubmitState(form, isSubmitting) {
  const button = form.querySelector('button[type="submit"]');

  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent.trim();
  }

  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? "Please wait..." : button.dataset.originalText;
}

function getFormMessageElement(form) {
  let message = form.querySelector(".form-message");

  if (!message) {
    message = document.createElement("div");
    message.className = "form-message";
    message.setAttribute("role", "alert");
    message.setAttribute("aria-live", "polite");

    const submitButton = form.querySelector('button[type="submit"]');
    form.insertBefore(message, submitButton || null);
  }

  return message;
}

function setFormMessage(form, message, type = "error") {
  if (!form) return;

  const messageElement = getFormMessageElement(form);
  messageElement.textContent = message;
  messageElement.className = `form-message form-message-${type}`;
  messageElement.hidden = false;
}

function clearFormMessage(form) {
  const messageElement = form?.querySelector(".form-message");

  if (!messageElement) return;

  messageElement.textContent = "";
  messageElement.hidden = true;
}

function getAuthPageForm() {
  return loginForm || registerForm;
}

function getAuthCopy(key, variables = {}, fallback = "") {
  return window.TradeAI?.i18n?.getCopy?.(key, variables) || fallback || key;
}

function getAuthSubtitleKey() {
  return currentPage === "register" ? "registerSubtitle" : "loginSubtitle";
}

function getAuthPageHiddenElements(form) {
  if (!form?.parentElement) return [];

  return [
    form,
    form.parentElement.querySelector(".auth-divider"),
    form.parentElement.querySelector(".social-login"),
    form.parentElement.querySelector(".auth-footer"),
  ].filter(Boolean);
}

function setAuthPageFormVisibility(form, isVisible) {
  getAuthPageHiddenElements(form).forEach((element) => {
    element.hidden = !isVisible;
  });
}

function renderSignedInAuthPanel() {
  if (!authPages.includes(currentPage) || !isLoggedIn()) {
    return;
  }

  const form = getAuthPageForm();
  const authCard = form?.parentElement;

  if (!form || !authCard) {
    return;
  }

  const user = getUser() || {};
  const userLabel =
    user.name ||
    user.email ||
    getAuthCopy("yourTradeAIAccount", {}, "your TradeAI account");
  const role = user.role || "explorer";
  const authNotice = authCard.querySelector(".auth-subtitle");
  let panel = document.getElementById("signedInAuthPanel");
  const signedInMessage = getAuthCopy(
    "alreadySignedInAs",
    { user: userLabel },
    `You are already signed in as ${userLabel}.`,
  );

  if (authNotice) {
    authNotice.textContent = signedInMessage;
    authNotice.dataset.i18nDynamic = "true";
  }

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "signedInAuthPanel";
    panel.className = "selected-plan-note";
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");
    panel.innerHTML = `
      <p id="signedInAuthMessage"></p>
      <div class="hero-actions">
        <a id="continueDashboardLink" class="primary-btn auth-btn" href="#"></a>
        <button id="switchAccountButton" type="button" class="secondary-btn"></button>
      </div>
    `;
    authCard.insertBefore(panel, form);
  }

  const message = panel.querySelector("#signedInAuthMessage");
  const dashboardLink = panel.querySelector("#continueDashboardLink");
  const switchButton = panel.querySelector("#switchAccountButton");

  if (message) {
    message.textContent = signedInMessage;
  }

  if (dashboardLink) {
    dashboardLink.href = getDashboardPath(role);
    dashboardLink.textContent = getAuthCopy(
      "continueToDashboard",
      {},
      "Continue to Dashboard",
    );
  }

  if (switchButton) {
    switchButton.textContent = getAuthCopy(
      "switchAccountLogout",
      {},
      "Switch Account / Logout",
    );
    switchButton.onclick = () => {
      clearSession();
      panel.remove();
      setAuthPageFormVisibility(form, true);

      if (authNotice) {
        const subtitleKey = getAuthSubtitleKey();
        authNotice.textContent = getAuthCopy(
          subtitleKey,
          {},
          currentPage === "register"
            ? "Start your global trade journey"
            : "Continue to your dashboard",
        );
        delete authNotice.dataset.i18nDynamic;
      }
    };
  }

  setAuthPageFormVisibility(form, false);
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormMessage(loginForm);

    if (isLoggedIn()) {
      renderSignedInAuthPanel();
      return;
    }

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    clearFieldError(emailInput);
    clearFieldError(passwordInput);

    if (!email || !password) {
      setFormMessage(loginForm, "Please fill all fields.");
      return;
    }

    if (!validateEmail(email)) {
      setFieldError(emailInput, "Please enter a valid email address.");
      return;
    }

    try {
      setSubmitState(loginForm, true);

      const userData = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      loginUser(userData);
      setFormMessage(loginForm, "Login successful. Redirecting...", "success");
      window.location.href = getDashboardPath(userData.role);
    } catch (error) {
      clearSession();
      setFormMessage(loginForm, getAuthFriendlyError(error));
    } finally {
      setSubmitState(loginForm, false);
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormMessage(registerForm);

    if (isLoggedIn()) {
      renderSignedInAuthPanel();
      return;
    }

    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const companyInput = document.getElementById("registerCompany");
    const roleInput = document.getElementById("registerRole");
    const passwordInput = document.getElementById("registerPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    const name = nameInput?.value.trim();
    const email = emailInput?.value.trim();
    const company = companyInput?.value.trim();
    const role = roleInput?.value;
    const password = passwordInput?.value;
    const confirmPassword = confirmPasswordInput?.value;

    clearFieldError(emailInput);
    clearFieldError(roleInput);
    clearFieldError(passwordInput);
    clearFieldError(confirmPasswordInput);

    if (!name || !email || !role || !password || !confirmPassword) {
      setFormMessage(registerForm, "Please fill all required fields.");
      return;
    }

    if (!validateEmail(email)) {
      setFieldError(emailInput, "Please enter a valid email address.");
      return;
    }

    const passwordIssues = getPasswordIssues(password);

    if (passwordIssues.length) {
      setFieldError(
        passwordInput,
        `Password must include ${passwordIssues.join(", ")}.`,
      );
      return;
    }

    if (password !== confirmPassword) {
      setFieldError(confirmPasswordInput, "Passwords do not match.");
      return;
    }

    try {
      setSubmitState(registerForm, true);

      const userData = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          company,
          role,
          password,
        }),
      });

      loginUser(userData);
      storage.set(PRIVACY_PENDING_KEY, "true");
      setFormMessage(registerForm, "Registration successful. Redirecting...", "success");
      window.location.href = getPagePath("privacy-policy.html?from=register");
    } catch (error) {
      clearSession();
      setFormMessage(registerForm, getAuthFriendlyError(error));
    } finally {
      setSubmitState(registerForm, false);
    }
  });
}

logoutButtons.forEach((button) => {
  button.addEventListener("click", logoutUser);
});

if (storage.get(AUTH_KEY) === "true" && getToken() && isTokenExpired(getToken())) {
  clearSession();
}

renderSignedInAuthPanel();
window.addEventListener("tradeai:language-change", renderSignedInAuthPanel);

if (protectedPages.includes(currentPage) && !isLoggedIn()) {
  window.TradeAI?.toast?.("Please login first.", "error");
  window.location.href = getLoginPath();
}

if (isLoggedIn() && roleGuardMap[currentPage]) {
  const user = getUser();
  const allowedRoles = roleGuardMap[currentPage];

  if (!allowedRoles.includes(user?.role)) {
    window.TradeAI?.toast?.(
      "This workspace area is not available for your current role.",
      "error",
    );
    window.location.href = getDashboardPath(user?.role);
  }
}

if (protectedPages.includes(currentPage) && isLoggedIn()) {
  window.addEventListener("DOMContentLoaded", verifyServerSession);
}

window.addEventListener("DOMContentLoaded", applyRoleVisibility);
window.addEventListener("tradeai:auth-change", applyRoleVisibility);

if (privacyConfirmSection && privacyConfirmButton) {
  const shouldConfirmPrivacy =
    isLoggedIn() &&
    storage.get(PRIVACY_PENDING_KEY) === "true" &&
    new URLSearchParams(window.location.search).get("from") === "register";

  if (shouldConfirmPrivacy) {
    privacyConfirmSection.hidden = false;
    privacyConfirmSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  privacyConfirmButton.addEventListener("click", () => {
    const user = getUser();

    storage.remove(PRIVACY_PENDING_KEY);
    window.location.href = getDashboardPath(user?.role);
  });
}

const userNameElements = document.querySelectorAll(".user-name");

if (isLoggedIn() && userNameElements.length) {
  const user = getUser();

  userNameElements.forEach((element) => {
    element.textContent = user?.name || "TradeAI User";
  });
}

document.querySelectorAll(".toggle-password").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = toggle.previousElementSibling;

    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      toggle.setAttribute("aria-label", "Hide password");
      toggle.innerHTML = '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>';
    } else {
      input.type = "password";
      toggle.setAttribute("aria-label", "Show password");
      toggle.innerHTML = '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
    }
  });
});

window.addEventListener("storage", () => {
  if (!isLoggedIn() && protectedPages.includes(currentPage)) {
    window.location.href = getLoginPath();
  }
});

window.TradeAI = {
  ...(window.TradeAI || {}),
  auth: {
    isLoggedIn,
    getToken,
    getUser,
    loginUser,
    logoutUser,
    clearSession,
    requireAuth,
    getDashboardPath,
    isTokenExpired,
    verifyServerSession,
    applyRoleVisibility,
  },
};
