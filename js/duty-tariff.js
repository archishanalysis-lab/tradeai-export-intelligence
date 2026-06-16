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

  function setStatus(message, type = "info") {
    const status = byId("tariffStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `tariff-status tariff-status-${type}`;
  }

  function riskPill(riskLevel = "medium") {
    const clean = String(riskLevel || "medium").toLowerCase();
    return `<span class="risk-pill risk-${escapeHtml(clean)}">${escapeHtml(clean.toUpperCase())}</span>`;
  }

  function buildFilters() {
    const hsOrProduct = byId("hsOrProduct")?.value || "";
    const selectedCategory = byId("productCategory")?.value || "";
    const hsCode = /^\d{2,10}$/.test(hsOrProduct.trim()) ? hsOrProduct.trim() : "";

    return {
      country: byId("country")?.value || "",
      hsCode,
      productCategory: selectedCategory || (!hsCode ? hsOrProduct : ""),
      direction: byId("direction")?.value || "",
    };
  }

  function renderFallback(fallback) {
    return `
      <article class="tariff-card">
        <h2>${escapeHtml(fallback?.title || "No exact tariff data available yet")}</h2>
        <ul>
          ${(fallback?.actions || [
            "Check HS code classification.",
            "Consult CHA/customs broker.",
            "Generate trade report.",
          ])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
        <div class="tariff-actions">
          <a class="secondary-action" href="dashboard.html#hs-codes">Check HS Code Classification</a>
          <a class="secondary-action" href="export-opportunity-report.html">Generate Trade Report</a>
        </div>
      </article>
    `;
  }

  function renderTariffs(data) {
    const target = byId("tariffResult");
    const savePanel = byId("savePanel");
    if (!target) return;

    lastResult = data;
    target.hidden = false;

    if (!data.tariffs?.length) {
      target.innerHTML = renderFallback(data.fallback);
      setStatus("No exact sample tariff data found. Use the fallback checks before pricing.", "error");
      return;
    }

    target.innerHTML = `
      <div class="result-heading">
        <div>
          <span class="source-pill">${escapeHtml(data.label)}</span>
          <h2>Estimated Duty & Tariff Info</h2>
        </div>
      </div>
      <div class="tariff-grid">
        ${data.tariffs
          .map(
            (item) => `
              <article class="tariff-card">
                <div class="tariff-topline">
                  <div>
                    <h3>${escapeHtml(item.productName)}</h3>
                    <p>${escapeHtml(item.country)} · HS ${escapeHtml(item.hsCode)} · ${escapeHtml(item.direction)}</p>
                  </div>
                  ${riskPill(item.riskLevel)}
                </div>
                <dl>
                  <dt>Duty type</dt>
                  <dd>${escapeHtml(item.dutyType)}</dd>
                  <dt>Estimated duty rate</dt>
                  <dd>${escapeHtml(item.estimatedDutyRate)}</dd>
                  <dt>Tax notes</dt>
                  <dd>${escapeHtml(item.taxNotes)}</dd>
                  <dt>Trade agreement note</dt>
                  <dd>${escapeHtml(item.preferentialTradeAgreement)}</dd>
                  <dt>Certificate of Origin impact</dt>
                  <dd>${escapeHtml(item.certificateOfOriginImpact)}</dd>
                </dl>
              </article>
            `,
          )
          .join("")}
      </div>
      <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
    `;

    if (savePanel) savePanel.hidden = false;
    setStatus(`Showing ${data.count} sample/manual tariff result(s).`, "success");
  }

  function saveSearch() {
    if (!lastResult) {
      setStatus("Generate a tariff result before saving.", "error");
      return;
    }

    if (!window.TradeAI?.auth?.isLoggedIn?.()) {
      setStatus("Login is required to save tariff search history.", "error");
      byId("loginPrompt")?.focus();
      return;
    }

    const history = window.TradeAI.storage.getJson("tradeai_tariff_history", []);
    history.unshift({
      savedAt: new Date().toISOString(),
      selected: lastResult.filters?.selected || {},
      count: lastResult.count,
      sourceType: lastResult.sourceType,
    });
    window.TradeAI.storage.setJson("tradeai_tariff_history", history.slice(0, 20));
    setStatus("Tariff search saved to this browser profile.", "success");
  }

  function downloadReport() {
    if (!window.TradeAI?.auth?.isLoggedIn?.()) {
      setStatus("Login is required first. Paid plans should unlock downloadable duty/tariff reports.", "error");
      return;
    }

    setStatus("Duty/tariff report download is a paid-plan feature candidate and is not enabled yet.", "error");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const filters = buildFilters();
    if (!filters.country || !filters.direction || (!filters.hsCode && !filters.productCategory)) {
      setStatus("Select country, direction, and enter HS code or product/category.", "error");
      return;
    }

    setStatus("Loading sample/manual tariff intelligence...", "info");

    try {
      const data = await window.TradeAI.api.trade.tariffs(filters);
      renderTariffs(data);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Duty/tariff finder is temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    byId("tariffForm")?.addEventListener("submit", handleSubmit);
    byId("saveSearch")?.addEventListener("click", saveSearch);
    byId("downloadReport")?.addEventListener("click", downloadReport);
  });
})();
