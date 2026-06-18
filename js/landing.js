(function () {
  const form = document.getElementById("landingCountryFitForm");
  const result = document.getElementById("landingCountryFitResult");
  const status = document.getElementById("landingCountryFitStatus");
  const submit = document.getElementById("landingCountryFitSubmit");

  if (!form || !result || !status || !submit) return;

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  function setStatus(message, state = "info") {
    status.textContent = message;
    status.dataset.state = state;
  }

  function buildPayload() {
    const selectedCountries = Array.from(
      form.querySelectorAll('input[name="targetCountries"]:checked'),
      (input) => input.value,
    );

    return {
      productName: document.getElementById("landingProductName")?.value.trim() || "",
      hsCode: document.getElementById("landingHsCode")?.value.trim() || "",
      sourceCountry: "India",
      targetCountries: selectedCountries,
      productCategory: "General goods",
      direction: "export from India",
      exporterExperience: "beginner",
      shipmentSize: "small",
      budgetLevel: "medium",
    };
  }

  function formatTradeValue(value) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0
      ? `USD ${amount.toLocaleString("en-US")}`
      : "Not available";
  }

  function renderResult(data) {
    const recommendation = data?.topRecommendations?.[0];

    if (!recommendation) {
      throw new Error("No Country Fit result was returned for this selection.");
    }

    const source =
      recommendation.dataSourceLabel || data.dataSourceLabel || "Rule Engine";
    const explanations = Array.isArray(recommendation.whyRecommended)
      ? recommendation.whyRecommended
      : [];

    result.hidden = false;
    result.innerHTML = `
      <span class="source-label">${escapeHtml(source)}</span>
      <h3>Best current fit: ${escapeHtml(recommendation.country)}</h3>
      <p>${escapeHtml(data.explanation || "This result compares the selected focus markets using available demand and rule-engine signals.")}</p>
      <div class="result-metrics">
        <div><span>Country Fit score</span><strong>${escapeHtml(recommendation.finalScore ?? "-")} / 100</strong></div>
        <div><span>Confidence</span><strong>${escapeHtml(data.confidenceScore ?? "-")} / 100</strong></div>
        <div><span>Available trade value</span><strong>${escapeHtml(formatTradeValue(recommendation.tradeValue))}</strong></div>
        <div><span>Growth signal</span><strong>${escapeHtml(recommendation.trend || "Not available")}</strong></div>
      </div>
      ${explanations.length ? `<p><strong>Why this market:</strong> ${escapeHtml(explanations.join(" "))}</p>` : ""}
      <p class="country-fit-status">${escapeHtml(data.disclaimer || "TradeAI guidance is decision support and should be verified before commercial decisions.")}</p>
      <div class="result-actions">
        <a class="landing-primary" href="pages/register.html?plan=Free&source=country-fit-preview">Register to save full ranking</a>
        <a class="landing-secondary" href="pages/country-recommendation.html">Open detailed Country Fit</a>
      </div>
    `;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = buildPayload();

    if (!payload.productName) {
      setStatus("Enter a product name to generate your preview.", "error");
      document.getElementById("landingProductName")?.focus();
      return;
    }

    if (!payload.targetCountries.length) {
      setStatus("Select at least one target country.", "error");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Comparing countries...";
    setStatus("Checking available Comtrade data and Country Fit guidance...", "info");

    try {
      window.TradeAI?.storage?.set(
        "tradeai_pending_country_fit",
        JSON.stringify(payload),
      );
      window.TradeAI?.analytics?.track("country_fit_preview_submit", {
        productName: payload.productName,
        hsCode: payload.hsCode,
        targetCountries: payload.targetCountries,
        source: "landing",
      });

      if (!window.TradeAI?.api?.recommendations?.countryFit) {
        throw new Error("Country Fit is temporarily unavailable. Please try again shortly.");
      }

      const data = await window.TradeAI.api.recommendations.countryFit(payload);
      renderResult(data);
      setStatus(`Preview generated from ${data.dataSourceLabel || "Rule Engine"}.`, "success");
    } catch (error) {
      result.hidden = true;
      setStatus(
        window.TradeAI?.getPreviewMessage?.(
          error,
          "Country Fit is temporarily unavailable. No sample result has been substituted.",
        ) || error.message,
        "error",
      );
    } finally {
      submit.disabled = false;
      submit.textContent = "Generate Free Country-Fit Preview";
    }
  });
})();
