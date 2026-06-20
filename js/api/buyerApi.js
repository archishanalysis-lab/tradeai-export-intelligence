(function () {
  const buyerApi = {
    list(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value ?? "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/buyers${suffix}`);
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
