(function () {
  const reportApi = {
    list() {
      return TradeAI.request("/reports");
    },
    create(payload) {
      return TradeAI.request("/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    createOpportunity(payload) {
      return TradeAI.request("/reports/opportunity", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    generate(payload) {
      return TradeAI.request("/reports/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    myReports() {
      return TradeAI.request("/reports/my-reports");
    },
    getMyReport(id) {
      return TradeAI.request(`/reports/my-reports/${encodeURIComponent(id)}`);
    },
    get(id) {
      return TradeAI.request(`/reports/${id}`);
    },
    exportUrl(id, format = "txt") {
      const apiUrl = TradeAI.config?.API_URL || TradeAI.API_BASE_URL;
      return `${apiUrl}/reports/${id}/export?format=${encodeURIComponent(format)}`;
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      reports: reportApi,
    },
  };
})();
