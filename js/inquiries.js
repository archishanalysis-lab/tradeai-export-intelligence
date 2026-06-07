(function () {
  const container = document.getElementById("inquiryInbox");
  const form = document.getElementById("inquiryForm");
  const productSelect = document.getElementById("inquiryProduct");
  const buyerSelect = document.getElementById("inquiryBuyer");
  const buyerName = document.getElementById("inquiryBuyerName");
  const buyerEmail = document.getElementById("inquiryBuyerEmail");
  const companyName = document.getElementById("inquiryCompanyName");
  const message = document.getElementById("inquiryMessage");
  const submitButton = document.getElementById("inquirySubmitBtn");
  const submitButtonLabel = submitButton?.querySelector(".button-label");

  if (!container || !window.TradeAI) return;

  let buyers = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function render(items = []) {
    if (!items.length) {
      container.innerHTML = `
        <article class="activity-card">
          <h4>No inquiries yet</h4>
          <p>Buyer inquiries will appear here after products receive interest.</p>
        </article>
      `;
      return;
    }

    container.innerHTML = items
      .map(
        (item) => `
          <article class="activity-card">
            <h4>${escapeHtml(item.companyName || item.buyerName || "Buyer inquiry")}</h4>
            <p>${escapeHtml(item.product?.name || "Product")} - <strong>${escapeHtml(item.status)}</strong></p>
            <p>${escapeHtml(item.message || "No message provided.")}</p>
            <div class="table-actions">
              <button
                class="secondary inquiry-deal"
                data-id="${escapeHtml(item._id)}"
                data-product="${escapeHtml(item.product?._id || item.product || "")}"
                data-title="${escapeHtml(`${item.companyName || item.buyerName || "Buyer"} - ${item.product?.name || "Product inquiry"}`)}"
                data-company="${escapeHtml(item.companyName || "")}"
                data-name="${escapeHtml(item.buyerName || "")}"
                data-email="${escapeHtml(item.buyerEmail || "")}"
              >
                Track as deal
              </button>
              ${["pending", "accepted", "rejected", "completed"]
                .map(
                  (status) => `
                    <button class="secondary inquiry-status" data-id="${escapeHtml(item._id)}" data-status="${status}">
                      ${status}
                    </button>
                  `,
                )
                .join("")}
            </div>
          </article>
        `,
      )
      .join("");
  }

  async function loadInquiries() {
    if (!TradeAI.auth.requireAuth()) return;

    try {
      const data = await TradeAI.request("/inquiries");
      render(data.inquiries || []);
    } catch (error) {
      TradeAI.toast(error.message, "error");
      render();
    }
  }

  function renderProductOptions(products = []) {
    if (!productSelect) return;

    productSelect.innerHTML = products.length
      ? `<option value="">Choose product</option>${products
          .map(
            (product) =>
              `<option value="${escapeHtml(product._id)}">${escapeHtml(product.name)}</option>`,
          )
          .join("")}`
      : `<option value="">Add a product first</option>`;
  }

  function renderBuyerOptions(items = []) {
    if (!buyerSelect) return;

    buyerSelect.innerHTML = items.length
      ? `<option value="">Manual buyer details</option>${items
          .map(
            (buyer) =>
              `<option value="${escapeHtml(buyer._id)}">${escapeHtml(buyer.companyName)} - ${escapeHtml(buyer.country)}</option>`,
          )
          .join("")}`
      : `<option value="">Manual buyer details</option>`;
  }

  function setSubmitState(isLoading) {
    if (!submitButton) return;

    submitButton.disabled = isLoading;

    if (submitButtonLabel) {
      submitButtonLabel.textContent = isLoading ? "Creating..." : "Create inquiry";
      return;
    }

    submitButton.textContent = isLoading ? "Creating..." : "Create inquiry";
  }

  function validateInquiryForm() {
    if (!productSelect.value) {
      TradeAI.toast("Choose a product before creating inquiry.", "error");
      productSelect.focus();
      return false;
    }

    if (!buyerName.value.trim()) {
      TradeAI.toast("Enter buyer contact name.", "error");
      buyerName.focus();
      return false;
    }

    if (!buyerEmail.value.trim() || !buyerEmail.checkValidity()) {
      TradeAI.toast("Enter a valid buyer email.", "error");
      buyerEmail.focus();
      return false;
    }

    if (!companyName.value.trim()) {
      TradeAI.toast("Enter buyer company name.", "error");
      companyName.focus();
      return false;
    }

    if (message.value.trim().length < 20) {
      TradeAI.toast("Message should be at least 20 characters.", "error");
      message.focus();
      return false;
    }

    return true;
  }

  async function loadFormOptions() {
    try {
      const [productData, buyerData] = await Promise.all([
        TradeAI.api?.products?.list({ limit: 100 }) || TradeAI.request("/products?limit=100"),
        TradeAI.api?.buyers?.list({ limit: 100 }) || TradeAI.request("/buyers?limit=100"),
      ]);

      buyers = buyerData.buyers || [];
      renderProductOptions(productData.products || []);
      renderBuyerOptions(buyers);
    } catch (error) {
      TradeAI.toast(error.message, "error");
      renderProductOptions();
      renderBuyerOptions();
    }
  }

  buyerSelect?.addEventListener("change", () => {
    const buyer = buyers.find((item) => item._id === buyerSelect.value);
    if (!buyer) return;

    companyName.value = buyer.companyName || "";
    buyerEmail.value = buyer.contactEmail || "";
    buyerName.value = buyer.companyName || "";
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateInquiryForm()) return;

    setSubmitState(true);

    try {
      await TradeAI.request("/inquiries", {
        method: "POST",
        body: JSON.stringify({
          product: productSelect.value,
          buyer: buyerSelect.value || undefined,
          buyerName: buyerName.value.trim(),
          buyerEmail: buyerEmail.value.trim(),
          companyName: companyName.value.trim(),
          message: message.value.trim(),
        }),
      });

      TradeAI.toast("Inquiry created.");
      form.reset();
      await loadInquiries();
    } catch (error) {
      TradeAI.toast(error.message, "error");
    } finally {
      setSubmitState(false);
    }
  });

  container.addEventListener("click", async (event) => {
    const dealButton = event.target.closest(".inquiry-deal");
    const statusButton = event.target.closest(".inquiry-status");

    if (dealButton) {
      try {
        const payload = {
          inquiry: dealButton.dataset.id,
          product: dealButton.dataset.product || undefined,
          title: dealButton.dataset.title || "Buyer inquiry",
          companyName: dealButton.dataset.company || "",
          contactName: dealButton.dataset.name || "",
          contactEmail: dealButton.dataset.email || "",
          stage: "lead_generated",
          probability: 20,
          nextAction: "Review inquiry and send quotation",
        };

        if (TradeAI.api?.deals?.create) {
          await TradeAI.api.deals.create(payload);
        } else {
          await TradeAI.request("/deals", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }

        TradeAI.toast("Deal created from inquiry.");
        window.location.href = "deals.html";
      } catch (error) {
        TradeAI.toast(error.message, "error");
      }
      return;
    }

    if (!statusButton) return;

    try {
      await TradeAI.request(`/inquiries/${statusButton.dataset.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: statusButton.dataset.status }),
      });
      TradeAI.toast("Inquiry status updated.");
      loadInquiries();
    } catch (error) {
      TradeAI.toast(error.message, "error");
    }
  });

  window.addEventListener("DOMContentLoaded", loadInquiries);
  window.addEventListener("DOMContentLoaded", loadFormOptions);
})();
