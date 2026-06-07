(function () {
  const container = document.getElementById("publicCompanyProfile");
  const api = window.TradeAI?.api?.marketplace;
  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!container) return;

  const sampleCompany = {
    companyName: "Demo Global Spice Hub",
    industry: "Agri exports",
    city: "Ahmedabad",
    country: "India",
    about:
      "Company profile preview is running in demo mode. Live company data will appear after backend deployment.",
    verificationStatus: "demo",
    reliabilityScore: 82,
    ratingAverage: 4.4,
    readiness: "Trade readiness: 82%",
    matchScore: "82/100",
    moq: "Sample MOQ on request",
    productionCapacity: "Demo monthly capacity",
    mainProducts: ["Turmeric", "Cumin", "Sesame"],
    exportCountries: ["Kenya", "UAE", "Saudi Arabia"],
    hsCodes: ["0910", "1207"],
  };

  const sampleProducts = [
    { name: "Demo Product: Organic Turmeric", category: "Spices", hsCode: "0910" },
    { name: "Demo Product: Sesame Seeds", category: "Oil seeds", hsCode: "1207" },
  ];

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function list(items = []) {
    return items.length
      ? items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")
      : "<span>Not listed yet</span>";
  }

  function introAttributes(company, isDemo) {
    return [
      "data-profile-intro",
      'data-request-type="company_profile_intro"',
      'data-target-type="company"',
      `data-target-id="${escapeHtml(company._id || "")}"`,
      `data-target-slug="${escapeHtml(company.publicSlug || slug || "")}"`,
      `data-target-name="${escapeHtml(company.companyName || "Company profile")}"`,
      `data-country="${escapeHtml(company.country || "")}"`,
      `data-industry="${escapeHtml(company.industry || "")}"`,
      `data-product="${escapeHtml(company.mainProducts?.[0] || "")}"`,
      `data-source="${escapeHtml(isDemo ? "company-public-demo" : "company-public")}"`,
    ].join(" ");
  }

  function renderCompany(company, featuredProducts = [], isDemo = false) {
    document.title = `${company.companyName} - TradeAI`;
    container.innerHTML = `
      ${
        isDemo
          ? `<section class="empty-state"><h3>Company profile preview is running in demo mode.</h3><p>Live company data will appear after backend deployment. Please review the profile structure, CTAs and buyer/supplier journey.</p></section>`
          : ""
      }
      <section class="public-company-hero" style="${company.bannerUrl ? `background-image: linear-gradient(rgba(2,8,23,.62), rgba(2,8,23,.72)), url('${escapeHtml(company.bannerUrl)}')` : ""}">
        <div class="marketplace-logo large">${company.logoUrl ? `<img src="${escapeHtml(company.logoUrl)}" alt="${escapeHtml(company.companyName)} logo" />` : `<i class="fa-solid fa-building"></i>`}</div>
        <div>
          <span class="section-kicker">${isDemo ? "MVP Preview Data" : company.verificationStatus === "verified" ? "Verified company" : "Company profile"}</span>
          <h1>${escapeHtml(company.companyName)}</h1>
          <p>${escapeHtml(company.about || `${company.industry || "Trade"} company based in ${company.country || "global markets"}.`)}</p>
          <div class="card-actions">
            <button class="feature-btn" type="button" ${introAttributes(company, isDemo)}>Request Intro</button>
            <a class="secondary" href="contact.html?interest=feedback&source=company-public">Send Feedback</a>
            ${company.whatsapp ? `<a class="secondary" href="https://wa.me/${escapeHtml(company.whatsapp.replace(/[^0-9]/g, ""))}">WhatsApp</a>` : ""}
            ${company.catalogPdfUrl ? `<a class="secondary" href="${escapeHtml(company.catalogPdfUrl)}">Catalog PDF</a>` : ""}
          </div>
          <p class="company-disclaimer">${isDemo ? "Sample MVP profile. Live company verification will require backend and admin approval." : "Verification and trade readiness should be reviewed before commercial decisions."}</p>
        </div>
      </section>
      <section class="dashboard-section">
        <div class="analytics-grid compact-stats">
          <article class="analytics-card"><h3>Industry</h3><div class="summary-card"><h2>${escapeHtml(company.industry || "N/A")}</h2></div></article>
          <article class="analytics-card"><h3>Location</h3><div class="summary-card"><h2>${escapeHtml(`${company.city || ""} ${company.country || ""}`.trim() || "N/A")}</h2></div></article>
          <article class="analytics-card"><h3>Trade readiness</h3><div class="summary-card"><h2>${escapeHtml(company.readiness || "Under review")}</h2></div></article>
          <article class="analytics-card"><h3>Match score</h3><div class="summary-card"><h2>${escapeHtml(company.matchScore || `${company.reliabilityScore || 0}/100`)}</h2></div></article>
        </div>
      </section>
      <section class="dashboard-section two-column-layout">
        <article class="dashboard-panel">
          <h2>Business Information</h2>
          <p><strong>Verification:</strong> ${isDemo ? "Sample Data" : escapeHtml(company.verificationStatus || "Not verified")}</p>
          <p><strong>Buyer/supplier fit:</strong> ${isDemo ? "Demo Preview" : escapeHtml(company.businessType || company.type || "Trade company")}</p>
          <p><strong>GST/VAT:</strong> ${escapeHtml(company.gstNumber || "Not shared")}</p>
          <p><strong>IEC:</strong> ${escapeHtml(company.iecNumber || "Not shared")}</p>
          <p><strong>MOQ:</strong> ${escapeHtml(company.moq || "On request")}</p>
          <p><strong>Production:</strong> ${escapeHtml(company.productionCapacity || "On request")}</p>
          <div class="tag-row">${list(company.mainProducts)}</div>
        </article>
        <article class="dashboard-panel">
          <h2>Trade Markets</h2>
          <p><strong>Export countries</strong></p>
          <div class="tag-row">${list(company.exportCountries || company.targetMarkets)}</div>
          <p><strong>HS codes</strong></p>
          <div class="tag-row">${list(company.hsCodes)}</div>
          <p><strong>Recommended next step</strong></p>
          <p>${isDemo ? "Request an intro or founder walkthrough to review how verified records will work after deployment." : "Request an intro after reviewing company verification and product fit."}</p>
        </article>
      </section>
      <section class="dashboard-section">
        <article class="dashboard-panel">
          <h2>Featured Products</h2>
          <div class="tool-grid">
            ${
              (featuredProducts || [])
                .map(
                  (product) =>
                    `<article class="feature-card"><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.category || "")} - HS ${escapeHtml(product.hsCode || "N/A")}</p></article>`,
                )
                .join("") || "<p>No products listed yet.</p>"
            }
          </div>
        </article>
      </section>
    `;
  }

  function getIntroModal() {
    let modal = document.getElementById("companyIntroModal");

    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "companyIntroModal";
    modal.className = "modal-backdrop";
    modal.innerHTML = `
      <form class="modal-card marketplace-intro-form" id="companyIntroForm">
        <h3>Request company intro</h3>
        <p class="modal-message" id="companyIntroSummary"></p>
        <input type="hidden" name="requestType" />
        <input type="hidden" name="targetType" />
        <input type="hidden" name="targetId" />
        <input type="hidden" name="targetSlug" />
        <input type="hidden" name="targetName" />
        <input type="hidden" name="country" />
        <input type="hidden" name="industry" />
        <input type="hidden" name="product" />
        <input type="hidden" name="source" />
        <div class="input-group">
          <label for="companyIntroName">Name</label>
          <input id="companyIntroName" name="name" type="text" required />
        </div>
        <div class="input-group">
          <label for="companyIntroEmail">Email</label>
          <input id="companyIntroEmail" name="email" type="email" required />
        </div>
        <div class="input-group">
          <label for="companyIntroCompany">Company</label>
          <input id="companyIntroCompany" name="company" type="text" />
        </div>
        <div class="input-group">
          <label for="companyIntroRoleType">Role/type</label>
          <select id="companyIntroRoleType" name="roleType">
            <option value="">Select role</option>
            <option value="exporter">Exporter</option>
            <option value="importer">Importer</option>
            <option value="consultant">Consultant</option>
            <option value="investor">Investor</option>
            <option value="mentor">Mentor</option>
            <option value="technical reviewer">Technical reviewer</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="input-group">
          <label for="companyIntroMessage">Message</label>
          <textarea id="companyIntroMessage" name="message" rows="4" required></textarea>
        </div>
        <p id="companyIntroStatus" aria-live="polite"></p>
        <div class="modal-actions">
          <button type="button" class="secondary company-intro-cancel">Cancel</button>
          <button type="submit" class="primary">Submit request</button>
        </div>
      </form>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".company-intro-cancel").addEventListener("click", () => {
      modal.classList.remove("active");
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("active");
      }
    });
    modal.querySelector("form").addEventListener("submit", submitIntroRequest);

    return modal;
  }

  function openIntroModal(button) {
    const modal = getIntroModal();
    const form = modal.querySelector("form");
    const targetName = button.dataset.targetName || "this company";

    form.reset();
    [
      "requestType",
      "targetType",
      "targetId",
      "targetSlug",
      "targetName",
      "country",
      "industry",
      "product",
      "source",
    ].forEach((field) => {
      form.elements[field].value = button.dataset[field] || "";
    });
    form.elements.message.value = `Please review intro fit for ${targetName}.`;
    modal.querySelector("#companyIntroSummary").textContent = `Target: ${targetName}`;
    modal.querySelector("#companyIntroStatus").textContent = "";
    modal.classList.add("active");
    window.requestAnimationFrame(() => form.elements.name.focus());
  }

  function buildIntroPayload(form) {
    const formData = new FormData(form);

    return Object.fromEntries(
      [
        "name",
        "email",
        "company",
        "roleType",
        "requestType",
        "targetType",
        "targetId",
        "targetSlug",
        "targetName",
        "country",
        "industry",
        "product",
        "message",
        "source",
      ].map((key) => [key, String(formData.get(key) || "").trim()]),
    );
  }

  async function submitIntroRequest(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const status = form.querySelector("#companyIntroStatus");
    const submitButton = form.querySelector('button[type="submit"]');
    const fallbackMessage =
      "Intro request is running in MVP preview mode. Please use the contact form or try again after backend deployment.";

    if (!window.TradeAI?.api?.marketplace?.requestIntro) {
      status.textContent = fallbackMessage;
      window.TradeAI?.toast?.(fallbackMessage, "error");
      return;
    }

    submitButton.disabled = true;

    try {
      await window.TradeAI.api.marketplace.requestIntro(buildIntroPayload(form));
      status.textContent = "Intro request saved for admin review.";
      window.TradeAI?.toast?.("Intro request saved for admin review.", "success");
      window.setTimeout(() => {
        document.getElementById("companyIntroModal")?.classList.remove("active");
      }, 900);
    } catch (error) {
      status.textContent = fallbackMessage;
      window.TradeAI?.toast?.(fallbackMessage, "error");
    } finally {
      submitButton.disabled = false;
    }
  }

  async function loadCompany() {
    if (!slug || !api?.company) {
      renderCompany(sampleCompany, sampleProducts, true);
      return;
    }

    try {
      const { company, featuredProducts } = await api.company(slug);
      renderCompany(company, featuredProducts, false);
    } catch (error) {
      renderCompany(sampleCompany, sampleProducts, true);
    }
  }

  container.addEventListener("click", (event) => {
    const introButton = event.target.closest("[data-profile-intro]");

    if (introButton) {
      openIntroModal(introButton);
    }
  });

  loadCompany();
})();
