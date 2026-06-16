(function () {
  let lastChecklist = null;

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
    const status = byId("documentsStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `documents-status documents-status-${type}`;
  }

  function renderList(items = [], emptyText = "No matching document guidance found.") {
    if (!items.length) {
      return `<p class="empty-copy">${escapeHtml(emptyText)}</p>`;
    }

    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function riskLabel(riskLevel = "medium") {
    const cleanRisk = String(riskLevel || "medium").toLowerCase();
    return `<span class="risk-pill risk-${escapeHtml(cleanRisk)}">${escapeHtml(cleanRisk.toUpperCase())} RISK</span>`;
  }

  function renderResults(data) {
    const result = byId("documentsResult");
    const downloadPanel = byId("downloadPanel");
    if (!result) return;

    lastChecklist = data;

    result.hidden = false;
    result.innerHTML = `
      <div class="result-heading">
        <div>
          <span class="source-pill">${escapeHtml((data.dataType || "sample").toUpperCase())} DATA</span>
          <h2>Document Checklist</h2>
        </div>
        ${riskLabel(data.riskLevel)}
      </div>
      <div class="result-grid">
        <article class="result-card">
          <h3>Mandatory Documents</h3>
          ${renderList(data.mandatoryDocuments)}
        </article>
        <article class="result-card">
          <h3>Conditional Documents</h3>
          ${renderList(data.conditionalDocuments)}
        </article>
        <article class="result-card">
          <h3>Product-Specific Documents</h3>
          ${renderList(data.productSpecificDocuments)}
        </article>
        <article class="result-card">
          <h3>Authority / Department</h3>
          ${renderList(data.authorityOrDepartment)}
        </article>
      </div>
      <article class="result-card notes-card">
        <h3>Country-Specific Notes</h3>
        ${renderList(data.countrySpecificNotes)}
      </article>
      <article class="paid-preview">
        <i class="fa-solid fa-lock"></i>
        <div>
          <h3>Detailed compliance notes are a paid-plan candidate</h3>
          <p>Guest users can view this basic checklist. Detailed country/product compliance notes, downloadable reports and saved history should be unlocked after login or a paid plan.</p>
        </div>
      </article>
      <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
    `;

    if (downloadPanel) {
      downloadPanel.hidden = false;
    }

    setStatus(`Found ${data.count || 0} matching sample/manual rule set(s).`, "success");
  }

  function buildPayload() {
    return {
      productCategory: byId("productCategory")?.value || "",
      hsCode: byId("hsCode")?.value || "",
      direction: byId("direction")?.value || "",
      country: byId("country")?.value || "",
    };
  }

  function serializeChecklist(data) {
    const selected = data.filters?.selected || {};

    return [
      "TradeAI Document Checklist",
      "",
      `Country: ${selected.country || "Not selected"}`,
      `Direction: ${selected.direction || "Not selected"}`,
      `Product category: ${selected.productCategory || "Not selected"}`,
      `HS code: ${selected.hsCode || "Not provided"}`,
      `Risk level: ${data.riskLevel || "medium"}`,
      "",
      "Mandatory documents:",
      ...(data.mandatoryDocuments || []).map((item) => `- ${item}`),
      "",
      "Conditional documents:",
      ...(data.conditionalDocuments || []).map((item) => `- ${item}`),
      "",
      "Product-specific documents:",
      ...(data.productSpecificDocuments || []).map((item) => `- ${item}`),
      "",
      "Disclaimer:",
      data.disclaimer || "",
    ].join("\n");
  }

  function downloadChecklist() {
    if (!lastChecklist) {
      setStatus("Generate a checklist before downloading.", "error");
      return;
    }

    if (!window.TradeAI?.auth?.isLoggedIn?.()) {
      setStatus("Login is required to download or save a checklist. Guest users can view the basic checklist here.", "error");
      const registerLink = byId("registerPrompt");
      registerLink?.focus();
      return;
    }

    const blob = new Blob([serializeChecklist(lastChecklist)], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tradeai-document-checklist.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    setStatus("Checklist downloaded.", "success");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = buildPayload();
    if (!payload.country || !payload.direction || !payload.productCategory) {
      setStatus("Select country, direction and product category to generate the checklist.", "error");
      return;
    }

    setStatus("Generating document checklist...", "info");

    try {
      const data = await window.TradeAI.api.compliance.documents(payload);
      renderResults(data);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Document checklist is temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    byId("documentsForm")?.addEventListener("submit", handleSubmit);
    byId("downloadChecklist")?.addEventListener("click", downloadChecklist);
  });
})();
