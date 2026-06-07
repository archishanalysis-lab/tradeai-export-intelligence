(function () {
  const form = document.getElementById("reportForm");
  const list = document.getElementById("reportList");
  const output = document.getElementById("reportOutput");

  if (!form || !list || !window.TradeAI?.api?.reports) return;

  function renderReports(reports = []) {
    if (!reports.length) {
      list.innerHTML = `<article class="activity-card"><h4>No AI reports yet</h4><p>Generate your first opportunity report.</p></article>`;
      return;
    }

    list.innerHTML = reports
      .map(
        (report) => `
          <article class="activity-card">
            <h4>${report.title}</h4>
            <p>${report.reportType} · ${new Date(report.createdAt).toLocaleDateString()}</p>
            <div class="table-actions">
              <button class="secondary view-report" data-id="${report._id}">Open</button>
              <a class="secondary" href="${TradeAI.api.reports.exportUrl(report._id, "txt")}">Export TXT</a>
              <a class="secondary" href="${TradeAI.api.reports.exportUrl(report._id, "csv")}">Export CSV</a>
            </div>
          </article>
        `,
      )
      .join("");
  }

  async function loadReports() {
    if (!TradeAI.auth.requireAuth()) return;

    try {
      const data = await TradeAI.api.reports.list();
      renderReports(data.reports || []);
    } catch (error) {
      TradeAI.toast(error.message, "error");
      renderReports();
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      title: document.getElementById("reportTitle")?.value.trim(),
      reportType: document.getElementById("reportType")?.value,
      product: document.getElementById("reportProduct")?.value.trim(),
      hsCode: document.getElementById("reportHsCode")?.value.trim(),
      targetCountry: document.getElementById("reportCountry")?.value.trim(),
      prompt: document.getElementById("reportPrompt")?.value.trim(),
    };

    try {
      const { report } = await TradeAI.api.reports.create(payload);
      TradeAI.toast("AI report generated.");
      output.innerHTML = `<h3>${report.title}</h3><p>${report.answer.replace(/\n/g, "<br />")}</p>`;
      form.reset();
      await loadReports();
    } catch (error) {
      TradeAI.toast(error.message, "error");
    }
  });

  list.addEventListener("click", async (event) => {
    const button = event.target.closest(".view-report");
    if (!button) return;

    try {
      const report = await TradeAI.api.reports.get(button.dataset.id);
      output.innerHTML = `<h3>${report.title}</h3><p>${report.answer.replace(/\n/g, "<br />")}</p>`;
    } catch (error) {
      TradeAI.toast(error.message, "error");
    }
  });

  window.addEventListener("DOMContentLoaded", loadReports);
})();
