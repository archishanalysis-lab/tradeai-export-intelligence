/* =========================================================
   TRADEAI API, AUTH STATE AND UI HELPERS
========================================================= */

(function () {
  const LOCAL_BACKEND_URL = "http://localhost:5000";
  const PRODUCTION_BACKEND_URL = "https://tradeai-export-intelligence-1.onrender.com";
  const storage = window.TradeAI?.storage;
  const hostname = String(window.location.hostname || "").toLowerCase();
  const defaultBaseUrl =
    hostname === "localhost" || hostname === "127.0.0.1"
      ? LOCAL_BACKEND_URL
      : PRODUCTION_BACKEND_URL;
  const normalizeBackendBaseUrl = (url) => {
    const cleanUrl = String(url || "").replace(/\/$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl.slice(0, -4) : cleanUrl;
  };

  if (!storage) {
    throw new Error("TradeAI storage must load before api.js.");
  }

  const apiBaseUrl = normalizeBackendBaseUrl(
    window.TradeAI?.config?.API_BASE_URL ||
      window.TRADEAI_BACKEND_URL ||
      window.TRADEAI_API_URL ||
      defaultBaseUrl,
  );
  const API_BASE_URL = window.TradeAI?.config?.API_URL || `${apiBaseUrl}/api`;
  const MVP_PREVIEW_MESSAGE =
    "This feature is currently running in MVP preview mode. Live backend data will appear here after deployment. Please continue reviewing the UI flow and sample experience.";
  const SESSION_EXPIRED_MESSAGE = "Session expired, please log in again.";
  const FORBIDDEN_MESSAGE = "You do not have permission to access this resource.";
  const BACKEND_UNAVAILABLE_MESSAGE =
    "TradeAI backend is unavailable right now. Please try again after the service is back online.";
  const CONNECTING_MESSAGE = "Connecting to TradeAI server...";
  const HEALTH_CACHE_KEY = "tradeai_backend_health";
  const HEALTH_CACHE_MS = 2 * 60 * 1000;
  const HEALTH_FAILURE_CACHE_MS = 15 * 1000;
  let backendHealthPromise = null;
  let backendHealthToastAt = 0;
  const auth =
    window.TradeAI?.state?.auth || {
      isLoggedIn() {
        return storage.get("tradeai_logged_in") === "true" && Boolean(this.getToken());
      },
      getToken() {
        return storage.get("tradeai_token");
      },
      getUser() {
        return storage.getJson("tradeai_user");
      },
      saveSession(userData) {
        const { token, ...safeUser } = userData;

        storage.set("tradeai_logged_in", "true");
        storage.set("tradeai_token", token);
        storage.setJson("tradeai_user", {
          id: safeUser._id || safeUser.id,
          name: safeUser.name,
          email: safeUser.email,
          role: safeUser.role || "explorer",
          company: safeUser.company || "",
          organizationId: safeUser.organizationId || "",
        });
      },
      clearSession() {
        storage.remove("tradeai_logged_in");
        storage.remove("tradeai_user");
        storage.remove("tradeai_token");
      },
      getLoginPath() {
        return window.location.pathname.includes("/pages/") ? "login.html" : "pages/login.html";
      },
      requireAuth() {
        if (!this.isLoggedIn()) {
          redirectToLogin("login-required");
          return false;
        }
        return true;
      },
    };

  function getCurrentPath() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  function redirectToLogin(reason = "session-expired") {
    auth.clearSession();
    toast(reason === "login-required" ? "Please login first." : SESSION_EXPIRED_MESSAGE, "error");

    const redirect = encodeURIComponent(getCurrentPath());
    const separator = auth.getLoginPath().includes("?") ? "&" : "?";
    window.location.href = `${auth.getLoginPath()}${separator}reason=${encodeURIComponent(reason)}&redirect=${redirect}`;
  }

  function dispatchAuthError(error) {
    window.dispatchEvent(
      new CustomEvent("tradeai:auth-error", {
        detail: {
          status: error.status,
          message: error.message,
          reason: error.reason || "",
        },
      }),
    );
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json().catch(() => ({}));
    }

    return { message: await response.text().catch(() => "") };
  }

  function readBackendHealthCache() {
    try {
      return JSON.parse(window.sessionStorage.getItem(HEALTH_CACHE_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function writeBackendHealthCache(payload) {
    try {
      window.sessionStorage.setItem(
        HEALTH_CACHE_KEY,
        JSON.stringify({
          ...payload,
          checkedAt: Date.now(),
        }),
      );
    } catch (error) {
      // Health cache is only a cold-start optimization.
    }
  }

  function getCachedBackendHealth() {
    const cached = readBackendHealthCache();

    if (!cached?.checkedAt) return null;

    const maxAge = cached.ok ? HEALTH_CACHE_MS : HEALTH_FAILURE_CACHE_MS;

    return Date.now() - cached.checkedAt < maxAge ? cached : null;
  }

  function showConnectingMessage() {
    const now = Date.now();

    if (now - backendHealthToastAt < 10000) return;

    backendHealthToastAt = now;
    toast(CONNECTING_MESSAGE, "info");
  }

  async function checkBackendHealth(options = {}) {
    const { force = false, showStatus = false, timeoutMs = 65000 } = options;
    const cached = !force ? getCachedBackendHealth() : null;

    if (cached?.ok) {
      return cached.data || cached;
    }

    if (cached && !cached.ok && !force) {
      const cachedError = new Error(BACKEND_UNAVAILABLE_MESSAGE);
      cachedError.code = "BACKEND_UNAVAILABLE";
      cachedError.retryable = true;
      throw cachedError;
    }

    if (backendHealthPromise) {
      return backendHealthPromise;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    const statusTimer = showStatus
      ? window.setTimeout(showConnectingMessage, 650)
      : null;

    backendHealthPromise = fetch(`${apiBaseUrl}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await parseResponse(response);

        if (!response.ok) {
          throw new Error(data.message || BACKEND_UNAVAILABLE_MESSAGE);
        }

        writeBackendHealthCache({ ok: true, data });
        return data;
      })
      .catch((error) => {
        writeBackendHealthCache({ ok: false, message: error.message });

        const backendError = new Error(BACKEND_UNAVAILABLE_MESSAGE);
        backendError.code = "BACKEND_UNAVAILABLE";
        backendError.retryable = true;
        throw backendError;
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (statusTimer) window.clearTimeout(statusTimer);
        backendHealthPromise = null;
      });

    return backendHealthPromise;
  }

  async function ensureBackendReady(options = {}) {
    try {
      return await checkBackendHealth({
        showStatus: true,
        ...options,
      });
    } catch (error) {
      toast("Server is temporarily unavailable. Please try again.", "error");
      throw error;
    }
  }

  async function request(path, options = {}) {
    const retries = options.retries ?? 1;
    const retryDelay = options.retryDelay ?? 450;
    const token = auth.getToken();
    let lastError;

    if (options.skipHealthCheck !== true) {
      await ensureBackendReady();
    }

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          credentials: "include",
          headers: {
            ...(!(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
        });
        const data = await parseResponse(response);

        if (response.status === 401) {
          const error = new Error(SESSION_EXPIRED_MESSAGE);
          error.status = 401;
          error.reason = "session-expired";
          error.retryable = false;
          dispatchAuthError(error);
          redirectToLogin(error.reason);
          throw error;
        }

        if (response.status === 403) {
          const error = new Error(data.message || FORBIDDEN_MESSAGE);
          error.status = 403;
          error.reason = "forbidden";
          error.retryable = false;
          dispatchAuthError(error);
          toast(error.message, "error");
          throw error;
        }

        if (!response.ok) {
          const error = new Error(
            response.status >= 500
              ? MVP_PREVIEW_MESSAGE
              : data.message || "This request could not be completed. Please try again.",
          );
          error.status = response.status;
          error.code = data.code || data.errorCode || "";
          error.plan = data.plan || "";
          error.feature = data.feature || "";
          error.limit = data.limit;
          error.used = data.used;
          error.resetAt = data.resetAt || "";
          error.retryable = response.status < 400 || response.status >= 500;
          throw error;
        }

        return data;
      } catch (error) {
        lastError = error;

        if (
          attempt < retries &&
          error.retryable !== false &&
          !/Session expired/i.test(error.message)
        ) {
          await sleep(retryDelay * (attempt + 1));
          continue;
        }

        break;
      }
    }

    if (lastError instanceof TypeError) {
      const backendError = new Error(BACKEND_UNAVAILABLE_MESSAGE);
      backendError.code = "BACKEND_UNAVAILABLE";
      backendError.retryable = true;
      throw backendError;
    }

    throw lastError;
  }

  function isPreviewApiError(error) {
    const message = String(error?.message || "");

    return (
      error?.code === "MVP_PREVIEW_BACKEND_UNAVAILABLE" ||
      error?.code === "BACKEND_UNAVAILABLE" ||
      message.includes("MVP preview mode") ||
      /failed to fetch|backend is running|port 5000|server error/i.test(message)
    );
  }

  function getPreviewMessage(error, fallback = MVP_PREVIEW_MESSAGE) {
    return isPreviewApiError(error) ? fallback : error?.message || fallback;
  }

  const publicApi = {
    createReportRequest(payload) {
      return request("/report-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  };

  function toast(message, type = "success") {
    let container = document.querySelector(".toast-container");

    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const visibleToasts = container.querySelectorAll(".toast");
    if (visibleToasts.length >= 3) {
      visibleToasts[0].remove();
    }

    const item = document.createElement("div");
    item.className = `toast toast-${type}`;
    item.textContent = message;
    container.appendChild(item);

    window.setTimeout(() => {
      item.classList.add("toast-hide");
      window.setTimeout(() => item.remove(), 260);
    }, 3200);
  }

  function confirmDialog(message) {
    return new Promise((resolve) => {
      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop active";
      backdrop.innerHTML = `
        <div class="modal-card" role="dialog" aria-modal="true">
          <h3>Confirm action</h3>
          <p class="modal-message"></p>
          <div class="modal-actions">
            <button type="button" class="secondary modal-cancel">Cancel</button>
            <button type="button" class="primary modal-confirm">Confirm</button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      const cancelButton = backdrop.querySelector(".modal-cancel");
      const confirmButton = backdrop.querySelector(".modal-confirm");
      const focusableButtons = [cancelButton, confirmButton];

      backdrop.querySelector(".modal-message").textContent = message;

      function closeDialog(result) {
        backdrop.remove();
        document.removeEventListener("keydown", handleDialogKeydown);
        resolve(result);
      }

      function handleDialogKeydown(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeDialog(false);
          return;
        }

        if (event.key !== "Tab") return;

        const firstButton = focusableButtons[0];
        const lastButton = focusableButtons[focusableButtons.length - 1];

        if (event.shiftKey && document.activeElement === firstButton) {
          event.preventDefault();
          lastButton.focus();
        } else if (!event.shiftKey && document.activeElement === lastButton) {
          event.preventDefault();
          firstButton.focus();
        }
      }

      cancelButton.addEventListener("click", () => closeDialog(false));
      confirmButton.addEventListener("click", () => closeDialog(true));
      document.addEventListener("keydown", handleDialogKeydown);
      window.requestAnimationFrame(() => {
        cancelButton.focus();
      });
    });
  }

  window.TradeAI = {
    ...(window.TradeAI || {}),
    config: {
      ...(window.TradeAI?.config || {}),
      API_BASE_URL: apiBaseUrl,
      API_URL: API_BASE_URL,
    },
    API_BASE_URL,
    auth,
    api: {
      ...(window.TradeAI?.api || {}),
      ...publicApi,
    },
    request,
    toast,
    confirmDialog,
    checkBackendHealth,
    ensureBackendReady,
    redirectToLogin,
    SESSION_EXPIRED_MESSAGE,
    BACKEND_UNAVAILABLE_MESSAGE,
    MVP_PREVIEW_MESSAGE,
    isPreviewApiError,
    getPreviewMessage,
  };
  window.TRADEAI_API_URL = apiBaseUrl;

  window.addEventListener("error", (event) => {
    if (!event.filename || !event.filename.includes("/js/")) {
      return;
    }

    console.error("TradeAI script error:", event.message, event.filename, event.lineno);
  });
})();
