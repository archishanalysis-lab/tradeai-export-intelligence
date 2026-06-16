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
    tradeReadiness(payload) {
      return TradeAI.request("/reports/trade-readiness", {
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
    deleteMyReport(id) {
      return TradeAI.request(`/reports/my-reports/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
    async downloadMyReport(id) {
      const apiUrl = TradeAI.config?.API_URL || TradeAI.API_BASE_URL;
      const token = TradeAI.auth?.getToken?.();

      if (TradeAI.ensureBackendReady) {
        await TradeAI.ensureBackendReady();
      }

      const response = await fetch(`${apiUrl}/reports/my-reports/${encodeURIComponent(id)}/export`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 401 && TradeAI.redirectToLogin) {
        TradeAI.redirectToLogin("session-expired");
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Report download failed.");
      }

      const disposition = response.headers.get("content-disposition") || "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/i);

      return {
        blob: await response.blob(),
        filename: filenameMatch?.[1] || "tradeai-report.txt",
      };
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
