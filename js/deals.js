(function () {
  const form = document.getElementById("dealForm");
  const tableBody = document.getElementById("dealTableBody");
  const summaryGrid = document.getElementById("dealSummary");
  const searchForm = document.getElementById("dealSearchForm");
  const searchInput = document.getElementById("dealSearch");
  const stageFilter = document.getElementById("dealStageFilter");
  const submitButton = document.getElementById("dealSubmitBtn");
  const idField = document.getElementById("dealId");
  const api = window.TradeAI?.api?.deals;

  if (!form || !tableBody || !api) return;

  let deals = [];

  const stageLabels = {
    lead_generated: "Lead Generated",
    contacted: "Contacted",
    qualified: "Qualified",
    quotation_sent: "Quotation Sent",
    negotiation: "Negotiation",
    won: "Won",
    completed: "Completed",
    lost: "Lost",
  };

  function getPayload() {
    const fields = form.elements;
    return {
      title: fields.title.value.trim(),
      companyName: fields.companyName.value.trim(),
      contactName: fields.contactName.value.trim(),
      contactEmail: fields.contactEmail.value.trim(),
      country: fields.country.value.trim(),
      value: Number(fields.value.value) || 0,
      currency: fields.currency.value.trim() || "USD",
      stage: fields.stage.value,
      probability: Number(fields.probability.value) || 0,
      nextAction: fields.nextAction.value.trim(),
      expectedCloseDate: fields.expectedCloseDate.value || undefined,
      notes: fields.notes.value.trim(),
    };
  }

  function resetForm() {
    form.reset();
    idField.value = "";
    submitButton.textContent = "Save deal";
  }

  function renderSummary(summary = []) {
    if (!summaryGrid) return;

    const activeValue = summary
      .filter((item) => !["lost", "completed"].includes(item.stage))
      .reduce((sum, item) => sum + Number(item.value || 0), 0);
    const activeCount = summary
      .filter((item) => !["lost", "completed"].includes(item.stage))
      .reduce((sum, item) => sum + Number(item.count || 0), 0);

    const cards = [
      ["Active deals", activeCount],
      ["Pipeline value", `USD ${activeValue.toLocaleString()}`],
      ["Won", summary.find((item) => item.stage === "won")?.count || 0],
      ["Completed", summary.find((item) => item.stage === "completed")?.count || 0],
    ];

    summaryGrid.innerHTML = cards
      .map(
        ([label, value]) => `
          <article class="analytics-card">
            <h3>${label}</h3>
            <div class="summary-card"><h2>${value}</h2></div>
          </article>
        `,
      )
      .join("");
  }

  function renderDeals() {
    if (!deals.length) {
      tableBody.innerHTML = `<tr><td colspan="7">No deals yet. Add your first buyer opportunity above.</td></tr>`;
      return;
    }

    tableBody.innerHTML = deals
      .map(
        (deal) => `
          <tr>
            <td><strong>${deal.title}</strong><div class="table-subtext">${deal.companyName || "No company"} · ${deal.country || "No country"}</div></td>
            <td>${stageLabels[deal.stage] || deal.stage}</td>
            <td>${deal.probability || 0}%</td>
            <td>${deal.currency || "USD"} ${Number(deal.value || 0).toLocaleString()}</td>
            <td>${deal.nextAction || "No action set"}</td>
            <td>${deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "-"}</td>
            <td>
              <div class="table-actions">
                <button type="button" class="secondary edit-deal" data-id="${deal._id}">Edit</button>
                <button type="button" class="secondary delete-deal" data-id="${deal._id}">Delete</button>
              </div>
            </td>
          </tr>
        `,
      )
      .join("");
  }

  async function loadDeals() {
    if (!TradeAI.auth.requireAuth()) return;

    tableBody.innerHTML = `<tr><td colspan="7">Loading deals...</td></tr>`;

    try {
      const params = {
        limit: 50,
        search: searchInput?.value.trim() || "",
      };

      if (stageFilter?.value) params.stage = stageFilter.value;

      const data = await api.list(params);
      deals = data.deals || [];
      renderSummary(data.summary || []);
      renderDeals();
    } catch (error) {
      tableBody.innerHTML = `<tr><td colspan="7">${error.message}</td></tr>`;
      TradeAI.toast(error.message, "error");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = getPayload();

    if (!payload.title) {
      TradeAI.toast("Deal title is required.", "error");
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.textContent = idField.value ? "Updating..." : "Saving...";

      if (idField.value) {
        await api.update(idField.value, payload);
      } else {
        await api.create(payload);
      }

      TradeAI.toast(idField.value ? "Deal updated." : "Deal added.");
      resetForm();
      await loadDeals();
    } catch (error) {
      TradeAI.toast(error.message, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = idField.value ? "Update deal" : "Save deal";
    }
  });

  tableBody.addEventListener("click", async (event) => {
    const editButton = event.target.closest(".edit-deal");
    const deleteButton = event.target.closest(".delete-deal");
    const id = editButton?.dataset.id || deleteButton?.dataset.id;
    const deal = deals.find((item) => item._id === id);

    if (editButton && deal) {
      const fields = form.elements;
      idField.value = deal._id;
      fields.title.value = deal.title || "";
      fields.companyName.value = deal.companyName || "";
      fields.contactName.value = deal.contactName || "";
      fields.contactEmail.value = deal.contactEmail || "";
      fields.country.value = deal.country || "";
      fields.value.value = deal.value || "";
      fields.currency.value = deal.currency || "USD";
      fields.stage.value = deal.stage || "lead_generated";
      fields.probability.value = deal.probability || 20;
      fields.nextAction.value = deal.nextAction || "";
      fields.expectedCloseDate.value = deal.expectedCloseDate
        ? new Date(deal.expectedCloseDate).toISOString().slice(0, 10)
        : "";
      fields.notes.value = deal.notes || "";
      submitButton.textContent = "Update deal";
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (deleteButton && deal) {
      const confirmed = await TradeAI.confirmDialog(`Delete ${deal.title}?`);
      if (!confirmed) return;

      try {
        await api.remove(deal._id);
        TradeAI.toast("Deal deleted.");
        await loadDeals();
      } catch (error) {
        TradeAI.toast(error.message, "error");
      }
    }
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    loadDeals();
  });
  stageFilter?.addEventListener("change", loadDeals);

  window.addEventListener("DOMContentLoaded", loadDeals);
})();
