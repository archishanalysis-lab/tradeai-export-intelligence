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
    const status = byId("incotermsStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `incoterms-status incoterms-status-${type}`;
  }

  function buildFilters() {
    return {
      userRole: byId("userRole")?.value || "",
      shipmentMode: byId("shipmentMode")?.value || "",
      experienceLevel: byId("experienceLevel")?.value || "",
      freightPreference: byId("freightPreference")?.value || "",
      insurancePreference: byId("insurancePreference")?.value || "",
    };
  }

  function preferenceScore(item, filters) {
    let score = item.beginnerFriendlyScore || 0;

    if (filters.freightPreference && item.freightHandledBy === filters.freightPreference) score += 3;
    if (filters.insurancePreference && item.insuranceHandledBy === filters.insurancePreference) score += 2;
    if (filters.experienceLevel === "beginner" && item.beginnerFriendlyScore >= 7) score += 2;
    if (filters.shipmentMode === "sea" && ["FOB", "CIF"].includes(item.incoterm)) score += 1;
    if (filters.shipmentMode !== "sea" && ["FCA", "CPT", "CIP", "DAP"].includes(item.incoterm)) score += 1;

    return score;
  }

  function responsibilityList(item) {
    return `
      <dl>
        <dt>Seller responsibility</dt>
        <dd>${escapeHtml(item.sellerResponsibility)}</dd>
        <dt>Buyer responsibility</dt>
        <dd>${escapeHtml(item.buyerResponsibility)}</dd>
        <dt>Risk transfer</dt>
        <dd>${escapeHtml(item.riskTransferPoint)}</dd>
        <dt>Cost responsibility</dt>
        <dd>${escapeHtml(item.costResponsibility)}</dd>
      </dl>
    `;
  }

  function renderIncoterms(data, filters) {
    const target = byId("incotermsResult");
    if (!target) return;

    const ranked = [...(data.incoterms || [])]
      .map((item) => ({ ...item, preferenceScore: preferenceScore(item, filters) }))
      .sort((a, b) => b.preferenceScore - a.preferenceScore)
      .slice(0, 4);

    target.hidden = false;

    if (!ranked.length) {
      target.innerHTML = `
        <article class="incoterm-card">
          <h2>No matching Incoterms found</h2>
          <p>Try shipment mode “any” or a broader experience level, then confirm final terms with your freight forwarder.</p>
        </article>
      `;
      setStatus("No matching Incoterms found.", "error");
      return;
    }

    target.innerHTML = `
      <div class="result-heading">
        <div>
          <span class="source-pill">${escapeHtml(data.label)}</span>
          <h2>Recommended Incoterms</h2>
        </div>
      </div>
      <div class="incoterm-grid">
        ${ranked
          .map(
            (item) => `
              <article class="incoterm-card">
                <div class="card-topline">
                  <div>
                    <span class="term-pill">${escapeHtml(item.incoterm)}</span>
                    <h3>${escapeHtml(item.fullForm)}</h3>
                  </div>
                  <span class="score-pill">Beginner ${escapeHtml(item.beginnerFriendlyScore)}/10</span>
                </div>
                <p>${escapeHtml(item.bestFor)}</p>
                ${responsibilityList(item)}
                <div class="warning-box">
                  <strong>Beginner warning:</strong>
                  <span>${escapeHtml(item.warning)}</span>
                </div>
                <p><strong>Common use case:</strong> ${escapeHtml(item.commonUseCase)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
      <article class="next-links">
        <h3>Related next checks</h3>
        <a href="payment-risk.html">Payment risk guidance</a>
        <a href="logistics-planner.html">Logistics and freight planning</a>
        <a href="export-opportunity-report.html">Generate trade report</a>
      </article>
      <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
    `;

    setStatus(`Showing ${ranked.length} educational Incoterms suggestion(s).`, "success");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const filters = buildFilters();
    if (!filters.userRole || !filters.shipmentMode || !filters.experienceLevel) {
      setStatus("Select role, shipment mode and experience level.", "error");
      return;
    }

    setStatus("Loading Incoterms guidance...", "info");

    try {
      const data = await window.TradeAI.api.trade.incoterms(filters);
      renderIncoterms(data, filters);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Incoterms advisor is temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    byId("incotermsForm")?.addEventListener("submit", handleSubmit);
  });
})();
