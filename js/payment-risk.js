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
    const status = byId("paymentStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `payment-status payment-status-${type}`;
  }

  function buildFilters() {
    return {
      userRole: byId("userRole")?.value || "",
      buyerTrustLevel: byId("buyerTrustLevel")?.value || "",
      shipmentValue: byId("shipmentValue")?.value || "",
      countryRisk: byId("countryRisk")?.value || "",
      country: byId("country")?.value || "",
      paymentPreference: byId("paymentPreference")?.value || "",
    };
  }

  function listItems(items = []) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function riskPill(riskLevel = "medium") {
    const clean = String(riskLevel || "medium").toLowerCase();
    return `<span class="risk-pill risk-${escapeHtml(clean)}">${escapeHtml(clean.toUpperCase())}</span>`;
  }

  function termCard(item) {
    return `
      <article class="payment-card">
        <div class="card-topline">
          <div>
            <span class="term-pill">${escapeHtml(item.paymentTerm)}</span>
            <h3>${escapeHtml(item.bestFor)}</h3>
          </div>
          ${riskPill(item.riskLevel)}
        </div>
        <dl>
          <dt>Exporter risk</dt>
          <dd>${escapeHtml(item.exporterRisk)}</dd>
          <dt>Importer risk</dt>
          <dd>${escapeHtml(item.importerRisk)}</dd>
          <dt>Bank involvement</dt>
          <dd>${escapeHtml(item.bankInvolvement)}</dd>
          <dt>Common use case</dt>
          <dd>${escapeHtml(item.commonUseCase)}</dd>
        </dl>
        <div class="card-section">
          <h4>Documents required</h4>
          ${listItems(item.documentationRequired)}
        </div>
        <div class="warning-box">
          <strong>Warning:</strong>
          <span>${escapeHtml(item.warning)}</span>
        </div>
        <div class="card-section">
          <h4>Suggested next steps</h4>
          ${listItems(item.suggestedNextSteps)}
        </div>
      </article>
    `;
  }

  function renderResults(data, filters) {
    const target = byId("paymentResult");
    const reportPanel = byId("reportPanel");
    if (!target) return;

    lastResult = data;
    const preferred = filters.paymentPreference
      ? data.saferPaymentTerms.filter((item) => item.paymentTerm === filters.paymentPreference)
      : [];
    const terms = preferred.length ? preferred : data.saferPaymentTerms;

    target.hidden = false;
    target.innerHTML = `
      <div class="result-heading">
        <div>
          <span class="source-pill">${escapeHtml(data.label)}</span>
          <h2>Safer Payment Terms</h2>
          <p>${escapeHtml(filters.country || "Selected country")} · ${escapeHtml(filters.userRole)} · ${escapeHtml(filters.buyerTrustLevel)} counterparty</p>
        </div>
      </div>
      <div class="payment-grid">
        ${terms.map(termCard).join("") || "<p>No exact payment term match found. Try broader risk filters or consult your bank.</p>"}
      </div>
      <article class="red-flags">
        <h3>Red flags to check</h3>
        ${listItems(data.redFlags)}
      </article>
      <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
    `;

    if (reportPanel) reportPanel.hidden = false;
    setStatus(`Showing ${terms.length} educational payment guidance option(s).`, "success");
  }

  function detailedReport() {
    if (!lastResult) {
      setStatus("Generate payment guidance before requesting a detailed report.", "error");
      return;
    }

    if (!isLoggedIn()) {
      setStatus("Login is required for detailed payment risk reports.", "error");
      return;
    }

    setStatus("Advanced buyer/supplier payment risk reports are a paid-plan feature candidate and are not enabled yet.", "error");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const filters = buildFilters();
    if (!filters.userRole || !filters.buyerTrustLevel || !filters.shipmentValue || !filters.countryRisk) {
      setStatus("Select role, counterparty trust, shipment value and country risk.", "error");
      return;
    }

    setStatus("Loading educational payment risk guidance...", "info");

    try {
      const data = await window.TradeAI.api.trade.paymentTerms(filters);
      renderResults(data, filters);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Payment risk advisor is temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    byId("paymentForm")?.addEventListener("submit", handleSubmit);
    byId("detailedReport")?.addEventListener("click", detailedReport);
  });
})();
