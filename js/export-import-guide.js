(function () {
  const state = {
    guide: null,
  };

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const empty = (value, fallback = "Not available") => escapeHtml(value || fallback);

  function byId(id) {
    return document.getElementById(id);
  }

  function setStatus(message, type = "info") {
    const status = byId("guideStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `guide-status guide-status-${type}`;
  }

  function listItems(items = []) {
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function renderIecBasics(iecBasics) {
    const target = byId("iecBasics");
    if (!target || !iecBasics) return;

    target.innerHTML = `
      <div class="guide-section-heading">
        <span class="guide-eyebrow">Start here</span>
        <h2>${empty(iecBasics.title)}</h2>
      </div>
      <p>${empty(iecBasics.whatIsIEC)}</p>
      <div class="guide-grid">
        <article class="guide-card">
          <h3>Who Needs IEC</h3>
          <ul>${listItems(iecBasics.whoNeedsIEC)}</ul>
        </article>
        <article class="guide-card" id="guide-documents">
          <h3>Documents Needed</h3>
          <ul>${listItems(iecBasics.documentsNeeded)}</ul>
        </article>
        <article class="guide-card">
          <h3>How To Apply</h3>
          <ol>${listItems(iecBasics.howToApply)}</ol>
        </article>
        <article class="guide-card">
          <h3>DGFT Basics</h3>
          <ul>${listItems(iecBasics.dgftBasics)}</ul>
        </article>
      </div>
    `;
  }

  function renderSteps(targetId, steps = []) {
    const target = byId(targetId);
    if (!target) return;

    target.innerHTML = steps
      .map(
        (item) => `
          <article class="process-step">
            <span>${item.step}</span>
            <div>
              <h3>${empty(item.title)}</h3>
              <p>${empty(item.details)}</p>
            </div>
          </article>
        `,
      )
      .join("");
  }

  function renderChecklist(items = []) {
    const target = byId("beginnerChecklist");
    if (!target) return;

    target.innerHTML = items
      .map(
        (item) => `
          <article class="checklist-item">
            <i class="fa-solid fa-check"></i>
            <div>
              <h3>${empty(item.title)}</h3>
              <p>${empty(item.description)}</p>
            </div>
          </article>
        `,
      )
      .join("");
  }

  function renderCommonMistakes(items = []) {
    const target = byId("commonMistakes");
    if (!target) return;

    target.innerHTML = items
      .map(
        (item) => `
          <li>
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>${escapeHtml(item)}</span>
          </li>
        `,
      )
      .join("");
  }

  function renderDepartments(items = []) {
    const target = byId("usefulDepartments");
    if (!target) return;

    target.innerHTML = items
      .map(
        (item) => `
          <article class="guide-card">
            <h3>${empty(item.name)}</h3>
            <p>${empty(item.whenToUse)}</p>
            <span class="source-pill">${empty(item.websiteLabel)}</span>
          </article>
        `,
      )
      .join("");
  }

  function renderGuide(guide) {
    state.guide = guide;
    renderIecBasics(guide.iecBasics);
    renderSteps("exportSteps", guide.exportSteps);
    renderSteps("importSteps", guide.importSteps);
    renderChecklist(guide.beginnerChecklist);
    renderCommonMistakes(guide.commonMistakes);
    renderDepartments(guide.usefulDepartments);

    const disclaimer = byId("guideDisclaimer");
    if (disclaimer) {
      disclaimer.textContent = guide.disclaimer || "";
    }

    const freshness = byId("guideFreshness");
    if (freshness) {
      freshness.textContent = `${(guide.dataType || "manual").toUpperCase()} GUIDE - Last updated ${guide.lastUpdated || "recently"}`;
    }

    setStatus("Guide loaded. This free starter content is ready for guest users.", "success");
  }

  async function loadGuide() {
    setStatus("Loading export-import starter guide...", "info");

    try {
      const response = await window.TradeAI.api.guide.exportImportProcess();
      renderGuide(response);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Guide is temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  window.addEventListener("DOMContentLoaded", loadGuide);
})();
