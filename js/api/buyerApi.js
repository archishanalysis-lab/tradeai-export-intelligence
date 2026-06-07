(function () {
  const buyerApi = {
    list(params = {}) {
      return TradeAI.request(`/buyers?${new URLSearchParams(params).toString()}`);
    },
    get(id) {
      return TradeAI.request(`/buyers/${id}`);
    },
    create(payload) {
      return TradeAI.request("/buyers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return TradeAI.request(`/buyers/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    remove(id) {
      return TradeAI.request(`/buyers/${id}`, { method: "DELETE" });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      buyers: buyerApi,
    },
  };
})();
