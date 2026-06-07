(function () {
  const overviewGrid = document.getElementById("adminOverview");
  const usersBody = document.getElementById("adminUsersBody");
  const buyersBody = document.getElementById("adminBuyersBody");
  const productsBody = document.getElementById("adminProductsBody");
  const inquiriesBody = document.getElementById("adminInquiriesBody");
  const feedbackBody = document.getElementById("adminFeedbackBody");
  const reportRequestsBody = document.getElementById("adminReportRequestsBody");
  const savedReportsBody = document.getElementById("adminSavedReportsBody");
  const feedbackStatusFilter = document.getElementById("feedbackStatusFilter");
  const feedbackPriorityFilter = document.getElementById("feedbackPriorityFilter");
  const feedbackTypeFilter = document.getElementById("feedbackTypeFilter");
  const reportStatusFilter = document.getElementById("reportStatusFilter");
  const reportPriorityFilter = document.getElementById("reportPriorityFilter");
  const introRequestsBody = document.getElementById("adminIntroRequestsBody");
  const introStatusFilter = document.getElementById("introStatusFilter");
  const introPriorityFilter = document.getElementById("introPriorityFilter");
  const introRequestTypeFilter = document.getElementById("introRequestTypeFilter");
  const introTargetTypeFilter = document.getElementById("introTargetTypeFilter");

  if (!overviewGrid) return;

  const REVIEW_STATUSES = ["new", "reviewed", "action_required", "closed"];
  const INTRO_REVIEW_STATUSES = ["new", "reviewed", "action_required", "contacted", "closed"];
  const ADMIN_PREVIEW_MESSAGE =
    "Showing MVP preview state until backend/admin data is available.";

  const previewData = {
    overview: {
      users: 124,
      pendingKyc: 18,
      pendingProducts: 9,
      pendingInquiries: 14,
      paymentsPlaceholder: "Staging",
      riskAlerts: 3,
    },
    users: [
      {
        name: "Sample Data: Exporter Reviewer",
        email: "reviewer@example.com",
        company: "Demo Export Co.",
        role: "exporter",
        status: "Pending KYC",
        demo: true,
      },
      {
        name: "Sample Data: Importer Reviewer",
        email: "buyer@example.com",
        company: "Demo Import LLC",
        role: "importer",
        status: "Active preview",
        demo: true,
      },
    ],
    buyers: [
      { companyName: "MVP Preview: Gulf Retail Buyer", country: "UAE", industry: "Food imports", verified: false, demo: true },
      { companyName: "MVP Preview: East Africa Distributor", country: "Kenya", industry: "Wholesale", verified: false, demo: true },
    ],
    products: [
      { name: "Sample Data: Organic Turmeric", category: "Spices", hsCode: "0910", approvalStatus: "Pending review", demo: true },
      { name: "Sample Data: Engineering Fasteners", category: "Light engineering", hsCode: "7318", approvalStatus: "MVP Preview", demo: true },
    ],
    inquiries: [
      { companyName: "MVP Preview: Gulf Retail Buyer", product: { name: "Organic Turmeric" }, status: "Sample inquiry", updatedAt: new Date().toISOString(), demo: true },
      { companyName: "MVP Preview: East Africa Distributor", product: { name: "Engineering Fasteners" }, status: "Compliance note", updatedAt: new Date().toISOString(), demo: true },
    ],
    feedback: [
      {
        name: "Sample Data: Technical Reviewer",
        email: "tech.reviewer@example.com",
        company: "MVP Review Group",
        roleType: "technical reviewer",
        feedbackType: "Technical review",
        priority: "High priority",
        status: "new",
        message: "Check fallback states, admin review queues and whether the dashboard communicates platform value clearly.",
        createdAt: new Date().toISOString(),
        demo: true,
      },
      {
        name: "Sample Data: Export Mentor",
        email: "mentor@example.com",
        company: "Trade Advisory Demo",
        roleType: "mentor",
        feedbackType: "Market opportunity",
        priority: "Very useful",
        status: "reviewed",
        message: "Exporter journey is clear, but the report flow should capture specific next actions for founder follow-up.",
        createdAt: new Date().toISOString(),
        demo: true,
      },
    ],
    reportRequests: [
      {
        name: "Sample Data: SME Exporter",
        email: "sme@example.com",
        company: "Demo Foods Pvt Ltd",
        roleType: "exporter",
        productName: "Organic turmeric",
        hsCode: "0910",
        originCountry: "India",
        targetCountry: "India to UAE",
        reportObjective: "Market discovery",
        priority: "Medium priority",
        status: "new",
        message: "Need a full report showing demand signal, buyer direction and compliance checklist.",
        createdAt: new Date().toISOString(),
        demo: true,
      },
      {
        name: "Sample Data: Import Consultant",
        email: "consultant@example.com",
        company: "Sourcing Demo Desk",
        roleType: "consultant",
        productName: "Engineering fasteners",
        hsCode: "7318",
        originCountry: "India",
        targetCountry: "East Africa comparison",
        reportObjective: "Buyer discovery",
        priority: "High priority",
        status: "action_required",
        message: "Compare corridor priority before deciding whether buyer lead unlocks should be paid.",
        createdAt: new Date().toISOString(),
        demo: true,
      },
    ],
    savedReports: [
      {
        title: "MVP Sample: India to Kenya turmeric opportunity",
        product: "Organic turmeric",
        hsCode: "0910",
        originCountry: "India",
        targetCountry: "Kenya",
        createdBy: {
          name: "Sample Data: SME Exporter",
          email: "sme@example.com",
        },
        structuredReport: {
          opportunityScore: 72,
          riskLevel: "Medium",
          dataSourceLabel: "TradeAI MVP sample report metadata. Not live verified trade data.",
        },
        createdAt: new Date().toISOString(),
        demo: true,
      },
    ],
    introRequests: [
      {
        name: "Sample Data: Exporter Founder",
        email: "exporter@example.com",
        company: "Demo Export Co.",
        roleType: "exporter",
        requestType: "buyer_intro",
        targetType: "importer",
        targetName: "Sample Importer Gulf Trading",
        country: "UAE",
        industry: "Wholesale distribution",
        product: "Organic turmeric",
        priority: "High priority",
        status: "new",
        message: "Request intro to validate buyer fit before sending quotation.",
        adminNotes: "Preview row only.",
        createdAt: new Date().toISOString(),
        demo: true,
      },
      {
        name: "Sample Data: Importer Buyer",
        email: "importer@example.com",
        company: "Demo Import LLC",
        roleType: "importer",
        requestType: "supplier_intro",
        targetType: "supplier",
        targetName: "Demo Supplier East Africa",
        country: "India",
        industry: "Food products",
        product: "Rice",
        priority: "Medium priority",
        status: "contacted",
        message: "Looking for a supplier intro with MOQ and documentation readiness.",
        adminNotes: "Preview row only.",
        createdAt: new Date().toISOString(),
        demo: true,
      },
    ],
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
  }

  function summarize(value, maxLength = 120) {
    const text = String(value || "").trim();

    if (!text) return "-";

    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
  }

  function statusLabel(value) {
    return String(value || "new").replace(/_/g, " ");
  }

  function getSelectedFilters(filters) {
    return Object.fromEntries(
      Object.entries(filters)
        .map(([key, element]) => [key, element?.value || ""])
        .filter(([, value]) => value),
    );
  }

  function badge(value) {
    return `<span class="status-badge status-active">${value}</span>`;
  }

  function renderOverview(data = {}) {
    const cards = [
      ["Total users", data.users || 0],
      ["Pending KYC", data.pendingKyc || data.suspendedUsers || 0],
      ["Product approvals", data.pendingProducts || 0],
      ["Inquiries", data.pendingInquiries || 0],
      ["Payments overview", data.paymentsPlaceholder || "Staging"],
      ["Platform risk alerts", data.riskAlerts || 0],
    ];

    overviewGrid.innerHTML = cards
      .map(
        ([label, value]) => `
          <article class="analytics-card">
            <h3>${label}</h3>
            <div class="summary-card"><h2>${value}</h2><span class="status-badge status-active">${data.demo ? "MVP Preview" : "Live"}</span></div>
          </article>
        `,
      )
      .join("");
  }

  function renderUsers(users = []) {
    usersBody.innerHTML =
      users
        .map(
          (user) => `
            <tr>
              <td><strong>${user.name}</strong><div class="table-subtext">${user.email}</div></td>
              <td>${user.company || "-"}</td>
              <td>${badge(user.role)}</td>
              <td>${badge(user.status || "active")}</td>
              <td>
                <button class="secondary user-status" data-id="${user._id}" data-status="${
                  user.status === "suspended" ? "active" : "suspended"
                }" ${user.demo ? "disabled" : ""}>${user.demo ? "Preview only" : user.status === "suspended" ? "Activate" : "Suspend"}</button>
              </td>
            </tr>
          `,
        )
        .join("") || `<tr><td colspan="5">No users found.</td></tr>`;
  }

  function renderBuyers(buyers = []) {
    buyersBody.innerHTML =
      buyers
        .map(
          (buyer) => `
            <tr>
              <td><strong>${buyer.companyName}</strong><div class="table-subtext">${buyer.country}</div></td>
              <td>${buyer.industry}</td>
              <td>${buyer.verified ? badge("Verified") : "Pending"}</td>
              <td>
                <button class="secondary verify-buyer" data-id="${buyer._id}" ${
                  buyer.verified || buyer.demo ? "disabled" : ""
                }>${buyer.demo ? "Preview only" : "Verify"}</button>
              </td>
            </tr>
          `,
        )
        .join("") || `<tr><td colspan="4">No buyers found.</td></tr>`;
  }

  function renderProducts(products = []) {
    productsBody.innerHTML =
      products
        .map(
          (product) => `
            <tr>
              <td><strong>${product.name}</strong><div class="table-subtext">${
                product.createdBy?.company || product.createdBy?.email || "Unknown exporter"
              }</div></td>
              <td>${product.category || "-"}</td>
              <td>${product.hsCode || "-"}</td>
              <td>${badge(product.approvalStatus || "pending")}</td>
              <td>
                <button class="secondary product-approval" data-id="${product._id}" data-status="approved" ${product.demo ? "disabled" : ""}>Approve</button>
                <button class="secondary product-approval" data-id="${product._id}" data-status="rejected" ${product.demo ? "disabled" : ""}>Reject</button>
              </td>
            </tr>
          `,
        )
        .join("") || `<tr><td colspan="5">No products found.</td></tr>`;
  }

  function renderInquiries(inquiries = []) {
    inquiriesBody.innerHTML =
      inquiries
        .map(
          (inquiry) => `
            <tr>
              <td><strong>${inquiry.companyName || inquiry.buyerName || "Buyer"}</strong></td>
              <td>${inquiry.product?.name || "Product"}</td>
              <td>${badge(inquiry.status)}</td>
              <td>${new Date(inquiry.updatedAt).toLocaleDateString()}</td>
            </tr>
          `,
        )
        .join("") || `<tr><td colspan="4">No inquiries found.</td></tr>`;
  }

  function renderStatusAction(item, type, statuses = REVIEW_STATUSES) {
    if (item.demo) {
      return `<button class="secondary" disabled>Preview only</button>`;
    }

    const currentStatus = item.status || "new";

    return `
      <div class="admin-review-actions">
        <select class="admin-review-status" data-type="${type}" data-id="${escapeHtml(item._id)}" aria-label="Update review status">
          ${statuses.map(
            (status) =>
              `<option value="${status}" ${status === currentStatus ? "selected" : ""}>${statusLabel(status)}</option>`,
          ).join("")}
        </select>
        <textarea class="admin-review-notes" data-type="${type}" data-id="${escapeHtml(item._id)}" rows="2" placeholder="Admin notes">${escapeHtml(item.adminNotes || "")}</textarea>
        <button class="secondary admin-review-save" data-type="${type}" data-id="${escapeHtml(item._id)}">Save</button>
      </div>
    `;
  }

  function renderFeedback(feedback = [], previewMode = false) {
    if (!feedbackBody) return;

    feedbackBody.innerHTML =
      feedback
        .map(
          (item) => `
            <tr>
              <td>
                <strong>${escapeHtml(item.name || "Reviewer")}</strong>
                <div class="table-subtext">${escapeHtml(item.email || "-")}</div>
                <div class="table-subtext">${escapeHtml(item.company || "-")}</div>
              </td>
              <td>
                ${badge(escapeHtml(item.feedbackType || "Feedback"))}
                <div class="table-subtext">${escapeHtml(item.roleType || "reviewer")}</div>
              </td>
              <td>${badge(escapeHtml(item.priority || "Normal"))}</td>
              <td>${badge(escapeHtml(statusLabel(item.status)))}</td>
              <td>${formatDate(item.createdAt)}</td>
              <td>${escapeHtml(summarize(item.message))}</td>
              <td>${renderStatusAction(item, "feedback")}</td>
            </tr>
          `,
        )
        .join("") ||
      `<tr><td colspan="7">${previewMode ? ADMIN_PREVIEW_MESSAGE : "No stakeholder feedback yet."}</td></tr>`;
  }

  function renderReportRequests(requests = [], previewMode = false) {
    if (!reportRequestsBody) return;

    reportRequestsBody.innerHTML =
      requests
        .map(
          (item) => `
            <tr>
              <td>
                <strong>${escapeHtml(item.name || "Requester")}</strong>
                <div class="table-subtext">${escapeHtml(item.email || "-")}</div>
                <div class="table-subtext">${escapeHtml(item.company || "-")}</div>
              </td>
              <td>
                <strong>${escapeHtml(item.productName || item.hsCode || "Report request")}</strong>
                <div class="table-subtext">${escapeHtml(item.originCountry || "-")} to ${escapeHtml(item.targetCountry || "-")}</div>
                <div class="table-subtext">${escapeHtml(item.reportObjective || "Objective pending")}</div>
              </td>
              <td>${badge(escapeHtml(item.priority || "Normal"))}</td>
              <td>${badge(escapeHtml(statusLabel(item.status)))}</td>
              <td>${formatDate(item.createdAt)}</td>
              <td>${escapeHtml(summarize(item.message))}</td>
              <td>${renderStatusAction(item, "report")}</td>
            </tr>
          `,
        )
        .join("") ||
      `<tr><td colspan="7">${previewMode ? ADMIN_PREVIEW_MESSAGE : "No export report requests yet."}</td></tr>`;
  }

  function renderSavedReports(reports = [], previewMode = false) {
    if (!savedReportsBody) return;

    savedReportsBody.innerHTML =
      reports
        .map((report) => {
          const structured = report.structuredReport || {};

          return `
            <tr>
              <td>
                <strong>${escapeHtml(report.title || "Export opportunity report")}</strong>
                <div class="table-subtext">${escapeHtml(report.product || "-")} ${report.hsCode ? `- HS ${escapeHtml(report.hsCode)}` : ""}</div>
                ${report.demo || report.isDemo ? `<div class="table-subtext">MVP sample data</div>` : ""}
              </td>
              <td>
                <strong>${escapeHtml(report.createdBy?.name || "User")}</strong>
                <div class="table-subtext">${escapeHtml(report.createdBy?.email || "-")}</div>
              </td>
              <td>${escapeHtml(report.originCountry || "India")} to ${escapeHtml(report.targetCountry || "-")}</td>
              <td>${badge(escapeHtml(structured.opportunityScore ?? "-"))}</td>
              <td>${badge(escapeHtml(structured.riskLevel || "Not scored"))}</td>
              <td>${formatDate(report.createdAt)}</td>
              <td>${escapeHtml(summarize(structured.dataSourceLabel || report.provider || "TradeAI report engine", 90))}</td>
            </tr>
          `;
        })
        .join("") ||
      `<tr><td colspan="7">${previewMode ? ADMIN_PREVIEW_MESSAGE : "No saved export opportunity reports yet."}</td></tr>`;
  }

  function renderIntroRequests(requests = [], previewMode = false) {
    if (!introRequestsBody) return;

    introRequestsBody.innerHTML =
      requests
        .map(
          (item) => `
            <tr>
              <td>
                <strong>${escapeHtml(item.name || "Requester")}</strong>
                <div class="table-subtext">${escapeHtml(item.email || "-")}</div>
                <div class="table-subtext">${escapeHtml(item.company || "-")}</div>
                <div class="table-subtext">${escapeHtml(item.roleType || "role pending")}</div>
              </td>
              <td>
                <strong>${escapeHtml(item.targetName || "Marketplace target")}</strong>
                <div class="table-subtext">${escapeHtml(statusLabel(item.requestType || "intro request"))}</div>
                <div class="table-subtext">${escapeHtml(item.targetType || "unknown")}</div>
              </td>
              <td>
                <strong>${escapeHtml(item.product || "-")}</strong>
                <div class="table-subtext">${escapeHtml(item.country || "-")}</div>
                <div class="table-subtext">${escapeHtml(item.industry || "-")}</div>
              </td>
              <td>${badge(escapeHtml(item.priority || "Normal"))}</td>
              <td>${badge(escapeHtml(statusLabel(item.status)))}</td>
              <td>${formatDate(item.createdAt)}</td>
              <td>
                ${escapeHtml(summarize(item.message))}
                ${item.adminNotes ? `<div class="table-subtext">Notes: ${escapeHtml(summarize(item.adminNotes, 90))}</div>` : ""}
              </td>
              <td>${renderStatusAction(item, "intro", INTRO_REVIEW_STATUSES)}</td>
            </tr>
          `,
        )
        .join("") ||
      `<tr><td colspan="8">${previewMode ? ADMIN_PREVIEW_MESSAGE : "No marketplace intro requests yet."}</td></tr>`;
  }

  async function loadFeedbackQueues() {
    const [feedback, reportRequests, introRequests] = await Promise.all([
      TradeAI.api.admin.contactFeedback(
        getSelectedFilters({
          status: feedbackStatusFilter,
          priority: feedbackPriorityFilter,
          feedbackType: feedbackTypeFilter,
        }),
      ),
      TradeAI.api.admin.reportRequests(
        getSelectedFilters({
          status: reportStatusFilter,
          priority: reportPriorityFilter,
        }),
      ),
      TradeAI.api.admin.marketplaceIntroRequests(
        getSelectedFilters({
          status: introStatusFilter,
          priority: introPriorityFilter,
          requestType: introRequestTypeFilter,
          targetType: introTargetTypeFilter,
        }),
      ),
    ]);

    renderFeedback(feedback.feedback || []);
    renderReportRequests(reportRequests.requests || []);
    renderIntroRequests(introRequests.requests || []);
  }

  async function loadAdmin() {
    if (!TradeAI.auth.requireAuth()) return;

    if (!window.TradeAI?.api?.admin) {
      renderPreview();
      return;
    }

    try {
      const [overview, users, buyers, products, inquiries, feedback, reportRequests, savedReports, introRequests] = await Promise.all([
        TradeAI.api.admin.overview(),
        TradeAI.api.admin.users(),
        TradeAI.api.admin.buyers(),
        TradeAI.api.admin.products(),
        TradeAI.api.admin.inquiries(),
        TradeAI.api.admin.contactFeedback(
          getSelectedFilters({
            status: feedbackStatusFilter,
            priority: feedbackPriorityFilter,
            feedbackType: feedbackTypeFilter,
          }),
        ),
        TradeAI.api.admin.reportRequests(
          getSelectedFilters({
            status: reportStatusFilter,
            priority: reportPriorityFilter,
          }),
        ),
        TradeAI.api.admin.reports(),
        TradeAI.api.admin.marketplaceIntroRequests(
          getSelectedFilters({
            status: introStatusFilter,
            priority: introPriorityFilter,
            requestType: introRequestTypeFilter,
            targetType: introTargetTypeFilter,
          }),
        ),
      ]);

      renderOverview(overview);
      renderUsers(users.users?.length ? users.users : previewData.users);
      renderBuyers(buyers.buyers?.length ? buyers.buyers : previewData.buyers);
      renderProducts(products.products?.length ? products.products : previewData.products);
      renderInquiries(inquiries.inquiries?.length ? inquiries.inquiries : previewData.inquiries);
      renderFeedback(feedback.feedback || []);
      renderReportRequests(reportRequests.requests || []);
      renderSavedReports(savedReports.reports || []);
      renderIntroRequests(introRequests.requests || []);
    } catch (error) {
      renderPreview();
      TradeAI.toast?.(
        "Admin dashboard is running in MVP preview mode. Live metrics will appear after backend deployment.",
        "error",
      );
    }
  }

  function renderPreview() {
    renderOverview({ ...previewData.overview, demo: true });
    renderUsers(previewData.users);
    renderBuyers(previewData.buyers);
    renderProducts(previewData.products);
    renderInquiries(previewData.inquiries);
    renderFeedback(previewData.feedback, true);
    renderReportRequests(previewData.reportRequests, true);
    renderSavedReports(previewData.savedReports, true);
    renderIntroRequests(previewData.introRequests, true);
  }

  function getReviewPayload(button) {
    const { type, id } = button.dataset;
    const statusControl = document.querySelector(`.admin-review-status[data-type="${type}"][data-id="${id}"]`);
    const notesControl = document.querySelector(`.admin-review-notes[data-type="${type}"][data-id="${id}"]`);

    return {
      type,
      id,
      payload: {
        status: statusControl?.value || "reviewed",
        adminNotes: notesControl?.value || "",
      },
    };
  }

  async function updateReviewItem(button) {
    const { type, id, payload } = getReviewPayload(button);

    if (!id || !window.TradeAI?.api?.admin) {
      TradeAI.toast?.(ADMIN_PREVIEW_MESSAGE, "error");
      return;
    }

    if (type === "feedback") {
      await TradeAI.api.admin.updateContactFeedbackStatus(id, payload);
      TradeAI.toast("Stakeholder feedback review updated.");
      await loadFeedbackQueues();
      return;
    }

    if (type === "intro") {
      await TradeAI.api.admin.updateMarketplaceIntroRequestStatus(id, payload);
      TradeAI.toast("Marketplace intro request updated.");
      await loadFeedbackQueues();
      return;
    }

    await TradeAI.api.admin.updateReportRequestStatus(id, payload);
    TradeAI.toast("Report request review updated.");
    await loadFeedbackQueues();
  }

  document.addEventListener("click", async (event) => {
    const userStatus = event.target.closest(".user-status");
    const verifyBuyer = event.target.closest(".verify-buyer");
    const productApproval = event.target.closest(".product-approval");
    const reviewSave = event.target.closest(".admin-review-save");

    try {
      if (reviewSave) {
        await updateReviewItem(reviewSave);
      }

      if (userStatus) {
        await TradeAI.api.admin.updateUserStatus(userStatus.dataset.id, userStatus.dataset.status);
        TradeAI.toast("User status updated.");
        await loadAdmin();
      }

      if (verifyBuyer) {
        await TradeAI.api.admin.verifyBuyer(verifyBuyer.dataset.id);
        TradeAI.toast("Buyer verified.");
        await loadAdmin();
      }

      if (productApproval) {
        await TradeAI.api.admin.updateProductApproval(
          productApproval.dataset.id,
          productApproval.dataset.status,
        );
        TradeAI.toast("Product review updated.");
        await loadAdmin();
      }
    } catch (error) {
      TradeAI.toast(
        "Admin update is unavailable in MVP preview mode. Please try again after backend/admin deployment.",
        "error",
      );
    }
  });

  [
    feedbackStatusFilter,
    feedbackPriorityFilter,
    feedbackTypeFilter,
    reportStatusFilter,
    reportPriorityFilter,
    introStatusFilter,
    introPriorityFilter,
    introRequestTypeFilter,
    introTargetTypeFilter,
  ]
    .filter(Boolean)
    .forEach((filter) => {
      filter.addEventListener("change", async () => {
        try {
          await loadFeedbackQueues();
        } catch (error) {
          renderFeedback(previewData.feedback, true);
          renderReportRequests(previewData.reportRequests, true);
          renderIntroRequests(previewData.introRequests, true);
          TradeAI.toast?.(ADMIN_PREVIEW_MESSAGE, "error");
        }
      });
    });

  window.addEventListener("DOMContentLoaded", loadAdmin);
})();
