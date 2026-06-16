(function () {
  let lastLogisticsResult = null;

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
    const status = byId("logisticsStatus");
    if (!status) return;

    status.textContent = message;
    status.className = `logistics-status logistics-status-${type}`;
  }

  function listItems(items = []) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function buildFilters() {
    return {
      originCountry: byId("originCountry")?.value || "",
      destinationCountry: byId("destinationCountry")?.value || "",
      mode: byId("mode")?.value || "",
      shipmentSize: byId("shipmentSize")?.value || "",
      productCategory: byId("productCategory")?.value || "",
    };
  }

  function renderEducation(items = []) {
    return `
      <section class="education-grid">
        ${items
          .map(
            (item) => `
              <article class="education-card">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
              </article>
            `,
          )
          .join("")}
      </section>
    `;
  }

  function routeCard(route) {
    return `
      <article class="route-card">
        <div class="card-topline">
          <div>
            <span class="source-pill">${escapeHtml(route.dataType.toUpperCase())}</span>
            <h3>${escapeHtml(route.originCountry)} to ${escapeHtml(route.destinationCountry)}</h3>
            <p>${escapeHtml(route.estimatedTransitTimeRange)}</p>
          </div>
          <span class="mode-pill">${escapeHtml(route.suggestedShipmentMode)}</span>
        </div>
        <div class="route-grid">
          <div>
            <h4>Common ports</h4>
            ${listItems(route.commonPorts)}
          </div>
          <div>
            <h4>Common airports</h4>
            ${listItems(route.commonAirports)}
          </div>
          <div>
            <h4>Freight documents</h4>
            ${listItems(route.commonFreightDocuments)}
          </div>
          <div>
            <h4>Common charges</h4>
            ${listItems(route.commonCharges)}
          </div>
        </div>
        <div class="summary-card">
          <h4>Route notes</h4>
          <p>${escapeHtml(route.routeNotes)}</p>
          <h4>FCL/LCL guidance</h4>
          <p>${escapeHtml(route.fclLclSuitability)}</p>
          <h4>Freight forwarder/CHA involvement</h4>
          <p>${escapeHtml(route.freightForwarderChaInvolvement)}</p>
        </div>
        <div class="risk-card">
          <h4>Risk notes</h4>
          ${listItems(route.riskNotes)}
        </div>
      </article>
    `;
  }

  function renderLogistics(data) {
    const target = byId("logisticsResult");
    const downloadPanel = byId("downloadPanel");
    if (!target) return;

    lastLogisticsResult = data;
    target.hidden = false;

    if (!data.routes?.length) {
      target.innerHTML = `
        <article class="route-card">
          <h2>No route guidance found</h2>
          <p>Try India as origin and one of the 9 focus countries as destination. Confirm final routing with a freight forwarder.</p>
        </article>
        ${renderEducation(data.education)}
      `;
      setStatus("No matching sample logistics route found.", "error");
      return;
    }

    target.innerHTML = `
      <div class="result-heading">
        <div>
          <span class="source-pill">${escapeHtml(data.label)}</span>
          <h2>Logistics Planner Result</h2>
        </div>
      </div>
      <div class="route-list">
        ${data.routes.map(routeCard).join("")}
      </div>
      <h2 class="section-title">Beginner Logistics Basics</h2>
      ${renderEducation(data.education)}
      <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
    `;

    if (downloadPanel) downloadPanel.hidden = false;
    setStatus(`Showing ${data.count} sample/manual logistics route(s).`, "success");
  }

  function downloadLogisticsReport() {
    if (!lastLogisticsResult) {
      setStatus("Generate logistics guidance before downloading.", "error");
      return;
    }

    if (!isLoggedIn()) {
      setStatus("Login is required for detailed route and downloadable logistics reports.", "error");
      return;
    }

    setStatus("Detailed route and downloadable logistics report is a paid-plan feature candidate and is not enabled yet.", "error");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const filters = buildFilters();
    if (!filters.originCountry || !filters.destinationCountry || !filters.mode || !filters.shipmentSize || !filters.productCategory) {
      setStatus("Select origin, destination, mode, shipment size and product category.", "error");
      return;
    }

    setStatus("Loading sample/manual logistics guidance...", "info");

    try {
      const data = await window.TradeAI.api.trade.logistics(filters);
      renderLogistics(data);
    } catch (error) {
      setStatus(window.TradeAI?.getPreviewMessage?.(error, "Logistics planner is temporarily unavailable. Please try again after the backend is reachable.") || error.message, "error");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    byId("logisticsForm")?.addEventListener("submit", handleSubmit);
    byId("downloadLogisticsReport")?.addEventListener("click", downloadLogisticsReport);
  });
})();
