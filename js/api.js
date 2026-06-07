/* =========================================================
   TRADEAI API, AUTH STATE AND UI HELPERS
========================================================= */

(function () {
  const isLocalHost = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
  const storage = window.TradeAI?.storage;

  if (!storage) {
    throw new Error("TradeAI storage must load before api.js.");
  }

  const API_BASE_URL =
    window.TRADEAI_API_URL ||
    (isLocalHost ? "http://localhost:5000/api" : "https://tradeai-export-intelligence-1.onrender.com/api");
  const MVP_PREVIEW_MESSAGE =
    "This feature is currently running in MVP preview mode. Live backend data will appear here after deployment. Please continue reviewing the UI flow and sample experience.";
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
          toast("Please login first.", "error");
          window.location.href = this.getLoginPath();
          return false;
        }
        return true;
      },
    };

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

  async function request(path, options = {}) {
    const retries = options.retries ?? 1;
    const retryDelay = options.retryDelay ?? 450;
    const token = auth.getToken();
    let lastError;

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
          auth.clearSession();
          toast("Your session expired. Please login again.", "error");
          window.location.href = auth.getLoginPath();
          throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) {
          const error = new Error(
            response.status >= 500
              ? MVP_PREVIEW_MESSAGE
              : data.message || "This request could not be completed. Please try again.",
          );
          error.status = response.status;
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
      const previewError = new Error(MVP_PREVIEW_MESSAGE);
      previewError.code = "MVP_PREVIEW_BACKEND_UNAVAILABLE";
      throw previewError;
    }

    throw lastError;
  }

  function isPreviewApiError(error) {
    const message = String(error?.message || "");

    return (
      error?.code === "MVP_PREVIEW_BACKEND_UNAVAILABLE" ||
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
    API_BASE_URL,
    auth,
    api: {
      ...(window.TradeAI?.api || {}),
      ...publicApi,
    },
    request,
    toast,
    confirmDialog,
    MVP_PREVIEW_MESSAGE,
    isPreviewApiError,
    getPreviewMessage,
  };

  window.addEventListener("error", (event) => {
    if (!event.filename || !event.filename.includes("/js/")) {
      return;
    }

    console.error("TradeAI script error:", event.message, event.filename, event.lineno);
  });
})();
