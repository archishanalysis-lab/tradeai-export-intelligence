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
    get(id) {
      return TradeAI.request(`/reports/${id}`);
    },
    exportUrl(id, format = "txt") {
      return `${TradeAI.API_BASE_URL}/reports/${id}/export?format=${encodeURIComponent(format)}`;
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
