(function () {
  const list = document.getElementById("savedItemsList");
  const total = document.getElementById("savedTotal");

  if (!list || !window.TradeAI?.api?.savedItems) return;

  function render(data = {}) {
    const buyerItems = data.savedItems || [];
    const companyItems = data.savedCompanies || [];
    const productItems = data.savedProducts || [];
    const items = [...companyItems, ...productItems, ...buyerItems];
    if (total) total.textContent = items.length;

    if (!items.length) {
      list.innerHTML = `
        <article class="activity-card">
          <h4>No saved profiles yet</h4>
          <p>Save buyers, companies and products to build your target account list.</p>
        </article>
      `;
      return;
    }

    list.innerHTML = items
      .map((item) => {
        const buyer = item.buyer || {};
        const company = item.companyProfile || {};
        const product = item.product || {};
        const title = company.companyName || product.name || buyer.companyName || item.title;
        const meta = company.country
          ? `${company.roleType || "company"} · ${company.country}`
          : product.category
            ? `${product.category} · HS ${product.hsCode || "N/A"}`
            : `${buyer.country || "Market"} - ${buyer.industry || item.itemType}`;
        const href = company.publicSlug
          ? `company-public.html?slug=${company.publicSlug}`
          : product._id
            ? "products.html"
            : "buyer-dashboard.html";
        return `
          <article class="activity-card">
            <h4>${title}</h4>
            <p>${meta}</p>
            <p>${buyer.contactEmail || company.email || "Contact details available after unlock or inquiry."}</p>
            <div class="table-actions">
              <a class="secondary" href="${href}">Open</a>
              ${item.itemType ? `<button class="secondary remove-saved" data-id="${item._id}">Remove</button>` : ""}
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function loadSaved() {
    if (!TradeAI.auth.isLoggedIn()) {
      if (total) total.textContent = "0";
      list.innerHTML = `
        <article class="activity-card">
          <h4>Login to view saved profiles</h4>
          <p>Saved buyers, suppliers and products are available after login.</p>
          <div class="table-actions">
            <a class="secondary" href="login.html?reason=login-required&redirect=saved-search.html">Login</a>
            <a class="primary" href="register.html?plan=Free&source=saved-search">Register</a>
          </div>
        </article>
      `;
      return;
    }

    try {
      const data = await TradeAI.api.savedItems.list();
      render(data);
    } catch (error) {
      TradeAI.toast(error.message, "error");
      render();
    }
  }

  list.addEventListener("click", async (event) => {
    const button = event.target.closest(".remove-saved");
    if (!button) return;

    try {
      await TradeAI.api.savedItems.remove(button.dataset.id);
      TradeAI.toast("Saved item removed.");
      await loadSaved();
    } catch (error) {
      TradeAI.toast(error.message, "error");
    }
  });

  window.addEventListener("DOMContentLoaded", loadSaved);
})();
