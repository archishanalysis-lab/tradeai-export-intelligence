(function () {
  const adminApi = {
    overview() {
      return TradeAI.request("/admin/overview");
    },
    users() {
      return TradeAI.request("/admin/users");
    },
    updateUserStatus(id, status) {
      return TradeAI.request(`/admin/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    buyers() {
      return TradeAI.request("/admin/buyers");
    },
    verifyBuyer(id) {
      return TradeAI.request(`/admin/buyers/${id}/verify`, { method: "PATCH" });
    },
    products() {
      return TradeAI.request("/admin/products");
    },
    updateProductApproval(id, approvalStatus) {
      return TradeAI.request(`/admin/products/${id}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ approvalStatus }),
      });
    },
    inquiries() {
      return TradeAI.request("/admin/inquiries");
    },
    contactFeedback(params = {}) {
      return TradeAI.request(`/admin/contact-feedback?${new URLSearchParams(params).toString()}`);
    },
    updateContactFeedbackStatus(id, payload) {
      return TradeAI.request(`/admin/contact-feedback/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    reportRequests(params = {}) {
      return TradeAI.request(`/report-requests?${new URLSearchParams(params).toString()}`);
    },
    updateReportRequestStatus(id, payload) {
      return TradeAI.request(`/report-requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    marketplaceIntroRequests(params = {}) {
      return TradeAI.request(`/marketplace-intros?${new URLSearchParams(params).toString()}`);
    },
    updateMarketplaceIntroRequestStatus(id, payload) {
      return TradeAI.request(`/marketplace-intros/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      admin: adminApi,
    },
  };
})();
