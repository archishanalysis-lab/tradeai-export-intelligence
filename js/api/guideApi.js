(function () {
  const guideApi = {
    exportImportProcess() {
      return TradeAI.request("/guide/export-import-process", {
        skipHealthCheck: false,
      });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      guide: guideApi,
    },
  };
})();
