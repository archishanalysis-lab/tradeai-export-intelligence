(function () {
  const TOKEN_KEY = "tradeai_token";
  const AUTH_KEY = "tradeai_logged_in";
  const USER_KEY = "tradeai_user";
  const TOKEN_EXPIRY_KEY = "tradeai_token_expiry";

  function readStorage(storage) {
    try {
      return storage?.getItem(TOKEN_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function getToken() {
    return readStorage(window.localStorage) || readStorage(window.sessionStorage);
  }

  function removeStorage(storage, key) {
    try {
      storage?.removeItem(key);
    } catch (error) {
      // Storage can be unavailable in private browsing.
    }
  }

  function clearSession() {
    [window.localStorage, window.sessionStorage].forEach((storage) => {
      removeStorage(storage, AUTH_KEY);
      removeStorage(storage, USER_KEY);
      removeStorage(storage, TOKEN_KEY);
      removeStorage(storage, TOKEN_EXPIRY_KEY);
    });
  }

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

  function getTokenIssue(token) {
    if (!token || token === "undefined" || token === "null") {
      return "login-required";
    }

    const payload = decodeJwtPayload(token);

    if (!payload) {
      return "invalid-session";
    }

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return "session-expired";
    }

    return "";
  }

  function hideUnauthenticatedLogout() {
    if (getToken()) return;

    document.querySelectorAll(".logout-btn").forEach((button) => {
      button.hidden = true;
      button.setAttribute("aria-hidden", "true");
    });
  }

  function getRedirectTarget() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  function getLoginPath() {
    return window.location.pathname.includes("/pages/")
      ? "login.html"
      : "pages/login.html";
  }

  function redirectToLogin(reason = "login-required") {
    const redirect = encodeURIComponent(getRedirectTarget());
    window.location.replace(`${getLoginPath()}?reason=${encodeURIComponent(reason)}&redirect=${redirect}`);
  }

  hideUnauthenticatedLogout();

  const tokenIssue = getTokenIssue(getToken());

  if (tokenIssue) {
    clearSession();
    redirectToLogin(tokenIssue);
    return;
  }

  document.addEventListener("DOMContentLoaded", hideUnauthenticatedLogout);
})();
