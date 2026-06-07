(function () {
  const form = document.getElementById("reportForm");
  const list = document.getElementById("reportList");
  const output = document.getElementById("reportOutput");

  if (!form || !list || !window.TradeAI?.api?.reports) return;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderList(title, items = []) {
    if (!items.length) return "";

    return `
      <div class="copilot-list-block">
        <h4>${escapeHtml(title)}</h4>
        <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
    `;
  }

  function renderReportOutput(report = {}) {
    const structured = report.structuredReport || {};

    if (structured.marketPotential) {
      output.innerHTML = `
        <article class="activity-card">
          <div class="copilot-answer-header">
            <h3>${escapeHtml(report.title)}</h3>
            <span class="status-badge status-active">Saved report</span>
          </div>
          <p class="table-subtext">${escapeHtml(report.originCountry || "India")} to ${escapeHtml(report.targetCountry || "")} - ${escapeHtml(report.product || "")}</p>
          <div class="analytics-grid compact-stats">
            <article class="analytics-card"><h3>Opportunity score</h3><div class="summary-card"><h2>${Number(structured.opportunityScore || 0)}/100</h2></div></article>
            <article class="analytics-card"><h3>Risk level</h3><div class="summary-card"><h2>${escapeHtml(structured.riskLevel || "Medium")}</h2></div></article>
            <article class="analytics-card"><h3>Buyer type</h3><p>${escapeHtml(structured.buyerType || "Importer/distributor")}</p></article>
          </div>
          <h4>Market potential</h4>
          <p>${escapeHtml(structured.marketPotential)}</p>
          <h4>Demand reason</h4>
          <p>${escapeHtml(structured.demandReason)}</p>
          ${renderList("Compliance notes", structured.complianceNotes)}
          ${renderList("Suggested next actions", structured.suggestedNextActions || report.suggestedActions)}
          <p class="table-subtext">Source: ${escapeHtml(structured.dataSourceLabel || report.provider || "TradeAI MVP report engine")}</p>
        </article>
      `;
      return;
    }

    output.innerHTML = `<h3>${escapeHtml(report.title)}</h3><p>${escapeHtml(report.answer).replace(/\n/g, "<br />")}</p>`;
  }

  function renderReports(reports = []) {
    if (!reports.length) {
      list.innerHTML = `<article class="activity-card"><h4>No saved reports yet</h4><p>Create your first export opportunity report to see a saved result here.</p></article>`;
      return;
    }

    list.innerHTML = reports
      .map((report) => {
        const structured = report.structuredReport || {};
        return `
          <article class="activity-card">
            <h4>${escapeHtml(report.title)}</h4>
            <p>${escapeHtml((report.reportType || "report").replace(/_/g, " "))} - ${new Date(report.createdAt).toLocaleDateString()}</p>
            ${structured.opportunityScore ? `<p class="table-subtext">Opportunity score: ${Number(structured.opportunityScore)}/100</p>` : ""}
            <div class="table-actions">
              <button class="secondary view-report" data-id="${report._id}">Open</button>
              <a class="secondary" href="${TradeAI.api.reports.exportUrl(report._id, "txt")}">Export TXT</a>
              <a class="secondary" href="${TradeAI.api.reports.exportUrl(report._id, "csv")}">Export CSV</a>
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function loadReports() {
    if (!TradeAI.auth.requireAuth()) return;

    try {
      const data = await TradeAI.api.reports.list();
      renderReports(data.reports || []);
    } catch (error) {
      TradeAI.toast(error.message, "error");
      renderReports();
    }
  }

  function getReportPayload() {
    return {
      productName: document.getElementById("reportProduct")?.value.trim(),
      hsCode: document.getElementById("reportHsCode")?.value.trim(),
      originCountry: document.getElementById("reportOriginCountry")?.value.trim() || "India",
      targetCountry: document.getElementById("reportCountry")?.value.trim(),
      businessType: document.getElementById("reportBusinessType")?.value,
      monthlyCapacity: document.getElementById("reportMonthlyCapacity")?.value.trim(),
      priceRange: document.getElementById("reportPriceRange")?.value.trim(),
      certifications: document.getElementById("reportCertifications")?.value.trim(),
    };
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = getReportPayload();

    if (!payload.productName || !payload.targetCountry) {
      TradeAI.toast("Product name and target country are required.", "error");
      return;
    }

    try {
      const { report } = await TradeAI.api.reports.createOpportunity(payload);
      TradeAI.toast("Export opportunity report saved.");
      renderReportOutput(report);
      form.reset();

      const originInput = document.getElementById("reportOriginCountry");
      if (originInput) originInput.value = "India";

      await loadReports();
      window.location.hash = "reports";
    } catch (error) {
      TradeAI.toast(error.message, "error");
    }
  });

  list.addEventListener("click", async (event) => {
    const button = event.target.closest(".view-report");
    if (!button) return;

    try {
      const report = await TradeAI.api.reports.get(button.dataset.id);
      renderReportOutput(report);
    } catch (error) {
      TradeAI.toast(error.message, "error");
    }
  });

  window.addEventListener("DOMContentLoaded", loadReports);
})();
