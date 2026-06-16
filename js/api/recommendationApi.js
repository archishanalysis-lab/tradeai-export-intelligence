(function () {
  const recommendationApi = {
    countries(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/recommendations/country${suffix}`, {
        skipHealthCheck: false,
      });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      recommendations: recommendationApi,
    },
  };
})();
