(function () {
  async function uploadFile(path, file) {
    const formData = new FormData();
    formData.append("file", file);

    return TradeAI.request(path, {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  const uploadApi = {
    productImage(file) {
      return uploadFile("/uploads/product-image", file);
    },
    certificate(file) {
      return uploadFile("/uploads/certificates", file);
    },
    catalog(file) {
      return uploadFile("/uploads/catalogs", file);
    },
    invoice(file) {
      return uploadFile("/uploads/invoices", file);
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    api: {
      ...(window.TradeAI?.api || {}),
      uploads: uploadApi,
    },
  };
})();
