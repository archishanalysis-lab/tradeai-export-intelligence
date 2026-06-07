(function () {
  const inquiryApi = {
    list(params = {}) {
      return TradeAI.request(`/inquiries?${new URLSearchParams(params).toString()}`);
    },
    create(payload) {
      return TradeAI.request("/inquiries", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateStatus(id, status) {
      return TradeAI.request(`/inquiries/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
    addMessage(id, message) {
      return TradeAI.request(`/inquiries/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      inquiries: inquiryApi,
    },
  };
})();
