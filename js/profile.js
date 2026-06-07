(function () {
  const form = document.getElementById("profileForm");
  const kycForm = document.getElementById("kycForm");
  const completion = document.getElementById("profileCompletion");
  const planName = document.getElementById("profilePlanName");
  const verification = document.getElementById("profileVerification");

  if (!form || !window.TradeAI?.api?.profile) return;

  const fields = {
    companyName: document.getElementById("profileCompanyName"),
    contactPerson: document.getElementById("profileContactPerson"),
    industry: document.getElementById("profileIndustry"),
    businessType: document.getElementById("profileBusinessType"),
    yearEstablished: document.getElementById("profileYearEstablished"),
    employeeCount: document.getElementById("profileEmployeeCount"),
    country: document.getElementById("profileCountry"),
    state: document.getElementById("profileState"),
    city: document.getElementById("profileCity"),
    address: document.getElementById("profileAddress"),
    website: document.getElementById("profileWebsite"),
    phone: document.getElementById("profilePhone"),
    email: document.getElementById("profileEmail"),
    whatsapp: document.getElementById("profileWhatsapp"),
    gstNumber: document.getElementById("profileGst"),
    iecNumber: document.getElementById("profileIec"),
    exportCategories: document.getElementById("profileExportCategories"),
    interestedProducts: document.getElementById("profileInterestedProducts"),
    mainProducts: document.getElementById("profileMainProducts"),
    hsCodes: document.getElementById("profileHsCodes"),
    exportCountries: document.getElementById("profileExportCountries"),
    importCountries: document.getElementById("profileImportCountries"),
    targetMarkets: document.getElementById("profileTargetMarkets"),
    preferredSupplierCountries: document.getElementById("profileSupplierCountries"),
    buyingQuantity: document.getElementById("profileBuyingQuantity"),
    moq: document.getElementById("profileMoq"),
    annualRevenue: document.getElementById("profileAnnualRevenue"),
    productionCapacity: document.getElementById("profileProductionCapacity"),
    certificates: document.getElementById("profileCertificates"),
    kycDocuments: document.getElementById("profileKycDocuments"),
    logoUrl: document.getElementById("profileLogoUrl"),
    bannerUrl: document.getElementById("profileBannerUrl"),
    catalogPdfUrl: document.getElementById("profileCatalogPdfUrl"),
    gallery: document.getElementById("profileGallery"),
    about: document.getElementById("profileAbout"),
  };

  function setField(name, value) {
    if (fields[name]) fields[name].value = Array.isArray(value) ? value.join(", ") : value || "";
  }

  function getPayload() {
    return Object.fromEntries(
      Object.entries(fields).map(([key, field]) => [key, field?.value?.trim() || ""]),
    );
  }

  function renderMeta(data) {
    const profile = data.profile || {};
    const subscription = data.subscription || {};

    if (completion) completion.textContent = `${profile.profileCompletion || 0}%`;
    if (planName) planName.textContent = subscription.plan || "free";
    if (verification) verification.textContent = profile.verificationStatus || "pending";
  }

  async function loadProfile() {
    if (!TradeAI.auth.requireAuth()) return;

    try {
      const data = await TradeAI.api.profile.get();
      const profile = data.profile || {};

      Object.keys(fields).forEach((key) => setField(key, profile[key]));
      renderMeta(data);
    } catch (error) {
      TradeAI.toast(error.message, "error");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const profile = await TradeAI.api.profile.update(getPayload());
      TradeAI.toast("Company profile saved.");
      renderMeta({ profile });
    } catch (error) {
      TradeAI.toast(error.message, "error");
    }
  });

  kycForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const documentType = document.getElementById("kycDocumentType")?.value;
    const documentUrl = document.getElementById("kycDocumentUrl")?.value.trim();
    const documentNumber = document.getElementById("kycDocumentNumber")?.value.trim();

    if (!documentUrl) {
      TradeAI.toast("Document URL is required.", "error");
      return;
    }

    try {
      const data = await TradeAI.api.profile.submitKyc([
        { documentType, documentUrl, documentNumber },
      ]);
      TradeAI.toast(data.message || "KYC submitted.");
      kycForm.reset();
      renderMeta({ profile: data.profile });
    } catch (error) {
      TradeAI.toast(error.message, "error");
    }
  });

  window.addEventListener("DOMContentLoaded", loadProfile);
})();
