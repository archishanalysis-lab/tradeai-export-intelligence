(function () {
  let lastResult = null;

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

  function isLoggedIn() {
    return Boolean(window.TradeAI?.auth?.isLoggedIn?.());
  }

  function setStatus(message, type = "info") {
    const status = byId("recommendationStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `recommendation-status recommendation-status-${type}`;
  }

  function listItems(items = []) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function buildFilters() {
    return {
      productCategory: byId("productCategory")?.value || "",
      hsCode: byId("hsCode")?.value || "",
      direction: byId("direction")?.value || "",
      exporterExperience: byId("exporterExperience")?.value || "",
      shipmentSize: byId("shipmentSize")?.value || "",
      budgetLevel: byId("budgetLevel")?.value || "",
    };
  }

  function breakdownList(breakdown = {}) {
    const labels = {
      demandScore: "Demand",
      competitionScore: "Competition",
      complianceComplexity: "Compliance complexity",
      paymentRisk: "Payment risk",
      logisticsEase: "Logistics ease",
      tariffRisk: "Tariff risk",
      marketEntryDifficulty: "Market entry difficulty",
    };

    return Object.entries(labels)
      .map(([key, label]) => `<span><strong>${label}</strong>${escapeHtml(breakdown[key] ?? "-")}/10</span>`)
      .join("");
  }

  function recommendationCard(item, index) {
    return `
      <article class="recommendation-card">
        <div class="card-topline">
          <div>
            <span class="rank-pill">#${index + 1}</span>
            <h3>${escapeHtml(item.country)}</h3>
          </div>
          <span class="score-pill">${escapeHtml(item.finalScore)} / 100</span>
        </div>
        <div class="score-grid">${breakdownList(item.scoreBreakdown)}</div>
        <div class="card-section">
          <h4>Why recommended</h4>
          ${listItems(item.whyRecommended)}
        </div>
        <div class="card-section">
          <h4>Risks</h4>
          ${listItems(item.risks)}
        </div>
        <div class="card-section">
          <h4>Fit</h4>
          <p><strong>Recommended for:</strong> ${escapeHtml(item.recommendedFor)}</p>
          <p><strong>Not recommended for:</strong> ${escapeHtml(item.notRecommendedFor)}</p>
        </div>
        <div class="tool-links">
          <a href="document-checklist.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}">Documents</a>
          <a href="country-compliance.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}">Compliance</a>
          <a href="duty-tariff.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}">Duty/Tariff</a>
          <a href="export-opportunity-report.html?country=${encodeURIComponent(item.country)}&productCategory=${encodeURIComponent(item.productCategory)}">Generate report</a>
        </div>
      </article>
    `;
  }

  function renderRecommendations(data) {
    const target = byId("recommendationResult");
    const paidPanel = byId("paidPanel");
    if (!target) return;

    lastResult = data;
    const unlockedCount = isLoggedIn() ? 3 : 1;
    const visible = (data.topRecommendations || []).slice(0, unlockedCount);
    const lockedCount = Math.max((data.topRecommendations || []).length - visible.length, 0);

    target.hidden = false;
    target.innerHTML = `
      <div class="result-heading">
        <div>
          <span class="source-pill">${escapeHtml(data.label)}</span>
          <h2>${isLoggedIn() ? "Top 3 Recommended Countries" : "Top Recommended Country"}</h2>
        </div>
      </div>
      <div class="recommendation-list">
        ${visible.map((item, index) => recommendationCard(item, index)).join("")}
      </div>
      ${
        lockedCount
          ? `<article class="locked-card">
              <i class="fa-solid fa-lock"></i>
              <div>
                <h3>${lockedCount} more country recommendations available after login</h3>
                <p>Free registered users can view the top 3. Paid plans should unlock downloadable comparison reports.</p>
                <a href="register.html?source=country-recommendation" class="secondary-action">Register to unlock top 3</a>
              </div>
            </article>`
          : ""
      }
      <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
    `;

    if (paidPanel) paidPanel.hidden = false;
    setStatus(`${isLoggedIn() ? "Showing top 3" : "Showing top 1 guest preview"} from rule-based sample intelligence.`, "success");
  }

  function downloadComparison() {
    if (!lastResult) {
      setStatus("Generate recommendations before downloading.", "error");
      return;
    }

    if (!isLoggedIn()) {
      setStatus("Login is required before downloading comparison reports.", "error");
      return;
    }

    setStatus("Detailed comparison download is a paid-plan feature candidate and is not enabled yet.", "error");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const filters = buildFilters();
    if (!filters.productCategory || !filters.exporterExperience || !filters.shipmentSize || !filters.budgetLevel) {
      setStatus("Select product/category, experience, shipment size and budget level.", "error");
      return;
    }

    setStatus("Scoring countries with rule-based sample intelligence...", "info");

    try {
      const data = await window.TradeAI.api.recommendations.countries(filters);
      renderRecommendations(data);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Country recommendation tool is temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    byId("recommendationForm")?.addEventListener("submit", handleSubmit);
    byId("downloadComparison")?.addEventListener("click", downloadComparison);
  });
})();
