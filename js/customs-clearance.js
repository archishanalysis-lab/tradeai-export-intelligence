(function () {
  let lastWorkflow = null;

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
    const status = byId("customsStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `customs-status customs-status-${type}`;
  }

  function listItems(items = []) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function complexityPill(value = "medium") {
    const clean = String(value || "medium").toLowerCase();
    return `<span class="complexity-pill complexity-${escapeHtml(clean)}">${escapeHtml(clean.toUpperCase())}</span>`;
  }

  function buildFilters() {
    return {
      direction: byId("direction")?.value || "",
      mode: byId("mode")?.value || "",
      productCategory: byId("productCategory")?.value || "",
      country: byId("country")?.value || "",
      riskLevel: byId("riskLevel")?.value || "",
    };
  }

  function stepCard(step) {
    return `
      <article class="workflow-step">
        <span>${escapeHtml(step.step)}</span>
        <div>
          <h3>${escapeHtml(step.name)}</h3>
          <p>${escapeHtml(step.description)}</p>
          <div class="step-grid">
            <div>
              <h4>Who handles it</h4>
              ${listItems(step.handledBy)}
            </div>
            <div>
              <h4>Documents</h4>
              ${listItems(step.requiredDocuments)}
            </div>
            <div>
              <h4>Risk warnings</h4>
              ${listItems(step.riskWarnings)}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderWorkflow(data) {
    const target = byId("customsResult");
    const downloadPanel = byId("downloadPanel");
    if (!target) return;

    const workflow = data.workflows?.[0];
    lastWorkflow = workflow;
    target.hidden = false;

    if (!workflow) {
      target.innerHTML = `
        <article class="summary-card">
          <h2>No customs workflow found</h2>
          <p>Try export or import direction, then confirm the process with a licensed CHA/customs broker.</p>
        </article>
      `;
      setStatus("No matching customs workflow found.", "error");
      return;
    }

    target.innerHTML = `
      <div class="result-heading">
        <div>
          <span class="source-pill">${escapeHtml(data.label)}</span>
          <h2>${escapeHtml(workflow.title)}</h2>
          <p>${escapeHtml(workflow.country || "Selected country")} · ${escapeHtml(workflow.mode)} · ${escapeHtml(workflow.productCategory)}</p>
        </div>
        ${complexityPill(workflow.estimatedComplexity)}
      </div>
      <div class="summary-grid">
        <article class="summary-card">
          <h3>Required documents</h3>
          ${listItems(workflow.requiredDocuments)}
        </article>
        <article class="summary-card">
          <h3>Risk warnings</h3>
          ${listItems(workflow.riskWarnings)}
        </article>
      </div>
      <div class="workflow-list">
        ${workflow.steps.map(stepCard).join("")}
      </div>
      <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
    `;

    if (downloadPanel) downloadPanel.hidden = false;
    setStatus(`Showing ${workflow.steps.length} customs clearance step(s).`, "success");
  }

  function downloadWorkflow() {
    if (!lastWorkflow) {
      setStatus("Generate a workflow before downloading.", "error");
      return;
    }

    if (!isLoggedIn()) {
      setStatus("Login is required for downloadable customs workflows and product-country checklists.", "error");
      return;
    }

    setStatus("Advanced downloadable customs workflow is a paid-plan feature candidate and is not enabled yet.", "error");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const filters = buildFilters();
    if (!filters.direction || !filters.mode || !filters.productCategory || !filters.country) {
      setStatus("Select direction, shipment mode, product category and country.", "error");
      return;
    }

    setStatus("Loading customs clearance workflow...", "info");

    try {
      const data = await window.TradeAI.api.trade.customsClearance(filters);
      renderWorkflow(data);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Customs clearance checklist is temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    byId("customsForm")?.addEventListener("submit", handleSubmit);
    byId("downloadWorkflow")?.addEventListener("click", downloadWorkflow);
  });
})();
