(function () {
  const preferencesApi = {
    get() {
      return TradeAI.request("/preferences");
    },
    update(payload) {
      return TradeAI.request("/preferences", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      preferences: preferencesApi,
    },
  };
})();
