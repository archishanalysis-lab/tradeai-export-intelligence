/* =========================================================
   TRADEAI BUYER MANAGEMENT UI
========================================================= */

(function () {
  const api = window.TradeAI;

  if (!api) return;

  const state = {
    buyers: [],
    editingId: null,
    page: 1,
    pages: 1,
    limit: 6,
    total: 0,
    search: "",
    isDemo: false,
  };

  const form = document.getElementById("buyerForm");
  const tableBody = document.getElementById("buyerTableBody");
  const tableWrap = document.getElementById("buyerTableWrap");
  const emptyState = document.getElementById("buyerEmptyState");
  const loadingState = document.getElementById("buyerLoadingState");
  const searchInput = document.getElementById("buyerSearch");
  const pagination = document.getElementById("buyerPagination");
  const formTitle = document.getElementById("buyerFormTitle");
  const submitButton = document.getElementById("buyerSubmitButton");
  const cancelButton = document.getElementById("buyerCancelButton");
  const stats = {
    total: document.getElementById("buyerTotalStat"),
    verified: document.getElementById("buyerVerifiedStat"),
    countries: document.getElementById("buyerCountriesStat"),
    matches: document.getElementById("buyerMatchStat"),
  };
  const finderForm = document.getElementById("buyerFinderForm");
  const finderSearch = document.getElementById("buyerFinderSearch");
  const finderHsCode = document.getElementById("buyerFinderHsCode");
  const finderCountry = document.getElementById("buyerFinderCountry");
  const finderButton = document.getElementById("buyerFinderButton");
  const finderStatus = document.getElementById("buyerFinderStatus");
  const finderResults = document.getElementById("buyerFinderResults");
  const finderList = document.getElementById("buyerFinderList");
  const finderCount = document.getElementById("buyerFinderCount");
  const finderSourceLabel = document.getElementById("buyerFinderSourceLabel");
  const crmSummary = document.querySelector(".buyer-crm-summary");
  const crmTools = document.querySelector(".buyer-crm-tools");
  const crmAiSection = document.querySelector(".buyer-ai-section");

  function normalizeProducts(value) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function escapeHtml(value = "") {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
  }

  function fillForm(buyer) {
    state.editingId = buyer._id;
    form.companyName.value = buyer.companyName || "";
    form.country.value = buyer.country || "";
    form.industry.value = buyer.industry || "";
    form.products.value = (buyer.products || []).join(", ");
    form.website.value = buyer.website || "";
    form.contactEmail.value = buyer.contactEmail || "";
    form.phone.value = buyer.phone || "";
    formTitle.textContent = "Edit buyer";
    submitButton.textContent = "Update buyer";
    cancelButton.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function resetForm() {
    state.editingId = null;
    form?.reset();
    if (formTitle) formTitle.textContent = "Add buyer";
    if (submitButton) submitButton.textContent = "Save buyer";
    if (cancelButton) cancelButton.hidden = true;
  }

  function setLoading(isLoading) {
    if (loadingState) loadingState.hidden = !isLoading;
    if (tableWrap) tableWrap.hidden = isLoading;
    if (emptyState && isLoading) emptyState.hidden = true;
  }

  function buyerScore(buyer) {
    if (Number.isFinite(buyer.aiMatchScore)) {
      return Math.min(Math.max(buyer.aiMatchScore, 0), 98);
    }

    let score = 58;
    if (buyer.verified) score += 18;
    if ((buyer.products || []).length >= 2) score += 12;
    if (buyer.contactEmail) score += 7;
    if (buyer.website) score += 5;
    return Math.min(score, 98);
  }

  function renderStats() {
    const countries = new Set(state.buyers.map((buyer) => buyer.country).filter(Boolean));
    const verified = state.buyers.filter((buyer) => buyer.verified && !buyer.demo).length;

    if (stats.total) stats.total.textContent = state.total;
    if (stats.verified) stats.verified.textContent = verified;
    if (stats.countries) stats.countries.textContent = countries.size;
    if (stats.matches) stats.matches.textContent = state.buyers.length
      ? `${Math.round(state.buyers.reduce((sum, buyer) => sum + buyerScore(buyer), 0) / state.buyers.length)}%`
      : "0%";
  }

  function renderTable() {
    if (!tableBody) return;

    tableBody.innerHTML = state.buyers
      .map((buyer) => {
        const products = (buyer.products || []).slice(0, 3).join(", ") || "Not listed";
        const score = buyerScore(buyer);
        const verificationStatus = buyer.verificationStatus || (buyer.verified ? "manually_verified" : "unverified");
        const statusText = buyer.demo
          ? buyer.status || "Sample profile"
          : verificationStatus === "manually_verified"
            ? "Manually verified"
            : verificationStatus.replace(/_/g, " ");
        const statusClass = buyer.demo ? "status-pending" : verificationStatus === "manually_verified" ? "status-active" : "status-pending";
        const sourceLabel = buyer.demo
          ? "Sample/demo - SAMPLE"
          : `${buyer.dataSourceCategory || "Curated/rule-engine"} - ${buyer.sourceName || buyer.sourceType || "User submitted"} - ${statusText}`;

        return `
          <tr>
            <td>
              <strong>${buyer.companyName}</strong>
              <span class="table-subtext">${buyer.demo ? "DEMO DATA - not a verified buyer" : buyer.publicContactEmail || buyer.contactEmail || "No public email listed"}</span>
              <span class="table-subtext">Source: ${sourceLabel}</span>
            </td>
            <td>${buyer.country}</td>
            <td>${buyer.industry}</td>
            <td>${products}</td>
            <td>
              <span class="match-score" style="--score: ${score}%"><span></span></span>
              <strong>${score}%</strong>
            </td>
            <td>
              <span class="status-badge ${statusClass}">
                ${statusText}
              </span>
            </td>
            <td>
              <div class="table-actions">
                <button type="button" class="icon-btn small-icon" data-action="edit" data-id="${buyer._id}" title="${buyer.demo ? "Demo profile cannot be edited" : "Edit buyer"}" ${buyer.demo ? "disabled" : ""}>
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="icon-btn small-icon" data-action="save" data-id="${buyer._id}" title="${buyer.demo ? "Demo profile cannot be saved" : "Save buyer profile"}" ${buyer.demo ? "disabled" : ""}>
                  <i class="fa-solid fa-bookmark"></i>
                </button>
                <button type="button" class="icon-btn small-icon danger-icon" data-action="delete" data-id="${buyer._id}" title="${buyer.demo ? "Demo profile cannot be deleted" : "Delete buyer"}" ${buyer.demo ? "disabled" : ""}>
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    if (emptyState) emptyState.hidden = state.buyers.length > 0;
    if (tableWrap) tableWrap.hidden = state.buyers.length === 0;
  }

  function renderPagination() {
    if (!pagination) return;

    if (state.isDemo) {
      pagination.innerHTML = "";
      return;
    }

    pagination.innerHTML = `
      <button type="button" class="secondary" data-page="${state.page - 1}" ${state.page <= 1 ? "disabled" : ""}>Previous</button>
      <span>Page ${state.page} of ${state.pages}</span>
      <button type="button" class="secondary" data-page="${state.page + 1}" ${state.page >= state.pages ? "disabled" : ""}>Next</button>
    `;
  }

  function renderFinderResults(buyers, context = {}) {
    if (!finderList || !finderResults) return;

    if (!buyers.length) {
      finderList.innerHTML = `
        <div class="buyer-discovery-empty">
          <strong>No source-labeled buyer records matched this context.</strong>
          <p>Try a broader product term, remove the HS code, or search all available countries. TradeAI does not insert demo leads into authenticated results.</p>
        </div>
      `;
    } else {
      finderList.innerHTML = buyers
      .map((buyer) => {
        const initial = escapeHtml((buyer.companyName || "B").trim().charAt(0));
        const verificationStatus = buyer.verificationStatus === "manually_verified"
          ? "Manually verified"
          : String(buyer.verificationStatus || "Unverified").replace(/_/g, " ");
        const sourceCategory = buyer.dataSourceCategory || (buyer.isDemo ? "Sample/demo" : "Curated/rule-engine");
        const sourceName = buyer.sourceName || buyer.sourceType || "User submitted";
        const products = (buyer.products || []).slice(0, 3).join(", ") || context.product || "Product not listed";
        const contact = buyer.publicContactEmail
          ? `Public contact: ${buyer.publicContactEmail}`
          : buyer.contactAccess === "organization-private" && buyer.contactEmail
            ? `Organization contact: ${buyer.contactEmail}`
            : "Private contact hidden";
        const statusClass = buyer.verificationStatus === "manually_verified" ? "high" : "med";

        return `
          <article class="target-importer-row">
            <div class="importer-name">
              <div class="importer-avatar">${initial}</div>
              <strong>${escapeHtml(buyer.companyName || "Unnamed buyer")}</strong>
              <span>${escapeHtml(products)}</span>
            </div>
            <div class="importer-industry">${escapeHtml(buyer.country || "Country not listed")}</div>
            <div class="importer-shipments">${escapeHtml(sourceName)}<br><small>${escapeHtml(contact)}</small></div>
            <div class="importer-score">
              <strong>${escapeHtml(sourceCategory)}</strong>
            </div>
            <span class="buyer-rating ${statusClass}">${escapeHtml(verificationStatus)}</span>
            <span class="unlock-row-btn" title="${escapeHtml(sourceName)}" aria-label="Record provenance"><i class="fa-solid fa-shield-halved"></i></span>
          </article>
        `;
      })
      .join("");
    }

    if (finderCount) finderCount.textContent = `${buyers.length} ${buyers.length === 1 ? "MATCH" : "MATCHES"}`;
    if (finderSourceLabel) finderSourceLabel.textContent = buyers.length ? "SOURCE-LABELED RESULTS" : "NO MATCHES";
    finderResults.hidden = false;
    finderResults.classList.remove("finder-results-visible");
    window.requestAnimationFrame(() => {
      finderResults.classList.add("finder-results-visible");
    });
  }

  function setFinderStatus(message, isError = false) {
    if (!finderStatus) return;
    finderStatus.textContent = message;
    finderStatus.style.color = isError ? "var(--color-danger, #fb7185)" : "";
  }

  function prefillFinderContext() {
    if (!finderSearch) return;

    let pending = {};
    try {
      pending = JSON.parse(localStorage.getItem("tradeai_pending_country_fit") || "{}");
    } catch (_error) {
      pending = {};
    }

    finderSearch.value = pending.productName || localStorage.getItem("tradeai_selected_product") || finderSearch.value;
    if (finderHsCode) finderHsCode.value = pending.hsCode || localStorage.getItem("tradeai_selected_hsCode") || "";

    const targetCountry = pending.targetCountries?.[0] || localStorage.getItem("tradeai_selected_country") || "";
    if (finderCountry && Array.from(finderCountry.options).some((option) => option.value === targetCountry)) {
      finderCountry.value = targetCountry;
    }
  }

  async function discoverBuyers() {
    const buyerApi = api.api?.buyers;
    const product = finderSearch?.value.trim() || "";
    const hsCode = finderHsCode?.value.trim() || "";
    const country = finderCountry?.value || "";

    if (!product) {
      setFinderStatus("Enter a product name to search buyer records.", true);
      finderSearch?.focus();
      return;
    }

    if (!buyerApi?.list) {
      setFinderStatus("Buyer Discovery API is unavailable. Refresh the dashboard and try again.", true);
      return;
    }

    try {
      if (finderButton) finderButton.disabled = true;
      setFinderStatus("Searching authenticated, source-labeled buyer records...");
      const data = await buyerApi.list({ product, hsCode, country, page: 1, limit: 20 });
      const buyers = Array.isArray(data) ? data : data.buyers || [];
      renderFinderResults(buyers, { product, hsCode, country });
      setFinderStatus(
        buyers.length
          ? `${buyers.length} record${buyers.length === 1 ? "" : "s"} found. Check each source and verification label before outreach.`
          : "No matching records found. Broaden the search context and try again.",
      );
    } catch (error) {
      if (finderResults) finderResults.hidden = true;
      setFinderStatus(error.message || "Buyer Discovery could not load results.", true);
    } finally {
      if (finderButton) finderButton.disabled = false;
    }
  }

  async function loadBuyers() {
    if (!tableBody) return;

    try {
      setLoading(true);
      if (emptyState) {
        emptyState.innerHTML = "<h3>No buyers found</h3><p>Add your first buyer or change the search term.</p>";
      }
      const params = new URLSearchParams({
        page: state.page,
        limit: state.limit,
      });

      if (state.search) params.set("search", state.search);

      const data = await api.api.buyers.list(Object.fromEntries(params));
      state.buyers = Array.isArray(data) ? data : data.buyers || [];
      state.page = data.page || state.page;
      state.pages = data.pages || 1;
      state.total = data.total ?? state.buyers.length;
      state.isDemo = false;
      renderStats();
      renderTable();
      renderPagination();
    } catch (error) {
      state.buyers = [];
      state.total = 0;
      state.pages = 1;
      state.isDemo = false;
      renderStats();
      renderTable();
      renderPagination();
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.innerHTML = `<h3>Buyer records could not be loaded</h3><p>${escapeHtml(error.message || "Check the backend connection and try again.")}</p>`;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      companyName: form.companyName.value.trim(),
      country: form.country.value.trim(),
      industry: form.industry.value.trim(),
      products: normalizeProducts(form.products.value),
      website: form.website.value.trim(),
      contactEmail: form.contactEmail.value.trim(),
      phone: form.phone.value.trim(),
    };

    if (!payload.companyName || !payload.country || !payload.industry) {
      api.toast("Company, country and industry are required.", "error");
      return;
    }

    try {
      submitButton.disabled = true;
      const path = state.editingId ? `/buyers/${state.editingId}` : "/buyers";
      const method = state.editingId ? "PUT" : "POST";

      await api.request(path, {
        method,
        body: JSON.stringify(payload),
      });

      api.toast(state.editingId ? "Buyer updated successfully." : "Buyer added successfully.");
      resetForm();
      await loadBuyers();
    } catch (error) {
      api.toast(error.message, "error");
    } finally {
      submitButton.disabled = false;
    }
  }

  async function handleTableAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const buyer = state.buyers.find((item) => item._id === button.dataset.id);
    if (!buyer) return;

    if (button.dataset.action === "edit") {
      fillForm(buyer);
      return;
    }

    if (button.dataset.action === "save") {
      if (!api.api?.savedItems?.saveBuyer) {
        api.toast("Saved profile service is not available.", "error");
        return;
      }

      try {
        await api.api.savedItems.saveBuyer(buyer._id);
        api.toast(`${buyer.companyName} saved to your profile list.`);
      } catch (error) {
        api.toast(error.message, "error");
      }
      return;
    }

    const confirmed = await api.confirmDialog(`Delete ${buyer.companyName}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.request(`/buyers/${buyer._id}`, { method: "DELETE" });
      api.toast("Buyer deleted successfully.");
      await loadBuyers();
    } catch (error) {
      api.toast(error.message, "error");
    }
  }

  function bindEvents() {
    form?.addEventListener("submit", handleSubmit);
    cancelButton?.addEventListener("click", resetForm);
    tableBody?.addEventListener("click", handleTableAction);
    pagination?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-page]");
      if (!button || button.disabled) return;
      state.page = Number(button.dataset.page);
      loadBuyers();
    });
    searchInput?.addEventListener("input", () => {
      window.clearTimeout(searchInput.searchTimer);
      searchInput.searchTimer = window.setTimeout(() => {
        state.search = searchInput.value.trim();
        state.page = 1;
        loadBuyers();
      }, 300);
    });
    finderForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      discoverBuyers();
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (!document.querySelector("[data-buyer-management]")) return;

    bindEvents();
    prefillFinderContext();

    if (!api.auth.isLoggedIn()) {
      if (crmSummary) crmSummary.hidden = true;
      if (crmTools) crmTools.hidden = true;
      if (crmAiSection) crmAiSection.hidden = true;
      return;
    }

    loadBuyers();
  });
})();
