(function () {
  const dealApi = {
    list(params = {}) {
      return TradeAI.request(`/deals?${new URLSearchParams(params).toString()}`);
    },
    get(id) {
      return TradeAI.request(`/deals/${id}`);
    },
    create(payload) {
      return TradeAI.request("/deals", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return TradeAI.request(`/deals/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    remove(id) {
      return TradeAI.request(`/deals/${id}`, { method: "DELETE" });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      deals: dealApi,
    },
  };
})();
