(function () {
  let currentTemplate = null;
  let generatedMessage = "";

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
    const status = byId("templateStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `template-status template-status-${type}`;
  }

  function buildFilters() {
    return {
      templateType: byId("templateType")?.value || "",
      userRole: byId("userRole")?.value || "",
      tone: byId("tone")?.value || "",
      country: byId("country")?.value || "",
      productCategory: byId("productCategory")?.value || "",
    };
  }

  function buildPayload() {
    return {
      ...buildFilters(),
      productName: byId("productName")?.value || "",
      buyerOrSupplierName: byId("buyerOrSupplierName")?.value || "",
      quantity: byId("quantity")?.value || "",
      incoterm: byId("incoterm")?.value || "",
      paymentTerm: byId("paymentTerm")?.value || "",
      shipmentMode: byId("shipmentMode")?.value || "",
    };
  }

  function applyTemplateFields(template) {
    currentTemplate = template;
    const subject = byId("templateSubject");
    const body = byId("templateBody");
    const templatePreview = byId("templatePreview");

    if (subject) subject.textContent = template.subject || "";
    if (body) body.textContent = template.body || "";
    if (templatePreview) templatePreview.hidden = false;
  }

  function renderTemplates(data) {
    const list = byId("templateList");
    if (!list) return;

    if (!data.templates?.length) {
      list.innerHTML = `<p class="empty-copy">No matching templates found. Try broader filters.</p>`;
      setStatus("No matching templates found.", "error");
      return;
    }

    list.innerHTML = data.templates
      .map(
        (template, index) => `
          <button type="button" class="template-option" data-index="${index}">
            <strong>${escapeHtml(template.title)}</strong>
            <span>${escapeHtml(template.templateType)}</span>
          </button>
        `,
      )
      .join("");

    list.querySelectorAll(".template-option").forEach((button) => {
      button.addEventListener("click", () => {
        const template = data.templates[Number(button.dataset.index)];
        applyTemplateFields(template);
      });
    });

    applyTemplateFields(data.templates[0]);
    setStatus(`Loaded ${data.count} sample/manual template(s).`, "success");
  }

  function renderGenerated(result) {
    const output = byId("generatedOutput");
    if (!output) return;

    generatedMessage = `Subject: ${result.subject}\n\n${result.message}`;
    output.hidden = false;
    output.innerHTML = `
      <div class="result-heading">
        <div>
          <span class="source-pill">${escapeHtml(result.providerLabel)}</span>
          <h2>Generated Message</h2>
        </div>
      </div>
      <pre>${escapeHtml(generatedMessage)}</pre>
      <p class="disclaimer">${escapeHtml(result.disclaimer || "")}</p>
    `;

    setStatus(result.isLiveAI ? "Generated with backend AI customization." : "Generated with safe backend template fallback.", "success");
  }

  async function loadTemplates(event) {
    event?.preventDefault();
    setStatus("Loading trade email templates...", "info");

    try {
      const data = await window.TradeAI.api.trade.communicationTemplates(buildFilters());
      renderTemplates(data);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Templates are temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  async function generateMessage() {
    if (!isLoggedIn()) {
      setStatus("Login is required for customized AI/template message generation.", "error");
      return;
    }

    setStatus("Generating customized trade message...", "info");

    try {
      const result = await window.TradeAI.api.trade.communicationGenerate(buildPayload());
      renderGenerated(result);
    } catch (error) {
      setStatus(error.message || "Message generation failed.", "error");
    }
  }

  async function copyMessage() {
    const text = generatedMessage || (currentTemplate ? `Subject: ${currentTemplate.subject}\n\n${currentTemplate.body}` : "");

    if (!text) {
      setStatus("Select or generate a message before copying.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Message copied.", "success");
    } catch (error) {
      setStatus("Copy failed. Select the text manually and copy it.", "error");
    }
  }

  function saveMessage() {
    const text = generatedMessage || (currentTemplate ? `Subject: ${currentTemplate.subject}\n\n${currentTemplate.body}` : "");

    if (!text) {
      setStatus("Select or generate a message before saving.", "error");
      return;
    }

    if (!isLoggedIn()) {
      setStatus("Login is required to save communication history.", "error");
      return;
    }

    const history = window.TradeAI.storage.getJson("tradeai_communication_history", []);
    history.unshift({
      savedAt: new Date().toISOString(),
      templateType: buildFilters().templateType,
      message: text,
    });
    window.TradeAI.storage.setJson("tradeai_communication_history", history.slice(0, 30));
    setStatus("Message saved to this browser profile.", "success");
  }

  window.addEventListener("DOMContentLoaded", () => {
    byId("templateForm")?.addEventListener("submit", loadTemplates);
    byId("generateMessage")?.addEventListener("click", generateMessage);
    byId("copyMessage")?.addEventListener("click", copyMessage);
    byId("saveMessage")?.addEventListener("click", saveMessage);
    loadTemplates();
  });
})();
