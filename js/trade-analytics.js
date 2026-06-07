(function () {
  const form = document.getElementById("analyticsForm");
  const analytics = document.getElementById("tradeAnalytics");
  const insights = document.getElementById("tradeInsights");
  const hsCodeInput = document.getElementById("analyticsHsCode");
  const reporterInput = document.getElementById("analyticsReporter");
  const submitButton = document.getElementById("analyticsSubmitBtn");
  const submitButtonLabel = submitButton?.querySelector(".button-label");
  const exportButton = document.getElementById("exportAnalyticsBtn");

  if (!form || !analytics || !window.TradeAI) return;

  let lastAnalyticsData = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setSubmitState(isLoading) {
    if (!submitButton) return;

    submitButton.disabled = isLoading;

    if (submitButtonLabel) {
      submitButtonLabel.textContent = isLoading ? "Searching..." : "Search HS Code";
      return;
    }

    submitButton.textContent = isLoading ? "Searching..." : "Search HS Code";
  }

  function render(data = {}) {
    const summary = data.analytics || {};
    lastAnalyticsData = data;
    const topCountries = summary.topCountries || [];

    analytics.innerHTML = `
      <article class="analytics-card">
        <h3>Total trade value</h3>
        <div class="summary-card"><h2>$${Number(summary.totalTradeValue || 0).toLocaleString()}</h2></div>
      </article>
      <article class="analytics-card">
        <h3>Records</h3>
        <div class="summary-card"><h2>${Number(summary.recordCount || 0).toLocaleString()}</h2></div>
      </article>
      <article class="analytics-card">
        <h3>Top country</h3>
        <div class="summary-card"><h2>${escapeHtml(summary.topCountries?.[0]?.country || "-")}</h2></div>
      </article>
      <article class="analytics-card">
        <h3>Data source</h3>
        <div class="summary-card"><h2>${escapeHtml(data.source || "Live API")}</h2></div>
        <p class="table-subtext">Period ${escapeHtml(data.period || "-")}</p>
      </article>
    `;

    const countryCards = topCountries.length
      ? topCountries
          .slice(0, 5)
          .map(
            (item, index) => `
              <article class="activity-card">
                <h4>${index + 1}. ${escapeHtml(item.country)}</h4>
                <p>$${Number(item.value || 0).toLocaleString()} trade value</p>
                <p class="table-subtext">Ranked from official records returned for this query.</p>
              </article>
            `,
          )
          .join("")
      : "";

    const insightItems = data.insights || [];
    insights.innerHTML = insightItems.length
      ? insightItems
          .map(
            (item) => `
              <article class="activity-card">
                <h4>${escapeHtml(item.title)}</h4>
                <p>${escapeHtml(item.summary)}</p>
                <p class="table-subtext">${escapeHtml(item.confidence || 0)}% confidence - ${escapeHtml(item.type)}</p>
              </article>
            `,
          )
          .join("") + countryCards
      : `
        <article class="activity-card">
          <h4>${topCountries.length ? "Top importing countries" : "No insights found"}</h4>
          <p>${topCountries.length ? "Official country rankings are shown below." : "Try another HS code or reporter code."}</p>
        </article>
        ${countryCards}
      `;

    if (exportButton) {
      exportButton.disabled = false;
    }
  }

  function validateForm() {
    if (!hsCodeInput.value.trim() || !hsCodeInput.checkValidity()) {
      TradeAI.toast("Enter a valid 4-10 digit HS code.", "error");
      hsCodeInput.focus();
      return false;
    }

    if (reporterInput.value.trim() && !reporterInput.checkValidity()) {
      TradeAI.toast("Reporter code must be 1-3 digits.", "error");
      reporterInput.focus();
      return false;
    }

    return true;
  }

  async function runAnalytics(event) {
    event?.preventDefault();
    if (!TradeAI.auth.requireAuth()) return;
    if (!validateForm()) return;

    const hsCode = hsCodeInput.value.trim();
    const reporterCode = reporterInput.value.trim();
    const params = new URLSearchParams({ hsCode });
    if (reporterCode) params.set("reporterCode", reporterCode);

    setSubmitState(true);
    if (exportButton) exportButton.disabled = true;

    try {
      analytics.innerHTML = `
        <article class="analytics-card skeleton-card">
          <h3>Loading analytics...</h3>
          <p>Fetching HS code trade intelligence.</p>
        </article>
      `;
      insights.innerHTML = `
        <article class="activity-card skeleton-card">
          <h4>Generating insights...</h4>
          <p>Reviewing country trends and opportunity signals.</p>
        </article>
      `;

      const data = await TradeAI.request(`/trade-data/hs-code-analytics?${params.toString()}`);
      render(data);
    } catch (error) {
      TradeAI.toast(error.message, "error");
      analytics.innerHTML = `
        <article class="analytics-card">
          <h3>Unable to load HS code data</h3>
          <p>${escapeHtml(error.message)}</p>
        </article>
      `;
      insights.innerHTML = `
        <article class="activity-card">
          <h4>No live result shown</h4>
          <p>Check backend connection, COMTRADE_API_KEY, or try a different HS code.</p>
        </article>
      `;
    } finally {
      setSubmitState(false);
    }
  }

  function exportCsv() {
    if (!lastAnalyticsData) return;

    const summary = lastAnalyticsData.analytics || {};
    const rows = [
      ["Metric", "Value"],
      ["HS Code", hsCodeInput.value.trim()],
      ["Reporter Code", reporterInput.value.trim() || "All"],
      ["Total Trade Value", summary.totalTradeValue || 0],
      ["Record Count", summary.recordCount || 0],
      ["Top Country", summary.topCountries?.[0]?.country || "-"],
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `tradeai-analytics-${hsCodeInput.value.trim() || "report"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  form.addEventListener("submit", runAnalytics);
  exportButton?.addEventListener("click", exportCsv);
  window.addEventListener("DOMContentLoaded", runAnalytics);
})();
