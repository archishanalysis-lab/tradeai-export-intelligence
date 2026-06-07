/* =========================================================
   TRADEAI DASHBOARD SYSTEM
   FINAL STABLE VERSION
========================================================= */

/* =========================================================
   ELEMENTS
========================================================= */

const analyticsContainer =
  document.getElementById(
    "analyticsContainer",
  );

const notificationContainer =
  document.getElementById(
    "notificationContainer",
  );

const activityContainer =
  document.getElementById(
    "activityContainer",
  );

const dashboardSearch =
  document.getElementById(
    "dashboardSearch",
  );

const dashboardSearchForm =
  document.getElementById(
    "dashboardSearchForm",
  );

const dashboardClock =
  document.getElementById(
    "dashboardClock",
  );

const dashboardDate =
  document.getElementById(
    "dashboardDate",
  );

const tradeChart =
  document.getElementById(
    "tradeChart",
  );

/* =========================================================
   ANALYTICS DATA
========================================================= */

const analyticsData = [

  {
    title:
      "Demo Preview: Active Corridors",

    value:
      "3",

    growth:
      "Sample Data",
  },

  {
    title:
      "Demo Preview: Buyer Matches",

    value:
      "128",

    growth:
      "Sample Data",
  },

  {
    title:
      "Demo Preview: Supplier Matches",

    value:
      "76",

    growth:
      "Sample Data",
  },

  {
    title:
      "Demo Preview: Market Score",

    value:
      "82/100",

    growth:
      "Sample Data",
  },

];

/* =========================================================
   NOTIFICATION DATA
========================================================= */

const notificationData = [

  {
    title:
      "Backend data will appear after deployment",

    message:
      "Dashboard cards currently use demo preview signals for stakeholder review.",
  },

  {
    title:
      "Demo Preview: Compliance Alert",

    message:
      "Upload GST, IEC and business certificates to improve buyer trust.",
  },

  {
    title:
      "Demo Preview: AI Recommendation",

    message:
      "Premium plans unlock deeper buyer discovery workflows and usage history.",
  },

];

/* =========================================================
   ACTIVITY DATA
========================================================= */

const activityData = [

  "Sample Data: Saved search for UAE importers.",

  "Sample Data: Generated AI market analysis report.",

  "Sample Data: Buyer profile exported successfully.",

  "Sample Data: New HS code intelligence downloaded.",

];

/* =========================================================
   RENDER ANALYTICS
========================================================= */

function renderAnalytics() {

  if (!analyticsContainer)
    return;

  analyticsContainer.innerHTML =
    "";

  analyticsData.forEach(
    (item) => {

      analyticsContainer.innerHTML += `

        <article class="analytics-card">

          <h3>
            ${item.title}
          </h3>

          <div class="summary-card">

            <h2>
              ${item.value}
            </h2>

            <span class="status-badge status-active">
              ${item.growth}
            </span>

          </div>

        </article>

      `;

    },
  );

}

/* =========================================================
   RENDER NOTIFICATIONS
========================================================= */

function renderNotifications() {

  if (
    !notificationContainer
  )
    return;

  notificationContainer.innerHTML =
    "";

  notificationData.forEach(
    (item) => {

      notificationContainer.innerHTML += `

        <article class="notification-card">

          <h4>
            ${item.title}
          </h4>

          <p>
            ${item.message}
          </p>

        </article>

      `;

    },
  );

}

/* =========================================================
   RENDER ACTIVITIES
========================================================= */

function renderActivities() {

  if (!activityContainer)
    return;

  activityContainer.innerHTML =
    "";

  activityData.forEach(
    (activity) => {

      activityContainer.innerHTML += `

        <article class="activity-card">

          <h4>
            ${activity}
          </h4>

          <p>
            AI system updated this activity.
          </p>

        </article>

      `;

    },
  );

}

/* =========================================================
   DASHBOARD PERSONALIZATION
========================================================= */

function renderDashboardPersonalization() {

  if (!dashboardSearchForm)
    return;

  const storageKeys = {
    plan:
      "tradeai_selected_plan",
    billing:
      "tradeai_selected_billing",
    source:
      "tradeai_signup_source",
    intent:
      "tradeai_signup_intent",
    country:
      "tradeai_selected_country",
    product:
      "tradeai_selected_product",
    reportType:
      "tradeai_selected_report_type",
  };

  const values = {};

  Object.keys(storageKeys).forEach((key) => {

    try {

      values[key] =
        localStorage
          .getItem(storageKeys[key])
          ?.trim() || "";

    } catch (error) {

      values[key] =
        "";

    }

  });

  const hasContext =
    Object.values(values).some(Boolean);

  if (!hasContext)
    return;

  const existingCard =
    document.getElementById(
      "dashboardPersonalizationCard",
    );

  if (existingCard) {

    existingCard.remove();

  }

  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const contextRows = [
    [
      "Country / Corridor",
      values.country,
    ],
    [
      "Product / Category",
      values.product,
    ],
    [
      "Intent",
      values.intent,
    ],
    [
      "Plan",
      values.plan,
    ],
    [
      "Billing",
      values.billing,
    ],
    [
      "Source",
      values.source,
    ],
  ]
    .filter((row) => row[1])
    .map(
      (row) => `
        <div class="summary-card">
          <span>${escapeHtml(row[0])}</span>
          <h3>${escapeHtml(row[1])}</h3>
        </div>
      `,
    )
    .join("");

  const card =
    document.createElement(
      "section",
    );

  card.id =
    "dashboardPersonalizationCard";

  card.className =
    "dashboard-section";

  card.innerHTML = `
    <div class="section-header">
      <h2>Continue your TradeAI journey</h2>
    </div>

    <div class="analytics-grid">
      ${contextRows}
    </div>

    <div class="quick-actions">
      <a class="quick-action" href="export-opportunity-report.html">
        <i class="fa-solid fa-file-lines" aria-hidden="true"></i>
        Generate opportunity report
      </a>

      <a class="quick-action" href="buyer-detail.html">
        <i class="fa-solid fa-users" aria-hidden="true"></i>
        Explore buyer leads
      </a>

      <a class="quick-action" href="hs-code-detail.html">
        <i class="fa-solid fa-barcode" aria-hidden="true"></i>
        Check HS code
      </a>

      <a class="quick-action" href="contact.html">
        <i class="fa-solid fa-clipboard-check" aria-hidden="true"></i>
        Review documents
      </a>
    </div>
  `;

  dashboardSearchForm.insertAdjacentElement(
    "afterend",
    card,
  );

}

/* =========================================================
   MVP REVIEW DASHBOARD PREVIEW
========================================================= */

function renderMvpDashboardPreview() {

  const page =
    window.location.pathname
      .split("/")
      .pop()
      .replace(".html", "");

  const previewMap = {
    "explorer-dashboard": {
      title: "MVP Preview: Explorer intelligence workspace",
      subtitle:
        "Sample data is shown for stakeholder review. Live metrics will appear after backend deployment.",
      cards: [
        ["Active trade corridors", "India to UAE, Kenya and Saudi Arabia are shown as sample discovery lanes."],
        ["Market opportunities", "Agri exports, light engineering and packaged foods are preview opportunity themes."],
        ["Saved searches", "Sample saved filters cover buyers, HS codes and country corridors."],
        ["AI recommendations", "AI guidance will rank country, buyer and product-fit signals when live data is connected."],
        ["Buyer/supplier discovery", "Preview cards connect explorers to importer, supplier and product marketplace flows."],
        ["Export opportunity score", "Sample score: 82/100 based on demand, competition and readiness signals."],
      ],
      actions: [
        ["Explore suppliers", "suppliers.html"],
        ["View product opportunities", "products.html"],
        ["Explore importers", "importers.html"],
        ["Request intro", "companies.html"],
        ["Generate export opportunity report", "export-opportunity-report.html"],
        ["Contact founder", "contact.html?interest=walkthrough&source=explorer-dashboard"],
      ],
      introRequests: [
        ["Sample request status", "Supplier intro request - backend-connected tracking will appear after login/deployment."],
        ["Next useful action", "Open suppliers or importers, choose Request Intro, and submit the marketplace form."],
      ],
    },
    "export-dash": {
      title: "MVP Preview: Exporter operating workspace",
      subtitle:
        "Dashboard is running in MVP preview mode when backend/user data is unavailable. Connect backend to view real exporter activity.",
      cards: [
        ["Product readiness", "Sample products show HS code, MOQ, price and approval readiness."],
        ["Buyer matches", "Preview match cards explain how AI will score buyer fit by product and corridor."],
        ["Inquiry pipeline", "Sample inquiries show quoted, follow-up and documentation statuses."],
        ["Export opportunity reports", "Report CTA helps stakeholders review corridor and product potential."],
        ["Compliance checklist", "GST, IEC, catalog and country-specific documentation reminders are previewed."],
        ["Suggested next actions", "Add product, explore buyers, review report and request walkthrough."],
      ],
      actions: [
        ["View buyer matches", "importers.html"],
        ["Request buyer intro", "importers.html"],
        ["Generate export report", "export-opportunity-report.html"],
        ["Add product", "product-upload.html"],
        ["Review compliance checklist", "contact.html?interest=compliance-checklist&source=export-dashboard"],
      ],
      introRequests: [
        ["Sample request status", "Buyer intro request - admin review states will appear here after backend/login deployment."],
        ["Next useful action", "Explore importers, request buyer intro, then use the export report to prepare outreach."],
      ],
    },
    "importer-dashboard": {
      title: "MVP Preview: Importer sourcing workspace",
      subtitle:
        "Supplier and product discovery are shown with sample data until backend preferences and request history are connected.",
      cards: [
        ["Supplier discovery", "Explore verified supplier profiles, countries, categories and readiness signals."],
        ["Product opportunities", "Review product marketplace cards by category, HS code and origin country."],
        ["Saved company flow", "Saved companies will appear after login/backend deployment; preview links show the intended path."],
        ["Supplier intro requests", "Request-intro actions send supplier/product context to admin review when backend is available."],
        ["Risk and documentation", "Use founder walkthrough and checklist support for supplier verification before outreach."],
        ["Sourcing next actions", "Explore suppliers, compare products, save companies and request intro review."],
      ],
      actions: [
        ["Explore suppliers", "suppliers.html"],
        ["Request supplier intro", "suppliers.html"],
        ["View product opportunities", "products.html"],
        ["Save company", "companies.html"],
        ["Contact founder", "contact.html?interest=walkthrough&source=importer-dashboard"],
      ],
      introRequests: [
        ["Sample request status", "Supplier intro request - backend-connected tracking will appear after login/deployment."],
        ["Next useful action", "Open suppliers, choose a profile, and submit Request Intro for admin review."],
      ],
    },
  };

  const preview =
    previewMap[page];

  if (!preview || document.getElementById("dashboardMvpPreview"))
    return;

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const cardMarkup =
    preview.cards
      .map(
        ([title, text]) => `
          <article class="tool-card">
            <span class="status-pill">MVP Preview</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(text)}</p>
          </article>
        `,
      )
      .join("");

  const actionMarkup =
    preview.actions
      .map(
        ([label, href]) => `
          <a class="quick-action" href="${escapeHtml(href)}">
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            ${escapeHtml(label)}
          </a>
        `,
      )
      .join("");

  const introMarkup =
    (preview.introRequests || [])
      .map(
        ([title, text]) => `
          <article class="activity-card">
            <h4>${escapeHtml(title)}</h4>
            <p>${escapeHtml(text)}</p>
          </article>
        `,
      )
      .join("");

  const section =
    document.createElement("section");

  section.id =
    "dashboardMvpPreview";

  section.className =
    "dashboard-section";

  section.innerHTML = `
    <div class="section-heading">
      <span class="section-kicker">Demo Preview</span>
      <h2>${escapeHtml(preview.title)}</h2>
      <p>${escapeHtml(preview.subtitle)}</p>
    </div>
    <div class="tool-grid">
      ${cardMarkup}
    </div>
    <div class="quick-actions">
      ${actionMarkup}
    </div>
    <div class="dashboard-section">
      <div class="section-heading">
        <h2>Recent intro requests</h2>
        <p>Backend-connected request tracking will appear after login/deployment.</p>
      </div>
      <div class="activity-grid">
        ${introMarkup}
      </div>
    </div>
  `;

  const insertAfter =
    dashboardSearchForm ||
    document.querySelector(".dashboard-hero");

  insertAfter?.insertAdjacentElement(
    "afterend",
    section,
  );

}

/* =========================================================
   SEARCH FILTER
========================================================= */

function setupSearchFilter() {

  if (!dashboardSearch)
    return;

  if (dashboardSearchForm) {

    dashboardSearchForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        const query =
          dashboardSearch.value.trim();

        const target =
          query
            ? `search-result.html?q=${encodeURIComponent(query)}`
            : "search-result.html";

        window.location.href =
          target;

      },
    );

  }

  dashboardSearch.addEventListener(
    "keyup",
    (e) => {

      const value =
        e.target.value.toLowerCase();

      const cards =
        document.querySelectorAll(
          `
          .feature-card,
          .analytics-card,
          .notification-card,
          .activity-card
          `,
        );

      cards.forEach((card) => {

        const text =
          card.textContent.toLowerCase();

        if (
          text.includes(value)
        ) {

          card.style.display =
            "block";

        } else {

          card.style.display =
            "none";

        }

      });

    },
  );

}

/* =========================================================
   LIVE CLOCK
========================================================= */

function updateClock() {

  if (!dashboardClock)
    return;

  const now =
    new Date();

  dashboardClock.textContent =
    now.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );

}

/* =========================================================
   LIVE DATE
========================================================= */

function updateDate() {

  if (!dashboardDate)
    return;

  const now =
    new Date();

  dashboardDate.textContent =
    now.toLocaleDateString(
      [],
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

}

/* =========================================================
   COUNTER ANIMATION
========================================================= */

function animateCounters() {

  const counters =
    document.querySelectorAll(
      ".stat-number",
    );

  if (!counters.length)
    return;

  counters.forEach((counter) => {

    const target =
      Number(
        counter.getAttribute(
          "data-target",
        ),
      );

    if (isNaN(target))
      return;

    let count = 0;

    const increment =
      Math.ceil(target / 80);

    function updateCounter() {

      count += increment;

      if (
        count >= target
      ) {

        counter.innerText =
          target;

      } else {

        counter.innerText =
          count;

        requestAnimationFrame(
          updateCounter,
        );

      }

    }

    updateCounter();

  });

}

/* =========================================================
   LIGHTWEIGHT CANVAS CHART
========================================================= */

function renderTradeChart() {

  if (!tradeChart)
    return;

  const chartCard =
    tradeChart.closest(
      ".chart-card",
    );

  tradeChart.setAttribute(
    "aria-busy",
    "true",
  );

  const context =
    tradeChart.getContext("2d");

  if (!context) {

    chartCard
      ?.querySelector(
        ".chart-error",
      )
      ?.remove();

    if (chartCard) {

      chartCard.insertAdjacentHTML(
        "beforeend",
        '<p class="chart-error" role="alert">Chart preview could not load.</p>',
      );

    }

    tradeChart.setAttribute(
      "aria-busy",
      "false",
    );

    return;

  }

  const values =
    [42, 58, 51, 76, 68, 84];

  const labels =
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const width =
    tradeChart.width =
      tradeChart.clientWidth || 640;

  const height =
    tradeChart.height =
      260;

  context.clearRect(0, 0, width, height);
  context.strokeStyle = "rgba(148, 163, 184, 0.22)";
  context.lineWidth = 1;

  for (let i = 0; i < 4; i += 1) {
    const y = 30 + i * 52;
    context.beginPath();
    context.moveTo(36, y);
    context.lineTo(width - 24, y);
    context.stroke();
  }

  const max = Math.max(...values);
  const step = (width - 80) / (values.length - 1);

  context.beginPath();
  values.forEach((value, index) => {
    const x = 42 + index * step;
    const y = height - 44 - (value / max) * 172;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.strokeStyle = "#38bdf8";
  context.lineWidth = 3;
  context.stroke();

  context.fillStyle = "#aeb4bf";
  context.font = "12px Inter, sans-serif";
  labels.forEach((label, index) => {
    context.fillText(label, 34 + index * step, height - 16);
  });

  tradeChart.setAttribute(
    "aria-busy",
    "false",
  );

}

/* =========================================================
   REAL ACCOUNT SUMMARY
========================================================= */

function escapeDashboardHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

async function renderAccountSummary() {

  const welcomeTitle =
    document.getElementById("dashboardWelcomeTitle");
  const planSummary =
    document.getElementById("dashboardPlanSummary");
  const recentReports =
    document.getElementById("dashboardRecentReports");

  if (!welcomeTitle && !planSummary && !recentReports)
    return;

  const user =
    window.TradeAI?.auth?.getUser?.() || {};

  if (welcomeTitle) {
    welcomeTitle.textContent =
      `Welcome back${user.name ? `, ${user.name}` : ""}`;
  }

  try {
    const [billing, reports] =
      await Promise.all([
        window.TradeAI?.api?.billing?.status?.().catch(() => null),
        window.TradeAI?.api?.reports?.list?.().catch(() => ({ reports: [] })),
      ]);

    if (planSummary) {
      const planName =
        billing?.planDetails?.name || billing?.plan || "Free";
      const credits =
        billing?.planDetails?.aiCredits;

      planSummary.textContent =
        `${planName} plan${Number.isFinite(credits) ? ` - ${credits} report credits available in this plan` : ""}.`;
    }

    if (recentReports) {
      const items =
        reports?.reports || [];

      if (!items.length) {
        recentReports.innerHTML = `
          <article class="activity-card">
            <h4>No saved reports yet</h4>
            <p>Create one export opportunity report to get a real saved result in this dashboard.</p>
            <div class="table-actions">
              <a class="secondary" href="#reports">Create report</a>
              <a class="secondary" href="export-opportunity-report.html">Use guided report page</a>
            </div>
          </article>
        `;
        return;
      }

      recentReports.innerHTML =
        items.slice(0, 3)
          .map((report) => `
            <article class="activity-card">
              <h4>${escapeDashboardHtml(report.title)}</h4>
              <p>${escapeDashboardHtml((report.reportType || "report").replace(/_/g, " "))}</p>
              <p class="table-subtext">${new Date(report.createdAt).toLocaleDateString()}</p>
              <a class="secondary" href="#reports">Open reports</a>
            </article>
          `)
          .join("");
    }
  } catch (error) {
    if (planSummary) {
      planSummary.textContent =
        "Dashboard is connected to backend APIs. Account summary could not load right now.";
    }
  }

}

/* =========================================================
   DASHBOARD INIT
========================================================= */

function initializeDashboard() {

  renderDashboardPersonalization();

  renderMvpDashboardPreview();

  renderAccountSummary();

  renderAnalytics();

  renderNotifications();

  renderActivities();

  setupSearchFilter();

  updateClock();

  updateDate();

  animateCounters();

  renderTradeChart();

  setInterval(
    updateClock,
    1000,
  );

  window.addEventListener("resize", renderTradeChart);

}

/* =========================================================
   PAGE CHECK
========================================================= */

window.addEventListener(
  "DOMContentLoaded",
  () => {

    if (

      analyticsContainer ||

      notificationContainer ||

      activityContainer ||

      dashboardSearch ||

      dashboardClock ||

      dashboardDate

    ) {

      initializeDashboard();

    }

  },
);

