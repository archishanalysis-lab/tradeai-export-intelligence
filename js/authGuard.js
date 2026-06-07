(function () {
  const TOKEN_KEY = "tradeai_token";
  const LOGIN_PATH = "/pages/login.html";

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

  function redirectToLogin() {
    const redirect = encodeURIComponent(getRedirectTarget());
    window.location.replace(`${LOGIN_PATH}?redirect=${redirect}`);
  }

  hideUnauthenticatedLogout();

  if (!getToken()) {
    redirectToLogin();
    return;
  }

  document.addEventListener("DOMContentLoaded", hideUnauthenticatedLogout);
})();
