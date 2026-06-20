(function () {
  const LOCAL_BACKEND_URL = "http://localhost:5000";
  const PRODUCTION_BACKEND_URL = "https://tradeai-export-intelligence-1.onrender.com";
  const configuredBaseUrl = window.TRADEAI_BACKEND_URL || window.TRADEAI_API_URL;
  const hostname = String(window.location.hostname || "").toLowerCase();
  const defaultBaseUrl =
    hostname === "localhost" || hostname === "127.0.0.1"
      ? LOCAL_BACKEND_URL
      : PRODUCTION_BACKEND_URL;
  const normalizeBackendBaseUrl = (url) => {
    const cleanUrl = String(url || "").replace(/\/$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl.slice(0, -4) : cleanUrl;
  };
  const apiBaseUrl = normalizeBackendBaseUrl(configuredBaseUrl || defaultBaseUrl);

  window.TradeAI = {
    ...(window.TradeAI || {}),
    config: {
      ...(window.TradeAI?.config || {}),
      API_BASE_URL: apiBaseUrl,
      API_URL: `${apiBaseUrl}/api`,
    },
  };

  window.TRADEAI_API_URL = apiBaseUrl;
})();
