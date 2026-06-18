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
  const finderResults = document.getElementById("buyerFinderResults");
  const finderList = document.getElementById("buyerFinderList");
  const finderCount = document.getElementById("buyerFinderCount");
  const crmSummary = document.querySelector(".buyer-crm-summary");
  const crmTools = document.querySelector(".buyer-crm-tools");
  const crmAiSection = document.querySelector(".buyer-ai-section");

  const demoBuyers = [
    {
      _id: "demo-buyer-1",
      companyName: "Sample Gulf Retail Sourcing Hub",
      country: "UAE",
      industry: "Food imports",
      products: ["Spices", "Packaged foods", "Organic staples"],
      aiMatchScore: 91,
      status: "Sample profile",
      demo: true,
    },
    {
      _id: "demo-buyer-2",
      companyName: "Sample East Africa Distribution Co.",
      country: "Kenya",
      industry: "Wholesale distribution",
      products: ["Rice", "Tea", "FMCG"],
      aiMatchScore: 88,
      status: "Sample profile",
      demo: true,
    },
    {
      _id: "demo-buyer-3",
      companyName: "Sample Riyadh Premium Foods Desk",
      country: "Saudi Arabia",
      industry: "Premium food retail",
      products: ["Coffee", "Processed foods", "Spices"],
      aiMatchScore: 84,
      status: "Sample profile",
      demo: true,
    },
    {
      _id: "demo-buyer-4",
      companyName: "Sample Dar es Salaam Trade Partners",
      country: "Tanzania",
      industry: "Importer network",
      products: ["Pharma", "Packaging", "Consumer goods"],
      aiMatchScore: 81,
      status: "Sample profile",
      demo: true,
    },
    {
      _id: "demo-buyer-5",
      companyName: "Sample Doha Construction Supply Desk",
      country: "Qatar",
      industry: "Construction materials",
      products: ["Tools", "Hardware", "Industrial supplies"],
      aiMatchScore: 79,
      status: "Sample profile",
      demo: true,
    },
    {
      _id: "demo-buyer-6",
      companyName: "Sample Kampala FMCG Import Desk",
      country: "Uganda",
      industry: "FMCG imports",
      products: ["Packaged foods", "Personal care", "Textiles"],
      aiMatchScore: 76,
      status: "Sample profile",
      demo: true,
    },
    {
      _id: "demo-buyer-7",
      companyName: "Sample Muscat Hospitality Procurement",
      country: "Oman",
      industry: "Hospitality supply",
      products: ["Food service", "Linens", "Specialty ingredients"],
      aiMatchScore: 73,
      status: "Sample profile",
      demo: true,
    },
    {
      _id: "demo-buyer-8",
      companyName: "Sample Kigali SME Trade Collective",
      country: "Rwanda",
      industry: "SME trade network",
      products: ["Packaging", "Food products", "Light machinery"],
      aiMatchScore: 70,
      status: "Sample profile",
      demo: true,
    },
  ];

  const demoImporters = [
    {
      companyName: "Sample Gulf Retail Buyer",
      industry: "FMCG / Food",
      shipments: "MVP preview profile",
      rating: "HIGH",
      score: 94,
    },
    {
      companyName: "Sample Spice Import Desk",
      industry: "Spices",
      shipments: "MVP preview profile",
      rating: "HIGH",
      score: 91,
    },
    {
      companyName: "Sample East Africa Distributor",
      industry: "Food Products",
      shipments: "MVP preview profile",
      rating: "MED",
      score: 78,
    },
    {
      companyName: "Sample Packaging Buyer",
      industry: "Packaging",
      shipments: "MVP preview profile",
      rating: "MED",
      score: 72,
    },
    {
      companyName: "Sample Beverage Procurement Team",
      industry: "Beverages",
      shipments: "MVP preview profile",
      rating: "LOW",
      score: 61,
    },
  ];

  function normalizeProducts(value) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
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
    form.verified.checked = Boolean(buyer.verified);
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
    if (emptyState) emptyState.hidden = true;
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

  function renderDemoNotice() {
    const panel = document.querySelector(".buyer-table-panel");
    const heading = panel?.querySelector(".panel-heading");
    if (!panel || !heading) return;

    let notice = panel.querySelector("[data-buyer-demo-notice]");
    if (!state.isDemo) {
      notice?.remove();
      return;
    }

    if (!notice) {
      notice = document.createElement("div");
      notice.dataset.buyerDemoNotice = "true";
      notice.className = "empty-state";
      heading.insertAdjacentElement("afterend", notice);
    }

    notice.hidden = false;
    notice.innerHTML = `
      <span class="section-kicker">DEMO DATA</span>
      <h3>Sample buyer profiles for MVP preview.</h3>
      <p>
        These are example buyer profiles for product-flow review only. They are
        not verified real companies and should not be used for outreach.
      </p>
      <div class="form-actions">
        <button type="button" class="secondary" data-buyer-demo-action="search">Search your first market</button>
        <a class="secondary" href="copilot.html">Ask TradeAI Copilot</a>
      </div>
    `;
  }

  function renderTable() {
    if (!tableBody) return;

    renderDemoNotice();

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
          ? "SAMPLE"
          : `${buyer.sourceName || buyer.sourceType || "User submitted"} - ${statusText}`;

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

  function renderFinderResults(searchTerm) {
    if (!finderList || !finderResults) return;

    const label = searchTerm || "your product";

    finderList.innerHTML = demoImporters
      .map((buyer) => {
        const initial = buyer.companyName.trim().charAt(0);
        const ratingClass = buyer.rating.toLowerCase();

        return `
          <article class="target-importer-row">
            <div class="importer-name">
              <div class="importer-avatar">${initial}</div>
              <strong>${buyer.companyName}</strong>
              <span>${label} buyer signal</span>
            </div>
            <div class="importer-industry">${buyer.industry}</div>
            <div class="importer-shipments">${buyer.shipments}</div>
            <div class="importer-score">
              <span class="match-score" style="--score: ${buyer.score}%"><span></span></span>
              <strong>${buyer.score}%</strong>
            </div>
            <span class="buyer-rating ${ratingClass}">${buyer.rating}</span>
            <a
              href="pricing.html"
              class="unlock-row-btn"
              aria-label="Unlock ${buyer.companyName}"
              data-requires-plan="paid"
              data-plan-message="Buyer contact details and shipment histories are available after activating a paid plan."
            >
              <i class="fa-solid fa-arrow-right"></i>
            </a>
          </article>
        `;
      })
      .join("");

    if (finderCount) finderCount.textContent = `${demoImporters.length} MATCHES`;
    finderResults.hidden = false;
    finderResults.classList.remove("finder-results-visible");
    window.requestAnimationFrame(() => {
      finderResults.classList.add("finder-results-visible");
    });
  }

  function applyDemoBuyers() {
    state.isDemo = true;
    state.buyers = demoBuyers;
    state.page = 1;
    state.pages = 1;
    state.total = demoBuyers.length;
    renderStats();
    renderTable();
    renderPagination();
  }

  async function loadBuyers() {
    if (!tableBody) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: state.page,
        limit: state.limit,
      });

      if (state.search) params.set("search", state.search);

      const data = await api.request(`/buyers?${params.toString()}`);
      state.buyers = Array.isArray(data) ? data : data.buyers || [];
      state.page = data.page || state.page;
      state.pages = data.pages || 1;
      state.total = data.total ?? state.buyers.length;
      state.isDemo = state.buyers.length === 0;
      if (state.isDemo) {
        state.buyers = demoBuyers;
        state.total = demoBuyers.length;
        state.page = 1;
        state.pages = 1;
      }
      renderStats();
      renderTable();
      renderPagination();
    } catch (error) {
      applyDemoBuyers();
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
      verified: form.verified.checked,
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
    document.addEventListener("click", (event) => {
      const demoAction = event.target.closest("[data-buyer-demo-action='search']");
      if (!demoAction) return;
      finderSearch?.focus();
      document.querySelector(".buyer-finder-shell")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
      renderFinderResults(finderSearch?.value.trim());
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (!document.querySelector("[data-buyer-management]")) return;

    bindEvents();

    if (!api.auth.isLoggedIn()) {
      if (crmSummary) crmSummary.hidden = true;
      if (crmTools) crmTools.hidden = true;
      if (crmAiSection) crmAiSection.hidden = true;
      return;
    }

    loadBuyers();
  });
})();
