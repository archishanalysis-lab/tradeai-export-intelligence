(function () {
  const form = document.getElementById("hsDirectoryForm");
  const results = document.getElementById("hsDirectoryResults");
  const status = document.getElementById("hsDirectoryStatus");
  const categorySelect = document.getElementById("hsDirectoryCategory");
  const submitButton = document.getElementById("hsDirectorySubmit");

  if (!form || !results || !window.TradeAI?.api?.trade) return;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setLoading(isLoading) {
    if (submitButton) {
      submitButton.disabled = isLoading;
      submitButton.innerHTML = isLoading
        ? '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> Searching...'
        : '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Search directory';
    }
  }

  function collectFilters() {
    return {
      search: document.getElementById("hsDirectorySearch")?.value,
      country: document.getElementById("hsDirectoryCountry")?.value,
      category: document.getElementById("hsDirectoryCategory")?.value,
      exportImportType: document.getElementById("hsDirectoryType")?.value,
      riskLevel: document.getElementById("hsDirectoryRisk")?.value,
    };
  }

  function renderCategories(categories = []) {
    if (!categorySelect || categorySelect.dataset.loaded === "true") return;

    categorySelect.innerHTML =
      '<option value="">All categories</option>' +
      categories
        .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
        .join("");
    categorySelect.dataset.loaded = "true";
  }

  function renderEmpty() {
    results.innerHTML = `
      <article class="activity-card">
        <h4>No HS code examples found</h4>
        <p>Try a broader product term, remove a filter, or search one of the starter products.</p>
      </article>
    `;
  }

  function renderItems(items = []) {
    if (!items.length) {
      renderEmpty();
      return;
    }

    results.innerHTML = items
      .map((item) => `
        <article class="activity-card">
          <div class="copilot-answer-header">
            <div>
              <span class="status-badge status-pending">${escapeHtml(String(item.dataType || "sample").toUpperCase())}</span>
              <h4>${escapeHtml(item.productName)} - HS ${escapeHtml(item.hsCode)}</h4>
              <p class="table-subtext">${escapeHtml(item.productCategory)} | ${escapeHtml(item.exportImportType)} | ${escapeHtml(item.riskLevel)} risk</p>
            </div>
          </div>
          <p>${escapeHtml(item.description)}</p>
          <p><strong>Common use:</strong> ${escapeHtml(item.commonUse)}</p>
          <p><strong>Focus countries:</strong> ${escapeHtml((item.commonCountries || []).join(", "))}</p>
          <p><strong>Classification notes:</strong> ${escapeHtml(item.notes)}</p>
          <p class="table-subtext">Last updated: ${escapeHtml(item.lastUpdated)}. Verify final HS classification with a CHA/customs expert.</p>
        </article>
      `)
      .join("");
  }

  async function loadDirectory(event) {
    event?.preventDefault();
    setLoading(true);

    results.innerHTML = `
      <article class="activity-card skeleton-card">
        <h4>Loading HS code directory...</h4>
        <p>Searching sample/manual classification guidance.</p>
      </article>
    `;

    if (status) {
      status.textContent = "Loading HS code examples...";
    }

    try {
      const data = await window.TradeAI.api.trade.hsCodes(collectFilters());
      renderCategories(data.filters?.categories || []);
      renderItems(data.hsCodes || []);

      if (status) {
        status.textContent = `${data.count || 0} of ${data.total || 0} sample/manual HS code examples shown. ${data.disclaimer || ""}`;
      }
    } catch (error) {
      results.innerHTML = `
        <article class="activity-card">
          <h4>Unable to load HS code directory</h4>
          <p>${escapeHtml(error.message || "Please check backend connection and try again.")}</p>
        </article>
      `;

      if (status) {
        status.textContent = "HS code directory could not load right now.";
      }
    } finally {
      setLoading(false);
    }
  }

  form.addEventListener("submit", loadDirectory);
  ["hsDirectoryCountry", "hsDirectoryCategory", "hsDirectoryType", "hsDirectoryRisk"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", loadDirectory);
  });
  window.addEventListener("DOMContentLoaded", loadDirectory);
})();
