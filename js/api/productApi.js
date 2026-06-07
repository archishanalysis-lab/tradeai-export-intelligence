(function () {
  const productApi = {
    list(params = {}) {
      return TradeAI.request(`/products?${new URLSearchParams(params).toString()}`);
    },
    analytics() {
      return TradeAI.request("/products/analytics/summary");
    },
    get(id) {
      return TradeAI.request(`/products/${id}`);
    },
    create(payload) {
      return TradeAI.request("/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return TradeAI.request(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    remove(id) {
      return TradeAI.request(`/products/${id}`, { method: "DELETE" });
    },
    matches(id) {
      return TradeAI.request(`/products/${id}/matches`);
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      products: productApi,
    },
  };
})();
