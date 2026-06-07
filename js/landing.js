(function () {
  const marketInput = document.getElementById("mainSearch");
  const marketButton = document.getElementById("marketSearchButton");
  const chartTitle = document.getElementById("chartTitle");
  const chartBars = document.querySelectorAll(".chart-track-bar");
  const chartWrap = document.getElementById("chartDataVisualization");
  const marketChartCard = document.getElementById("marketChartCard");
  let loadingTimer;

  function getCopy(key) {
    return window.TradeAI?.i18n?.getCopy?.(key) || key;
  }

  function resetChart() {
    if (marketChartCard) {
      marketChartCard.hidden = true;
      marketChartCard.setAttribute("aria-busy", "false");
      marketChartCard.setAttribute("aria-hidden", "true");
    }

    if (chartTitle) {
      chartTitle.textContent = getCopy("chartTitleDefault");
    }
  }

  function runSearch() {
    const product = marketInput?.value.trim();

    if (!product) {
      resetChart();
      return;
    }

    if (marketChartCard) {
      marketChartCard.hidden = false;
      marketChartCard.setAttribute("aria-busy", "true");
      marketChartCard.setAttribute("aria-hidden", "false");
    }

    if (marketButton) {
      marketButton.disabled = true;
      marketButton.setAttribute("aria-busy", "true");
    }

    if (chartTitle) {
      chartTitle.textContent = getCopy("chartTitleProduct").replace(
        "{product}",
        product,
      );
    }

    chartWrap?.classList.add("is-demo-active");

    chartBars.forEach((bar, index) => {
      const baseWidth = Number.parseFloat(bar.style.width) || 54;
      const variance = (product.length * (index + 3)) % 27;
      const newWidth = Math.max(32, Math.min(100, baseWidth - 12 + variance));

      bar.style.width = `${newWidth}%`;
      bar.setAttribute("aria-valuenow", Math.round(newWidth));
    });

    window.clearTimeout(loadingTimer);
    loadingTimer = window.setTimeout(() => {
      marketChartCard?.setAttribute("aria-busy", "false");
      if (marketButton) {
        marketButton.disabled = false;
        marketButton.setAttribute("aria-busy", "false");
      }
    }, 650);

    window.TradeAI?.analytics?.track("market_search_demo", {
      query: product,
    });
  }

  marketButton?.addEventListener("click", runSearch);
  marketInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runSearch();
    }
  });

  window.addEventListener("tradeai:language-change", () => {
    if (marketChartCard?.hidden) {
      resetChart();
      return;
    }

    if (marketInput?.value.trim()) {
      chartTitle.textContent = getCopy("chartTitleProduct").replace(
        "{product}",
        marketInput.value.trim(),
      );
    }
  });

  resetChart();
})();
