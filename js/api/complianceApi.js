(function () {
  const complianceApi = {
    documents(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/compliance/documents${suffix}`, {
        skipHealthCheck: false,
      });
    },
    countryRules(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/compliance/country-rules${suffix}`, {
        skipHealthCheck: false,
      });
    },
    focusCountryGuidance(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/compliance/focus-country-guidance${suffix}`, {
        skipHealthCheck: false,
      });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      compliance: complianceApi,
    },
  };
})();
