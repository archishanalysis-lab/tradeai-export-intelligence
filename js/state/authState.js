(function () {
  const AUTH_KEY = "tradeai_logged_in";
  const USER_KEY = "tradeai_user";
  const TOKEN_KEY = "tradeai_token";
  const TOKEN_EXPIRY_KEY = "tradeai_token_expiry";
  const REDIRECT_KEY = "tradeai_redirect";
  const storage = window.TradeAI?.storage;

  if (!storage) {
    console.error("authState: TradeAI.storage is required but not loaded.");
    return;
  }

  console.warn(
    "TradeAI authState stores the access token in browser storage for local development. Use httpOnly secure cookies before public production launch.",
  );

  function decodeJwtPayload(token) {
    try {
      const payload = token.split(".")[1];

      if (!payload) return null;

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

  function getExpiryFromSession(userData) {
    if (userData.expiresAt) {
      const explicitExpiry = Number(userData.expiresAt);
      const parsedDateExpiry = Date.parse(userData.expiresAt);

      if (Number.isFinite(explicitExpiry)) {
        return explicitExpiry;
      }

      if (Number.isFinite(parsedDateExpiry)) {
        return parsedDateExpiry;
      }
    }

    const payload = decodeJwtPayload(userData.token);

    return payload?.exp ? payload.exp * 1000 : "";
  }

  function isExpired(expiry) {
    return Boolean(expiry) && Number(expiry) <= Date.now();
  }

  const authState = {
    isLoggedIn() {
      const token = this.getToken();
      const expiry = storage.get(TOKEN_EXPIRY_KEY);

      if (!token || token === "undefined" || token === "null") {
        return false;
      }

      if (!decodeJwtPayload(token)) {
        this.clearSession();
        return false;
      }

      if (isExpired(expiry)) {
        this.clearSession();
        return false;
      }

      return storage.get(AUTH_KEY) === "true";
    },
    getToken() {
      return storage.get(TOKEN_KEY);
    },
    getUser() {
      return storage.getJson(USER_KEY);
    },
    saveSession(userData) {
      if (!userData?.token || userData.token === "undefined") {
        console.error("authState.saveSession: missing token in auth response.");
        this.clearSession();
        return false;
      }

      const expiry = getExpiryFromSession(userData);

      if (isExpired(expiry)) {
        console.error("authState.saveSession: received an expired token.");
        this.clearSession();
        return false;
      }

      storage.set(AUTH_KEY, "true");
      storage.set(TOKEN_KEY, userData.token);
      storage.set(TOKEN_EXPIRY_KEY, expiry || "");
      storage.setJson(
        USER_KEY,
        {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          company: userData.company || null,
          organizationId: userData.organizationId || null,
          role: userData.role || null,
        },
      );
      window.dispatchEvent(new CustomEvent("tradeai:auth-change"));
      return true;
    },
    clearSession() {
      const hadSession =
        storage.get(AUTH_KEY) ||
        storage.get(USER_KEY) ||
        storage.get(TOKEN_KEY) ||
        storage.get(TOKEN_EXPIRY_KEY);

      storage.remove(AUTH_KEY);
      storage.remove(USER_KEY);
      storage.remove(TOKEN_KEY);
      storage.remove(TOKEN_EXPIRY_KEY);

      if (hadSession) {
        window.dispatchEvent(new CustomEvent("tradeai:auth-change"));
      }
    },
    logout() {
      this.clearSession();
      window.location.href = this.getLoginPath();
    },
    getLoginPath() {
      return window.location.pathname.includes("/pages/")
        ? "login.html"
        : "pages/login.html";
    },
    getRedirectPath() {
      return storage.get(REDIRECT_KEY);
    },
    consumeRedirectPath(fallbackPath = null) {
      const redirectPath = this.getRedirectPath();
      storage.remove(REDIRECT_KEY);
      return redirectPath || fallbackPath;
    },
    requireAuth() {
      if (!this.isLoggedIn()) {
        storage.set(REDIRECT_KEY, window.location.href);
        window.TradeAI?.toast?.("Please login first.", "error");
        window.location.href = this.getLoginPath();
        return false;
      }
      return true;
    },
  };

  window.TradeAI = window.TradeAI || {};
  window.TradeAI.state = window.TradeAI.state || {};
  window.TradeAI.state.auth = authState;
})();
