(function () {
  const grid = document.getElementById("marketplaceGrid");
  const searchForm = document.getElementById("marketplaceSearchForm");
  const searchInput = document.getElementById("marketplaceSearch");
  const filterInputs = document.querySelectorAll("[data-marketplace-filter]");
  const empty = document.getElementById("marketplaceEmpty");
  const title = document.getElementById("marketplaceTitle");
  const api = window.TradeAI?.api?.marketplace;
  const mode = document.body.dataset.marketplace || "companies";

  if (!grid) return;

  const headings = {
    suppliers: "Verified Suppliers",
    importers: "Global Importers",
    companies: "Company Marketplace",
    products: "Product Marketplace",
  };

  if (title) title.textContent = headings[mode] || headings.companies;

  const demoCompanies = {
    companies: [
      {
        _id: "demo-company-1",
        publicSlug: "demo-global-spice-hub",
        companyName: "Demo Global Spice Hub",
        industry: "Agri exports",
        city: "Ahmedabad",
        country: "India",
        mainProducts: ["Turmeric", "Cumin", "Sesame", "Ready for GCC"],
        type: "Exporter",
        readiness: "Trade readiness: 82%",
        matchScore: "82/100",
        markets: ["UAE", "Kenya", "Saudi Arabia"],
        verificationStatus: "demo",
        kycStatus: "MVP Preview Data",
        demo: true,
      },
      {
        _id: "demo-company-2",
        publicSlug: "demo-engineering-exports",
        companyName: "Demo Engineering Exports",
        industry: "Light engineering",
        city: "Pune",
        country: "India",
        mainProducts: ["Fasteners", "Machine parts", "East Africa corridor"],
        type: "Exporter",
        readiness: "Trade readiness: 76%",
        matchScore: "76/100",
        markets: ["Kenya", "Tanzania", "UAE"],
        verificationStatus: "demo",
        kycStatus: "MVP Preview Data",
        demo: true,
      },
    ],
    suppliers: [
      {
        _id: "demo-supplier-1",
        publicSlug: "demo-supplier-east-africa",
        companyName: "Demo Supplier East Africa",
        industry: "Food products",
        city: "Rajkot",
        country: "India",
        mainProducts: ["Rice", "Spices", "Packaged foods"],
        type: "Supplier",
        readiness: "Trade readiness: 79%",
        matchScore: "79/100",
        markets: ["Kenya", "UAE", "East Africa"],
        verificationStatus: "demo",
        kycStatus: "Sample Supplier",
        demo: true,
      },
    ],
    importers: [
      {
        _id: "demo-importer-1",
        publicSlug: "demo-importer-gulf-trading",
        companyName: "Sample Importer Gulf Trading",
        industry: "Wholesale distribution",
        city: "Dubai",
        country: "UAE",
        mainProducts: ["Food imports", "Consumer goods", "Private label"],
        type: "Importer",
        readiness: "Buyer readiness: 84%",
        matchScore: "84/100",
        markets: ["India", "GCC", "East Africa"],
        verificationStatus: "demo",
        kycStatus: "Sample Importer",
        demo: true,
      },
    ],
  };

  const demoProducts = [
    {
      _id: "demo-product-1",
      name: "Demo Product: Organic Turmeric",
      category: "Spices",
      hsCode: "0910",
      exportCountry: "India to Kenya",
      availability: "MVP Preview Data",
      tags: ["Sample Data", "Buyer-ready", "East Africa"],
      type: "Buyer-ready",
      readiness: "Trade readiness: 78%",
      matchScore: "78/100",
      demo: true,
    },
    {
      _id: "demo-product-2",
      name: "Demo Product: Engineering Fasteners",
      category: "Light engineering",
      hsCode: "7318",
      exportCountry: "India to UAE",
      availability: "Sample Data",
      tags: ["GCC corridor", "Trade readiness", "Demo Product"],
      type: "Trade readiness",
      readiness: "Trade readiness: 74%",
      matchScore: "74/100",
      demo: true,
    },
  ];

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, type = "error") {
    window.TradeAI?.toast?.(message, type);
  }

  function requestTypeForItem(item) {
    if (mode === "products") return "product_inquiry";
    if (mode === "suppliers") return "supplier_intro";
    if (mode === "importers") return "importer_intro";

    const type = String(item.type || item.businessType || "").toLowerCase();

    if (type.includes("supplier")) return "supplier_intro";
    if (type.includes("importer")) return "importer_intro";
    if (type.includes("buyer")) return "buyer_intro";

    return "company_profile_intro";
  }

  function targetTypeForItem(item) {
    if (mode === "products") return "product";
    if (mode === "suppliers") return "supplier";
    if (mode === "importers") return "importer";

    const type = String(item.type || item.businessType || "").toLowerCase();

    if (type.includes("supplier")) return "supplier";
    if (type.includes("importer")) return "importer";
    if (type.includes("buyer")) return "buyer";

    return "company";
  }

  function getPrimaryProduct(item) {
    return (
      item.name ||
      item.product ||
      item.mainProducts?.[0] ||
      item.exportCategories?.[0] ||
      item.tags?.[0] ||
      ""
    );
  }

  function introContextAttributes(item) {
    const targetName = item.companyName || item.name || "Marketplace profile";
    const product = getPrimaryProduct(item);

    return [
      `data-intro-request`,
      `data-request-type="${escapeHtml(requestTypeForItem(item))}"`,
      `data-target-type="${escapeHtml(targetTypeForItem(item))}"`,
      `data-target-id="${escapeHtml(item._id || "")}"`,
      `data-target-slug="${escapeHtml(item.publicSlug || "")}"`,
      `data-target-name="${escapeHtml(targetName)}"`,
      `data-country="${escapeHtml(item.country || item.exportCountry || "")}"`,
      `data-industry="${escapeHtml(item.industry || item.category || "")}"`,
      `data-product="${escapeHtml(product)}"`,
      `data-source="${escapeHtml(`${mode}-marketplace`)}"`,
    ].join(" ");
  }

  function badge(profile) {
    if (profile.demo) {
      return `<span class="status-badge">MVP Preview Data</span>`;
    }

    if (profile.verificationStatus === "verified") {
      return `<span class="status-badge success">Verified</span>`;
    }
    return `<span class="status-badge">KYC ${escapeHtml(profile.kycStatus || "pending")}</span>`;
  }

  function renderCompanyCard(company) {
    const logo = company.logoUrl
      ? `<img src="${escapeHtml(company.logoUrl)}" alt="${escapeHtml(company.companyName)} logo" />`
      : `<i class="fa-solid fa-building"></i>`;
    return `
      <article class="marketplace-card">
        <div class="marketplace-logo">${logo}</div>
        <div>
          <div class="card-title-row">
            <h3>${escapeHtml(company.companyName || "Unnamed company")}</h3>
            ${badge(company)}
          </div>
          <p>${escapeHtml(company.industry || company.businessType || "Trade company")} - ${escapeHtml(company.city || "")} ${escapeHtml(company.country || "")}</p>
          <p class="table-subtext">Source: ${company.demo ? "SAMPLE" : "User-submitted company profile"} - Verification: ${escapeHtml(company.verificationStatus || "pending")}</p>
          <div class="tag-row">
            ${(company.mainProducts || company.exportCategories || []).slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
          <div class="marketplace-meta">
            <span><strong>${escapeHtml(company.type || company.businessType || "Trade company")}</strong> Buyer/supplier type</span>
            <span><strong>${escapeHtml(company.matchScore || company.reliabilityScore || "Preview")}</strong> Match score</span>
            <span><strong>${escapeHtml(company.readiness || "Readiness under review")}</strong> Trade readiness</span>
            <span><strong>${escapeHtml((company.markets || company.exportCountries || company.targetMarkets || []).slice(0, 2).join(", ") || company.country || "Target markets")}</strong> Key markets</span>
          </div>
          <div class="card-actions">
            <a class="feature-btn" href="company-public.html?slug=${encodeURIComponent(company.publicSlug || "demo-company-profile")}">View Profile</a>
            <button class="secondary" data-save-company="${escapeHtml(company._id || "")}" ${company.demo ? "data-demo-save" : ""}>Save</button>
            <button class="secondary" type="button" ${introContextAttributes(company)}>Request Intro</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderProductCard(product) {
    return `
      <article class="marketplace-card">
        <div class="marketplace-logo">${product.imageUrl ? `<img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" />` : `<i class="fa-solid fa-box"></i>`}</div>
        <div>
          <div class="card-title-row">
            <h3>${escapeHtml(product.name || "Demo Product")}</h3>
            <span class="status-badge">${escapeHtml(product.availability || "available")}</span>
          </div>
          <p>${escapeHtml(product.category || "Product")} - HS ${escapeHtml(product.hsCode || "N/A")} - ${escapeHtml(product.exportCountry || "")}</p>
          <div class="tag-row">
            ${(product.tags || []).slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
          <div class="marketplace-meta">
            <span><strong>${escapeHtml(product.hsCode || "N/A")}</strong> HS-code area</span>
            <span><strong>${escapeHtml(product.matchScore || "Preview")}</strong> Match score</span>
            <span><strong>${escapeHtml(product.readiness || "Readiness under review")}</strong> Trade readiness</span>
            <span><strong>${escapeHtml(product.exportCountry || "Target corridor")}</strong> Key corridor</span>
          </div>
          <div class="card-actions">
            <button class="feature-btn" type="button" ${introContextAttributes(product)}>Request Intro</button>
            <button class="secondary" data-save-product="${escapeHtml(product._id || "")}" ${product.demo ? "data-demo-save" : ""}>Save</button>
            <a class="secondary" href="company-public.html?slug=demo-global-spice-hub">View Profile</a>
          </div>
        </div>
      </article>
    `;
  }

  function getDemoItems() {
    return mode === "products" ? demoProducts : demoCompanies[mode] || demoCompanies.companies;
  }

  function getFilters() {
    return Array.from(filterInputs).reduce((filters, input) => {
      filters[input.dataset.marketplaceFilter] = input.value.trim().toLowerCase();
      return filters;
    }, {});
  }

  function itemSearchText(item) {
    return [
      item.companyName,
      item.name,
      item.country,
      item.city,
      item.industry,
      item.category,
      item.hsCode,
      item.exportCountry,
      item.type,
      item.readiness,
      item.verificationStatus,
      ...(item.mainProducts || []),
      ...(item.exportCategories || []),
      ...(item.tags || []),
      ...(item.markets || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function filterDemoItems(items) {
    const query = searchInput?.value.trim().toLowerCase() || "";
    const filters = getFilters();

    return items.filter((item) => {
      const text = itemSearchText(item);
      const matchesQuery = !query || text.includes(query);
      const matchesFilters = Object.values(filters).every((value) => !value || text.includes(value));
      return matchesQuery && matchesFilters;
    });
  }

  function renderPreviewState(reason) {
    const intro =
      reason === "empty"
        ? "Live marketplace results will appear here after backend data is available. For now, these clearly labeled sample cards show the intended MVP experience."
        : window.TradeAI?.getPreviewMessage?.(
            reason,
            "This marketplace is currently running in MVP preview mode. Live backend data will appear here after deployment.",
          ) || "This marketplace is currently running in MVP preview mode.";
    const demoItems = filterDemoItems(getDemoItems());

    grid.innerHTML = `
      <article class="empty-state">
        <h3>MVP Preview Data</h3>
        <p>${escapeHtml(intro)}</p>
      </article>
      ${demoItems
        .map((item) => (mode === "products" ? renderProductCard(item) : renderCompanyCard(item)))
        .join("") || '<article class="empty-state"><h3>No preview matches</h3><p>Try another country, category or keyword. Live buyer/supplier records will appear after backend deployment and verification.</p></article>'}
    `;
    empty.hidden = true;
  }

  function getIntroModal() {
    let modal = document.getElementById("marketplaceIntroModal");

    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "marketplaceIntroModal";
    modal.className = "modal-backdrop";
    modal.innerHTML = `
      <form class="modal-card marketplace-intro-form" id="marketplaceIntroForm">
        <h3>Request marketplace intro</h3>
        <p class="modal-message" id="marketplaceIntroSummary"></p>
        <input type="hidden" name="requestType" />
        <input type="hidden" name="targetType" />
        <input type="hidden" name="targetId" />
        <input type="hidden" name="targetSlug" />
        <input type="hidden" name="targetName" />
        <input type="hidden" name="country" />
        <input type="hidden" name="industry" />
        <input type="hidden" name="product" />
        <input type="hidden" name="source" />
        <div class="input-group">
          <label for="introName">Name</label>
          <input id="introName" name="name" type="text" required />
        </div>
        <div class="input-group">
          <label for="introEmail">Email</label>
          <input id="introEmail" name="email" type="email" required />
        </div>
        <div class="input-group">
          <label for="introCompany">Company</label>
          <input id="introCompany" name="company" type="text" />
        </div>
        <div class="input-group">
          <label for="introRoleType">Role/type</label>
          <select id="introRoleType" name="roleType">
            <option value="">Select role</option>
            <option value="exporter">Exporter</option>
            <option value="importer">Importer</option>
            <option value="consultant">Consultant</option>
            <option value="investor">Investor</option>
            <option value="mentor">Mentor</option>
            <option value="technical reviewer">Technical reviewer</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="input-group">
          <label for="introMessage">Message</label>
          <textarea id="introMessage" name="message" rows="4" required></textarea>
        </div>
        <p id="marketplaceIntroStatus" aria-live="polite"></p>
        <div class="modal-actions">
          <button type="button" class="secondary marketplace-intro-cancel">Cancel</button>
          <button type="submit" class="primary">Submit request</button>
        </div>
      </form>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".marketplace-intro-cancel").addEventListener("click", () => {
      modal.classList.remove("active");
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("active");
      }
    });
    modal.querySelector("form").addEventListener("submit", submitIntroRequest);

    return modal;
  }

  function openIntroModal(button) {
    const modal = getIntroModal();
    const form = modal.querySelector("form");
    const targetName = button.dataset.targetName || "this marketplace profile";
    const product = button.dataset.product || "";

    form.reset();
    [
      "requestType",
      "targetType",
      "targetId",
      "targetSlug",
      "targetName",
      "country",
      "industry",
      "product",
      "source",
    ].forEach((field) => {
      form.elements[field].value = button.dataset[field] || "";
    });
    form.elements.message.value = `Please review intro fit for ${targetName}${product ? ` (${product})` : ""}.`;
    modal.querySelector("#marketplaceIntroSummary").textContent =
      `Target: ${targetName}${product ? ` - ${product}` : ""}`;
    modal.querySelector("#marketplaceIntroStatus").textContent = "";
    modal.classList.add("active");
    window.requestAnimationFrame(() => form.elements.name.focus());
  }

  function buildIntroPayload(form) {
    const formData = new FormData(form);

    return Object.fromEntries(
      [
        "name",
        "email",
        "company",
        "roleType",
        "requestType",
        "targetType",
        "targetId",
        "targetSlug",
        "targetName",
        "country",
        "industry",
        "product",
        "message",
        "source",
      ].map((key) => [key, String(formData.get(key) || "").trim()]),
    );
  }

  async function submitIntroRequest(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const status = form.querySelector("#marketplaceIntroStatus");
    const submitButton = form.querySelector('button[type="submit"]');
    const fallbackMessage =
      "Intro request is running in MVP preview mode. Please use the contact form or try again after backend deployment.";

    if (!window.TradeAI?.api?.marketplace?.requestIntro) {
      status.textContent = fallbackMessage;
      showToast(fallbackMessage);
      return;
    }

    submitButton.disabled = true;

    try {
      await window.TradeAI.api.marketplace.requestIntro(buildIntroPayload(form));
      status.textContent = "Intro request saved for admin review.";
      showToast("Intro request saved for admin review.", "success");
      window.setTimeout(() => {
        document.getElementById("marketplaceIntroModal")?.classList.remove("active");
      }, 900);
    } catch (error) {
      status.textContent = fallbackMessage;
      showToast(fallbackMessage);
    } finally {
      submitButton.disabled = false;
    }
  }

  async function loadMarketplace() {
    grid.innerHTML = `<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>`;
    empty.hidden = true;

    try {
      if (!api?.[mode]) {
        renderPreviewState(
          new Error("Live marketplace data is not connected in this static MVP preview."),
        );
        return;
      }

      const params = { search: searchInput?.value.trim() || "", ...getFilters() };
      const data = await api[mode](params);
      const items = data.companies || data.products || [];

      if (!items.length) {
        renderPreviewState("empty");
        return;
      }

      grid.innerHTML = items
        .map((item) => (mode === "products" ? renderProductCard(item) : renderCompanyCard(item)))
        .join("");
      empty.hidden = items.length > 0;
    } catch (error) {
      renderPreviewState(error);
    }
  }

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    window.TradeAI?.analytics?.track("marketplace_search", {
      mode,
      query: searchInput?.value.trim() || "",
    });
    loadMarketplace();
  });

  filterInputs.forEach((input) => {
    input.addEventListener("change", () => {
      window.TradeAI?.analytics?.track("marketplace_filter", {
        mode,
        filter: input.dataset.marketplaceFilter,
        value: input.value,
      });
      loadMarketplace();
    });
  });

  grid.addEventListener("click", async (event) => {
    const companyButton = event.target.closest("[data-save-company]");
    const productButton = event.target.closest("[data-save-product]");
    const introButton = event.target.closest("[data-intro-request]");

    if (introButton) {
      openIntroModal(introButton);
      return;
    }

    if (event.target.closest("[data-demo-save]")) {
      showToast("Sample data cannot be saved in MVP preview mode.");
      return;
    }

    if (!window.TradeAI?.api?.savedItems) {
      showToast("Saving is in MVP preview mode. Live saves will work after backend deployment.");
      return;
    }

    try {
      if (companyButton) {
        await TradeAI.api.savedItems.saveCompany(companyButton.dataset.saveCompany);
        showToast("Company saved.", "success");
      }

      if (productButton) {
        await TradeAI.api.savedItems.saveProduct(productButton.dataset.saveProduct);
        showToast("Product saved.", "success");
      }
    } catch (error) {
      showToast(
        window.TradeAI?.getPreviewMessage?.(
          error,
          "Saving is in MVP preview mode. Live saved items will work after backend deployment.",
        ) || error.message,
        "error",
      );
    }
  });

  loadMarketplace();
})();
