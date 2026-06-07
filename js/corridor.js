(function () {
  const data = window.TradeAI?.corridorData || {};
  const fallbackCountry = "kenya";

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/^#/, "")
      .replace(/\s+/g, "-")
      .trim();
  }

  function getCountryKey() {
    const params = new URLSearchParams(window.location.search);
    const queryCountry = normalize(params.get("country"));
    const hashCountry = normalize(window.location.hash);
    return data[queryCountry] ? queryCountry : data[hashCountry] ? hashCountry : fallbackCountry;
  }

  function listItems(items) {
    return items.map((item) => `<li>${item}</li>`).join("");
  }

  function hsItems(items) {
    return items
      .map((item) => `<article class="corridor-card"><h3>HS ${item.code}</h3><p>${item.label}</p></article>`)
      .join("");
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function render(country) {
    const page = data[country] || data[fallbackCountry];
    document.title = `${page.title} | TradeAI`;
    document.querySelector("meta[name='description']")?.setAttribute("content", page.summary);

    setText("corridorRegion", page.region);
    setText("corridorTitle", page.title);
    setText("corridorSummary", page.summary);
    setText("corridorSummaryCard", page.summary);
    setText("corridorName", page.corridor);
    setText("sourceLabel", page.sourceLabel);
    setText("updatedLabel", "Last updated: June 2026");

    document.getElementById("productList").innerHTML = listItems(page.products);
    document.getElementById("challengeList").innerHTML = listItems(page.challenges);
    document.getElementById("workflowList").innerHTML = page.workflow
      .map((step, index) => `<article class="corridor-card"><span>${index + 1}</span><p>${step}</p></article>`)
      .join("");
    document.getElementById("hsGrid").innerHTML = hsItems(page.hsCodes);

    document.querySelectorAll("[data-country-link]").forEach((link) => {
      link.classList.toggle("active", link.dataset.countryLink === page.slug);
    });
  }

  window.addEventListener("hashchange", () => render(getCountryKey()));
  render(getCountryKey());
})();
