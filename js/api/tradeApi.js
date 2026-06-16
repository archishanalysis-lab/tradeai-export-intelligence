(function () {
  const tradeApi = {
    hsCodes(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/trade/hs-codes${suffix}`, {
        skipHealthCheck: false,
      });
    },
    tariffs(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/trade/tariffs${suffix}`, {
        skipHealthCheck: false,
      });
    },
    incoterms(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/trade/incoterms${suffix}`, {
        skipHealthCheck: false,
      });
    },
    paymentTerms(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/trade/payment-terms${suffix}`, {
        skipHealthCheck: false,
      });
    },
    customsClearance(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/trade/customs-clearance${suffix}`, {
        skipHealthCheck: false,
      });
    },
    logistics(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/trade/logistics${suffix}`, {
        skipHealthCheck: false,
      });
    },
    communicationTemplates(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        const cleanValue = String(value || "").trim();
        if (cleanValue) query.set(key, cleanValue);
      });

      const suffix = query.toString() ? `?${query.toString()}` : "";
      return TradeAI.request(`/trade/communication-templates${suffix}`, {
        skipHealthCheck: false,
      });
    },
    communicationGenerate(payload = {}) {
      return TradeAI.request("/trade/communication-generate", {
        method: "POST",
        body: JSON.stringify(payload),
        skipHealthCheck: false,
      });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      trade: tradeApi,
    },
  };
})();
