(function () {
  const isLocalHost = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
  const configuredBaseUrl = window.TRADEAI_BACKEND_URL || window.TRADEAI_API_URL;
  const apiBaseUrl = (configuredBaseUrl || (isLocalHost
    ? "http://localhost:5000"
    : "https://tradeai-export-intelligence-1.onrender.com")).replace(/\/$/, "");

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
