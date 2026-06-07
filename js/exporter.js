/* =========================================================
   TRADEAI EXPORTER PRODUCT SYSTEM
========================================================= */

(function () {
  const form = document.getElementById("productForm");
  const productId = document.getElementById("productId");
  const productTableBody = document.getElementById("productTableBody");
  const productAnalytics = document.getElementById("productAnalytics");
  const productSearch = document.getElementById("productSearch");
  const productSearchForm = document.getElementById("productSearchForm");
  const matchCards = document.getElementById("matchCards");
  const inquiryInbox = document.getElementById("inquiryInbox");
  const submitButton = document.getElementById("productSubmitBtn");

  if (!form || !window.TradeAI) return;

  const fields = {
    name: document.getElementById("exportProductName"),
    category: document.getElementById("exportCategory"),
    hsCode: document.getElementById("exportHsCode"),
    moq: document.getElementById("exportMoq"),
    price: document.getElementById("exportPrice"),
    targetCountries: document.getElementById("exportTargets"),
    exportCountry: document.getElementById("exportCountry"),
    availability: document.getElementById("exportAvailability"),
    imageUrl: document.getElementById("exportImageUrl"),
    imageFile: document.getElementById("exportImageFile"),
    tags: document.getElementById("exportTags"),
  };

  let products = [];

  const previewProducts = [
    {
      _id: "demo-product-turmeric",
      name: "Demo Preview: Organic Turmeric",
      category: "Spices",
      hsCode: "0910",
      moq: 500,
      price: { amount: 4.5, currency: "USD" },
      exportCountry: "India",
      availability: "Sample Data",
      demo: true,
    },
    {
      _id: "demo-product-fasteners",
      name: "Demo Preview: Engineering Fasteners",
      category: "Light engineering",
      hsCode: "7318",
      moq: 1000,
      price: { amount: 0.18, currency: "USD" },
      exportCountry: "India",
      availability: "MVP Preview",
      demo: true,
    },
  ];

  const previewMatches = [
    {
      buyer: { companyName: "Sample Data: Gulf Retail Buyer", country: "UAE", industry: "Food imports" },
      score: 88,
      reasons: ["Product fit", "GCC corridor", "Documentation pending"],
    },
    {
      buyer: { companyName: "Sample Data: East Africa Distributor", country: "Kenya", industry: "Wholesale distribution" },
      score: 81,
      reasons: ["Corridor match", "MOQ fit", "Buyer verification pending"],
    },
  ];

  const previewInquiries = [
    {
      companyName: "MVP Preview: Gulf Retail Buyer",
      product: { name: "Organic Turmeric" },
      status: "Sample inquiry",
      message: "Live inquiry pipeline will appear after backend deployment.",
    },
    {
      companyName: "MVP Preview: East Africa Distributor",
      product: { name: "Engineering Fasteners" },
      status: "Follow-up due",
      message: "Sample data is shown for stakeholder review.",
    },
  ];

  function listFromInput(value) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function formatMoney(product) {
    const amount = Number(product.price?.amount || 0);
    const currency = product.price?.currency || "USD";
    return amount ? `${currency} ${amount.toLocaleString()}` : "On request";
  }

  function getPayload() {
    return {
      name: fields.name.value.trim(),
      category: fields.category.value.trim(),
      hsCode: fields.hsCode.value.trim(),
      moq: Number(fields.moq.value) || 0,
      priceAmount: Number(fields.price.value) || 0,
      currency: "USD",
      targetCountries: listFromInput(fields.targetCountries.value),
      exportCountry: fields.exportCountry.value.trim(),
      availability: fields.availability.value,
      imageUrl: fields.imageUrl.value.trim(),
      tags: listFromInput(fields.tags.value),
    };
  }

  function resetImageInputs() {
    fields.imageUrl.disabled = false;
    fields.imageFile.disabled = false;
    fields.imageUrl.placeholder = "https://example.com/product.jpg";
  }

  function setLoading(message = "Loading products...") {
    if (!productTableBody) return;
    productTableBody.innerHTML = `<tr><td colspan="6">${message}</td></tr>`;
  }

  function renderAnalytics(data = {}, isDemo = false) {
    if (!productAnalytics) return;

    const metrics = isDemo
      ? {
          totalProducts: 2,
          activeProducts: 2,
          targetCountryCount: 4,
          estimatedCatalogValue: 12800,
        }
      : data;

    const cards = [
      ["Products", metrics.totalProducts || 0],
      ["Available", metrics.activeProducts || 0],
      ["Target countries", metrics.targetCountryCount || 0],
      ["Catalog value", `USD ${(metrics.estimatedCatalogValue || 0).toLocaleString()}`],
    ];

    productAnalytics.innerHTML = cards
      .map(
        ([title, value]) => `
          <article class="analytics-card">
            <h3>${title}</h3>
            <div class="summary-card">
              <h2>${value}</h2>
              <span class="status-badge status-active">${isDemo ? "MVP Preview" : "Live"}</span>
            </div>
          </article>
        `,
      )
      .join("");
  }

  function renderProducts() {
    if (!productTableBody) return;

    if (!products.length) {
      productTableBody.innerHTML = `
        <tr>
          <td colspan="6">No live products found yet. Sample data is shown for stakeholder review after backend deployment.</td>
        </tr>
      `;
      return;
    }

    productTableBody.innerHTML = products
      .map(
        (product) => `
          <tr>
            <td>
              <strong>${product.name}</strong>
              <div class="table-subtext">${product.category || "No category"} · ${
                product.exportCountry || "No export country"
              }${product.demo ? " - MVP Preview" : ""}</div>
            </td>
            <td>${product.hsCode || "-"}</td>
            <td>${product.moq || "-"}</td>
            <td>${formatMoney(product)}</td>
            <td><span class="status-badge status-active">${product.availability}</span></td>
            <td>
              <div class="table-actions">
                <button type="button" class="secondary edit-product" data-id="${product._id}" ${product.demo ? "disabled" : ""}>Edit</button>
                <button type="button" class="secondary match-product" data-id="${product._id}">Matches</button>
                <button type="button" class="secondary delete-product" data-id="${product._id}" ${product.demo ? "disabled" : ""}>Delete</button>
              </div>
            </td>
          </tr>
        `,
      )
      .join("");
  }

  function renderMatches(matches = []) {
    if (!matchCards) return;

    if (!matches.length) {
      matches = previewMatches;
    }

    matchCards.innerHTML = matches
      .map(
        ({ buyer, score, reasons }) => `
          <article class="tool-card match-card">
            <span class="status-pill">MVP Preview</span>
            <h3>${buyer.companyName}</h3>
            <p>${buyer.country} · ${buyer.industry}</p>
            <div class="match-score large-score" style="--score: ${score}%"><span></span></div>
            <p class="table-subtext">${score}% match · ${reasons.join(" · ")}</p>
          </article>
        `,
      )
      .join("");
  }

  function renderInquiries(items = []) {
    if (!inquiryInbox) return;

    if (!items.length) {
      items = previewInquiries;
    }

    inquiryInbox.innerHTML = items
      .map(
        (item) => `
          <article class="activity-card">
            <h4>${item.companyName || item.buyerName || "Buyer inquiry"}</h4>
            <p>${item.product?.name || "Product"} · ${item.status}</p>
            <p>${item.message || "No message provided."}</p>
          </article>
        `,
      )
      .join("");
  }

  async function loadProducts(search = "") {
    if (!TradeAI.auth.requireAuth()) return;

    setLoading();

    try {
      const params = new URLSearchParams({ limit: "20" });
      if (search) params.set("search", search);

      const data = await TradeAI.request(`/products?${params.toString()}`);
      products = data.products || [];
      if (!products.length) {
        products = previewProducts;
      }
      renderProducts();
    } catch (error) {
      products = previewProducts;
      renderProducts();
      TradeAI.toast?.(
        "Dashboard is running in MVP preview mode. Live product data will appear after backend deployment.",
        "error",
      );
    }
  }

  async function loadAnalytics() {
    try {
      const data = await TradeAI.request("/products/analytics/summary");
      renderAnalytics(data);
    } catch (error) {
      renderAnalytics({}, true);
    }
  }

  async function loadInquiries() {
    try {
      const data = await TradeAI.request("/inquiries");
      renderInquiries(data.inquiries || []);
    } catch (error) {
      renderInquiries(previewInquiries);
    }
  }

  async function loadMatches(id) {
    try {
      const data = await TradeAI.request(`/products/${id}/matches`);
      renderMatches(data.matches || []);
    } catch (error) {
      renderMatches(previewMatches);
      TradeAI.toast?.(
        "AI buyer matches are shown as MVP preview data until backend matching is available.",
        "error",
      );
    }
  }

  function fillForm(product) {
    productId.value = product._id;
    fields.name.value = product.name || "";
    fields.category.value = product.category || "";
    fields.hsCode.value = product.hsCode || "";
    fields.moq.value = product.moq || "";
    fields.price.value = product.price?.amount || "";
    fields.targetCountries.value = (product.targetCountries || []).join(", ");
    fields.exportCountry.value = product.exportCountry || "";
    fields.availability.value = product.availability || "available";
    fields.imageUrl.value = product.imageUrl || "";
    fields.imageFile.value = "";
    fields.tags.value = (product.tags || []).join(", ");
    resetImageInputs();
    submitButton.textContent = "Update product";
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function uploadProductImageIfNeeded() {
    const file = fields.imageFile?.files?.[0];

    if (!file) {
      return fields.imageUrl.value.trim();
    }

    if (!TradeAI.api?.uploads?.productImage) {
      throw new Error("Upload service is not available on this page.");
    }

    submitButton.textContent = "Uploading image...";
    const uploaded = await TradeAI.api.uploads.productImage(file);
    fields.imageUrl.value = uploaded.url || "";
    return uploaded.url || "";
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (!TradeAI.auth.isLoggedIn()) {
      TradeAI.toast?.(
        "Connect backend/login to save real products. This dashboard is currently in MVP preview mode.",
        "error",
      );
      return;
    }

    const payload = getPayload();

    if (!payload.name || !payload.category || !payload.hsCode || !payload.priceAmount) {
      TradeAI.toast("Product name, category, HS code and price are required.", "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = productId.value ? "Updating..." : "Saving...";

    try {
      const uploadedImageUrl = await uploadProductImageIfNeeded();
      if (uploadedImageUrl) {
        payload.imageUrl = uploadedImageUrl;
      }

      submitButton.textContent = productId.value ? "Updating..." : "Saving...";

      const path = productId.value ? `/products/${productId.value}` : "/products";
      const method = productId.value ? "PUT" : "POST";
      const data = await TradeAI.request(path, {
        method,
        body: JSON.stringify(payload),
      });

      TradeAI.toast(productId.value ? "Product updated." : "Product added.");
      form.reset();
      productId.value = "";
      resetImageInputs();
      submitButton.textContent = "Save product";

      if (data.matches) renderMatches(data.matches);
      await Promise.all([loadProducts(productSearch?.value.trim() || ""), loadAnalytics()]);
    } catch (error) {
      TradeAI.toast(error.message, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = productId.value ? "Update product" : "Save product";
    }
  }

  productTableBody?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;

    const product = products.find((item) => item._id === button.dataset.id);

    if (button.classList.contains("edit-product") && product) {
      fillForm(product);
      return;
    }

    if (button.classList.contains("match-product")) {
      await loadMatches(button.dataset.id);
      return;
    }

    if (button.classList.contains("delete-product")) {
      const confirmed = await TradeAI.confirmDialog("Delete this product?");
      if (!confirmed) return;

      try {
        await TradeAI.request(`/products/${button.dataset.id}`, { method: "DELETE" });
        TradeAI.toast("Product deleted.");
        await Promise.all([loadProducts(productSearch?.value.trim() || ""), loadAnalytics()]);
      } catch (error) {
        TradeAI.toast(error.message, "error");
      }
    }
  });

  productSearch?.addEventListener("input", () => {
    window.clearTimeout(productSearch.searchTimer);
    productSearch.searchTimer = window.setTimeout(() => {
      loadProducts(productSearch.value.trim());
    }, 280);
  });

  productSearchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    loadProducts(productSearch?.value.trim() || "");
  });

  fields.imageFile?.addEventListener("change", () => {
    const hasFile =
      Boolean(fields.imageFile.files?.length);

    fields.imageUrl.disabled =
      hasFile;

    if (hasFile) {
      fields.imageUrl.value = "";
      fields.imageUrl.placeholder = "Using uploaded image file";
    } else {
      fields.imageUrl.placeholder = "https://example.com/product.jpg";
    }
  });

  fields.imageUrl?.addEventListener("input", () => {
    const hasUrl =
      Boolean(fields.imageUrl.value.trim());

    fields.imageFile.disabled =
      hasUrl;

    if (!hasUrl) {
      fields.imageFile.disabled = false;
    }
  });

  form.addEventListener("submit", saveProduct);

  window.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadAnalytics();
    loadInquiries();
    renderMatches();
  });
})();
