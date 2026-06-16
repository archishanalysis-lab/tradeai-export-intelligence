(function () {
  const form = document.getElementById("reportForm");
  const list = document.getElementById("reportList");
  const output = document.getElementById("reportOutput");

  if (!form || !output || !window.TradeAI?.api?.reports) return;

  let lastReportText = "";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function listMarkup(title, items = []) {
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

    if (!safeItems.length) return "";

    return `
      <div class="copilot-list-block">
        <h4>${escapeHtml(title)}</h4>
        <ul>${safeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
    `;
  }

  function directionLabel(value) {
    return String(value || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function buildReportText(report = {}) {
    return [
      report.reportTitle,
      "",
      `Product: ${report.productName || ""}`,
      `Country: ${report.country || ""}`,
      `Direction: ${directionLabel(report.direction)}`,
      `HS Code / Category: ${report.hsCodeOrCategory || ""}`,
      `Risk Level: ${report.riskLevel || ""}`,
      `Source: ${report.sourceType || ""}`,
      "",
      "Summary",
      report.opportunitySummary || "",
      "",
      "Checklist",
      ...(report.checklist || []).map((item) => `- ${item}`),
      "",
      "Documents",
      ...(report.documents || []).map((item) => `- ${item}`),
      "",
      "Compliance Notes",
      ...(report.complianceNotes || []).map((item) => `- ${item}`),
      "",
      `Payment Risk: ${report.paymentRisk || ""}`,
      `Incoterms Guidance: ${report.incotermsGuidance || ""}`,
      `Logistics Notes: ${report.logisticsNotes || ""}`,
      "",
      "Customs Steps",
      ...(report.customsSteps || []).map((item) => `- ${item}`),
      "",
      "Recommendations",
      ...(report.recommendations || []).map((item) => `- ${item}`),
      "",
      `Disclaimer: ${report.disclaimer || ""}`,
    ]
      .filter((line) => line !== undefined && line !== null)
      .join("\n");
  }

  function buildCopilotPrompt(report = {}) {
    return [
      "Explain this TradeAI trade readiness report in simple practical steps.",
      `Product: ${report.productName || ""}`,
      `Country: ${report.country || ""}`,
      `Direction: ${directionLabel(report.direction)}`,
      `HS/category: ${report.hsCodeOrCategory || ""}`,
      `Summary: ${report.opportunitySummary || ""}`,
      "Focus on what I should do next, what documents matter, payment risk and what to verify with official authorities.",
    ].join("\n");
  }

  function persistCopilotContext(report = {}) {
    try {
      localStorage.setItem("tradeai_selected_product", report.productName || "");
      localStorage.setItem("tradeai_selected_country", report.country || "");
      localStorage.setItem("tradeai_selected_hsCode", report.hsCodeOrCategory || "");
      localStorage.setItem("tradeai_latest_report_prompt", buildCopilotPrompt(report));
    } catch (error) {
      // Copilot context is a convenience only.
    }
  }

  function renderReportOutput(response = {}) {
    const report = response.report || response;
    const savedLabel = response.saved
      ? "Saved to My Reports"
      : response.access === "guest-preview"
        ? "Guest preview - register to save/download"
        : "Preview generated";
    const upgradePrompt =
      response.upgradePrompt ||
      "Upgrade later to unlock more reports, detailed PDF/Excel export, saved history and advanced comparison.";

    lastReportText = buildReportText(report);
    persistCopilotContext(report);

    output.innerHTML = `
      <article class="activity-card trade-readiness-output">
        <div class="copilot-answer-header">
          <div>
            <h3>${escapeHtml(report.reportTitle || "Trade Readiness Report")}</h3>
            <p class="table-subtext">${escapeHtml(savedLabel)} | Source: ${escapeHtml(report.sourceType || "rule-engine")}</p>
          </div>
          <span class="status-badge status-active">${escapeHtml(report.riskLevel || "Medium risk")}</span>
        </div>
        <div class="analytics-grid compact-stats">
          <article class="analytics-card"><h3>Product</h3><p>${escapeHtml(report.productName)}</p></article>
          <article class="analytics-card"><h3>Country</h3><p>${escapeHtml(report.country)}</p></article>
          <article class="analytics-card"><h3>Direction</h3><p>${escapeHtml(directionLabel(report.direction))}</p></article>
          <article class="analytics-card"><h3>HS/category</h3><p>${escapeHtml(report.hsCodeOrCategory || "Verify")}</p></article>
        </div>
        <h4>Process summary</h4>
        <p>${escapeHtml(report.opportunitySummary)}</p>
        ${listMarkup("Checklist", report.checklist)}
        ${listMarkup("Documents", report.documents)}
        ${listMarkup("Compliance notes", report.complianceNotes)}
        <h4>Payment term risk</h4>
        <p>${escapeHtml(report.paymentRisk)}</p>
        <h4>Incoterms suggestion</h4>
        <p>${escapeHtml(report.incotermsGuidance)}</p>
        <h4>Logistics / shipping note</h4>
        <p>${escapeHtml(report.logisticsNotes)}</p>
        ${listMarkup("Customs clearance checklist", report.customsSteps)}
        ${listMarkup("Next steps", report.recommendations)}
        <p class="table-subtext">${escapeHtml(report.disclaimer)}</p>
        <div class="table-actions">
          <button class="secondary" type="button" data-report-copy>Copy report</button>
          ${
            response.savedReportId
              ? `<button class="secondary" type="button" data-report-download-id="${escapeHtml(response.savedReportId)}">Download TXT</button>`
              : `<a class="secondary" href="register.html?source=trade-readiness-save">Register to save/download</a>`
          }
          <a class="secondary" href="copilot.html?source=trade-readiness">Ask Copilot about this report</a>
          <a class="secondary" href="pricing.html?source=trade-readiness-upgrade">Upgrade to unlock</a>
        </div>
        <p class="table-subtext">${escapeHtml(upgradePrompt)}</p>
      </article>
    `;
  }

  function getPayload() {
    return {
      productName: document.getElementById("reportProduct")?.value.trim(),
      hsCodeOrCategory: document.getElementById("reportHsCode")?.value.trim(),
      direction: document.getElementById("reportDirection")?.value || "export_from_india",
      country: document.getElementById("reportCountry")?.value.trim(),
      experienceLevel: document.getElementById("reportExperienceLevel")?.value || "beginner",
    };
  }

  async function renderRecentSavedReports() {
    if (!list) return;

    if (!window.TradeAI?.auth?.isLoggedIn?.()) {
      list.innerHTML = `<article class="activity-card"><h4>Register to save reports</h4><p>Guest previews are not saved. Login to keep report history and downloads.</p></article>`;
      return;
    }

    try {
      const data = await window.TradeAI.api.reports.myReports();
      const reports = data?.reports || [];

      list.innerHTML = reports.slice(0, 3).length
        ? reports.slice(0, 3).map((report) => `
            <article class="activity-card">
              <h4>${escapeHtml(report.reportData?.reportTitle || report.productName || "Trade report")}</h4>
              <p>${escapeHtml(report.targetCountry || report.reportData?.country || "")} - ${escapeHtml(new Date(report.createdAt).toLocaleDateString())}</p>
              <a class="secondary" href="#reports-tab-my-reports-section">Open My Reports</a>
            </article>
          `).join("")
        : `<article class="activity-card"><h4>No saved reports yet</h4><p>Generate this report while logged in to save it.</p></article>`;
    } catch (error) {
      list.innerHTML = `<article class="activity-card"><h4>Saved reports unavailable</h4><p>My Reports could not load right now.</p></article>`;
    }
  }

  async function handleCopy() {
    if (!lastReportText) return;

    try {
      await navigator.clipboard.writeText(lastReportText);
      window.TradeAI?.toast?.("Report copied.", "success");
    } catch (error) {
      window.TradeAI?.toast?.("Copy is unavailable in this browser.", "error");
    }
  }

  async function handleDownload(button) {
    if (!button?.dataset.reportDownloadId) return;

    try {
      const { blob, filename } = await window.TradeAI.api.reports.downloadMyReport(button.dataset.reportDownloadId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.TradeAI?.toast?.(error.message || "Download failed.", "error");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = getPayload();
    const submitButton = form.querySelector("button[type='submit']");
    const originalText = submitButton?.textContent || "Generate Trade Readiness Report";

    if (!payload.productName || !payload.country) {
      window.TradeAI?.toast?.("Product/category and country are required.", "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Generating...";

    try {
      const response = await window.TradeAI.api.reports.tradeReadiness(payload);
      renderReportOutput(response);
      await renderRecentSavedReports();
      await window.TradeAI?.renderMyReports?.();
      window.TradeAI?.toast?.(
        response.saved ? "Trade Readiness Report generated and saved." : "Preview generated. Register to save/download.",
        "success",
      );
    } catch (error) {
      window.TradeAI?.toast?.(error.message || "Report generation failed.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });

  output.addEventListener("click", async (event) => {
    if (event.target.closest("[data-report-copy]")) {
      await handleCopy();
      return;
    }

    const downloadButton = event.target.closest("[data-report-download-id]");
    if (downloadButton) {
      await handleDownload(downloadButton);
    }
  });

  window.addEventListener("DOMContentLoaded", renderRecentSavedReports);
})();
