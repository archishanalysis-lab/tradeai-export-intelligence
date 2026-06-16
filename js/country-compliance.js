(function () {
  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  function byId(id) {
    return document.getElementById(id);
  }

  function setStatus(message, type = "info") {
    const status = byId("countryComplianceStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `compliance-status compliance-status-${type}`;
  }

  function listItems(items = [], emptyText = "Not specified") {
    if (!items.length) {
      return `<p class="empty-copy">${escapeHtml(emptyText)}</p>`;
    }

    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function riskPill(riskLevel = "medium") {
    const clean = String(riskLevel || "medium").toLowerCase();
    return `<span class="risk-pill risk-${escapeHtml(clean)}">${escapeHtml(clean.toUpperCase())}</span>`;
  }

  function buildFilters() {
    return {
      country: byId("country")?.value || "",
      productCategory: byId("productCategory")?.value || "",
      direction: byId("direction")?.value || "",
      riskLevel: byId("riskLevel")?.value || "",
    };
  }

  function renderRules(data) {
    const result = byId("countryComplianceResult");
    if (!result) return;

    result.hidden = false;

    if (!data.rules?.length) {
      result.innerHTML = `
        <article class="rule-card">
          <span class="source-pill">${escapeHtml(data.label || "Sample compliance intelligence")}</span>
          <h2>No matching rules found</h2>
          <p class="empty-copy">Try a broader product category, remove risk filter, or verify directly with the relevant official authority.</p>
        </article>
      `;
      setStatus("No matching sample compliance rules found.", "error");
      return;
    }

    result.innerHTML = `
      <div class="result-heading">
        <div>
          <span class="source-pill">${escapeHtml(data.label || "Sample compliance intelligence")}</span>
          <h2>Country Compliance Rules</h2>
        </div>
        <a class="secondary-action" href="register.html?source=country-compliance">
          <i class="fa-solid fa-lock"></i>
          Login for detailed notes
        </a>
      </div>
      <div class="rules-list">
        ${data.rules
          .map(
            (rule) => `
              <article class="rule-card">
                <div class="rule-topline">
                  <div>
                    <h3>${escapeHtml(rule.complianceRuleName)}</h3>
                    <p>${escapeHtml(rule.country)} · ${escapeHtml(rule.exportImportDirection)}</p>
                  </div>
                  ${riskPill(rule.riskLevel)}
                </div>
                <p>${escapeHtml(rule.description)}</p>
                <div class="rule-grid">
                  <div>
                    <h4>Authority</h4>
                    <p>${escapeHtml(rule.authority)}</p>
                  </div>
                  <div>
                    <h4>When Required</h4>
                    <p>${escapeHtml(rule.whenRequired)}</p>
                  </div>
                  <div>
                    <h4>Applicable Categories</h4>
                    ${listItems(rule.applicableProductCategories)}
                  </div>
                  <div>
                    <h4>Required Documents</h4>
                    ${listItems(rule.requiredDocuments)}
                  </div>
                </div>
                <div class="locked-note">
                  <i class="fa-solid fa-lock"></i>
                  <span>Detailed compliance notes and downloadable reports should require login or paid access.</span>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
      <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
    `;

    setStatus(`Showing ${data.count} sample/manual compliance rule(s).`, "success");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const filters = buildFilters();
    if (!filters.country || !filters.direction || !filters.productCategory) {
      setStatus("Select country, export/import direction and product category.", "error");
      return;
    }

    setStatus("Loading country compliance rules...", "info");

    try {
      const data = await window.TradeAI.api.compliance.countryRules(filters);
      renderRules(data);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Country compliance rules are temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    byId("countryComplianceForm")?.addEventListener("submit", handleSubmit);
  });
})();
