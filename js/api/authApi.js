(function () {
  const authApi = {
    register(payload) {
      return TradeAI.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    login(payload) {
      return TradeAI.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    me() {
      return TradeAI.request("/auth/me");
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      auth: authApi,
    },
  };
})();
