(function () {
  const savedItemApi = {
    list() {
      return TradeAI.request("/saved-items");
    },
    saveBuyer(buyer, notes = "") {
      return TradeAI.request("/saved-items/buyers", {
        method: "POST",
        body: JSON.stringify({ buyer, notes }),
      });
    },
    saveCompany(companyProfile, notes = "") {
      return TradeAI.request("/saved-items/companies", {
        method: "POST",
        body: JSON.stringify({ companyProfile, notes }),
      });
    },
    saveProduct(product, notes = "") {
      return TradeAI.request("/saved-items/products", {
        method: "POST",
        body: JSON.stringify({ product, notes }),
      });
    },
    remove(id) {
      return TradeAI.request(`/saved-items/${id}`, { method: "DELETE" });
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      savedItems: savedItemApi,
    },
  };
})();
