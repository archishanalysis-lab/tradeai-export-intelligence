(function () {
  const profileApi = {
    get() {
      return TradeAI.request("/profile/me");
    },
    update(payload) {
      return TradeAI.request("/profile/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    submitKyc(documents) {
      return TradeAI.request("/profile/kyc", {
        method: "POST",
        body: JSON.stringify({ documents }),
      });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      profile: profileApi,
    },
  };
})();
