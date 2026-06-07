(function () {
  const marketplaceApi = {
    companies(params = {}) {
      return TradeAI.request(`/marketplace/companies?${new URLSearchParams(params)}`);
    },
    suppliers(params = {}) {
      return TradeAI.request(`/marketplace/suppliers?${new URLSearchParams(params)}`);
    },
    importers(params = {}) {
      return TradeAI.request(`/marketplace/importers?${new URLSearchParams(params)}`);
    },
    products(params = {}) {
      return TradeAI.request(`/marketplace/products?${new URLSearchParams(params)}`);
    },
    company(slug) {
      return TradeAI.request(`/marketplace/companies/${slug}`);
    },
    review(slug, payload) {
      return TradeAI.request(`/marketplace/companies/${slug}/reviews`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    requestIntro(payload) {
      return TradeAI.request("/marketplace-intros", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      marketplace: marketplaceApi,
    },
  };
})();
