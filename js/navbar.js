/* =========================================================
   TRADEAI NAVBAR SYSTEM
========================================================= */

(function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const header = document.querySelector(".header");
  let scrollTicking = false;

  function getPageName(pathOrHref) {
    return (pathOrHref || "")
      .split("?")[0]
      .split("#")[0]
      .split("/")
      .filter(Boolean)
      .pop() || "index.html";
  }

  function isPagesPath(pathname) {
    return pathname.split("/").filter(Boolean).includes("pages");
  }

  const isInsidePages = isPagesPath(window.location.pathname);
  const pagePrefix = isInsidePages ? "" : "pages/";
  const homePath = isInsidePages ? "../index.html" : "index.html";
  const assetPrefix = isInsidePages ? "../" : "";

  const routeMap = {
    home: homePath,
    features: isInsidePages ? "../index.html#features" : "#features",
    search: `${pagePrefix}search-result.html`,
    dashboard: `${pagePrefix}explorer-dashboard.html`,
    pricing: `${pagePrefix}pricing.html`,
    contact: `${pagePrefix}contact.html`,
    about: `${pagePrefix}about.html`,
    login: `${pagePrefix}login.html`,
    register: `${pagePrefix}register.html`,
    buyers: `${pagePrefix}buyer-detail.html`,
    "buyer finder": `${pagePrefix}buyer-detail.html`,
    "ai buyer discovery": `${pagePrefix}buyer-detail.html`,
    leads: `${pagePrefix}buyer-detail.html`,
    outreach: `${pagePrefix}buyer-detail.html`,
    "supplier finder": `${pagePrefix}importer-dashboard.html`,
    rfqs: `${pagePrefix}importer-dashboard.html`,
    "price comparison": `${pagePrefix}importer-dashboard.html`,
    compliance: `${pagePrefix}importer-dashboard.html`,
    tariffs: `${pagePrefix}hs-code-detail.html`,
    "hs code intelligence": `${pagePrefix}hs-code-detail.html`,
    "hs code details": `${pagePrefix}hs-code-detail.html`,
    "country analysis": `${pagePrefix}hs-code-detail.html`,
    "ai insights": `${pagePrefix}market-analysis.html`,
    "trade analytics": `${pagePrefix}market-analysis.html`,
    "market analysis": `${pagePrefix}market-analysis.html`,
    reports: `${pagePrefix}export-opportunity-report.html`,
    documents: `${pagePrefix}help-centre.html`,
    shipments: `${pagePrefix}explorer-dashboard.html`,
    "saved markets": `${pagePrefix}saved-search.html`,
    "saved searches": `${pagePrefix}saved-search.html`,
    notifications: `${pagePrefix}notification.html`,
    settings: `${pagePrefix}setting.html`,
    profile: `${pagePrefix}company-profile.html`,
    security: `${pagePrefix}setting.html`,
    billing: `${pagePrefix}setting.html`,
    "api access": `${pagePrefix}setting.html`,
    "privacy policy": `${pagePrefix}privacy-policy.html`,
    "terms & conditions": `${pagePrefix}terms-and-conditions.html`,
  };

  function ensureBrandIcons() {
    const iconHref = `${assetPrefix}logo.svg`;
    const iconDefinitions = [
      { rel: "icon", type: "image/svg+xml", href: iconHref },
      { rel: "apple-touch-icon", href: iconHref },
    ];

    iconDefinitions.forEach((definition) => {
      if (document.head.querySelector(`link[rel="${definition.rel}"]`)) return;

      const link = document.createElement("link");
      Object.entries(definition).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      document.head.appendChild(link);
    });
  }

  function closeMobileMenu() {
    mobileMenu?.classList.remove("active");
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileMenu?.setAttribute("aria-hidden", "true");
  }

  function openOrCloseMobileMenu() {
    if (!mobileMenu || !menuToggle) return;

    mobileMenu.classList.toggle("active");

    const isOpen = mobileMenu.classList.contains("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  }

  function updateStickyHeader() {
    if (!header) return;

    header.classList.toggle("header--scrolled", window.scrollY > 50);
  }

  function scheduleStickyHeaderUpdate() {
    if (scrollTicking) return;

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateStickyHeader();
      scrollTicking = false;
    });
  }

  function resolveRouteForLink(link) {
    const route = link.dataset.route;

    if (route && routeMap[route]) {
      return routeMap[route];
    }

    const label = link.textContent.trim().toLowerCase();
    return routeMap[label];
  }

  function applyRouteFixes() {
    document
      .querySelectorAll(
        `
        .nav a,
        .mobile-menu a,
        .sidebar-menu a,
        .footer a
        `,
      )
      .forEach((link) => {
        const href = link.getAttribute("href");
        const resolvedRoute = resolveRouteForLink(link);

        if ((href === "#" || !href) && resolvedRoute) {
          link.setAttribute("href", resolvedRoute);
        }
      });
  }

  function bindFeatureCardButtons() {
    document.querySelectorAll(".feature-grid .feature-card").forEach((card) => {
      const title = card.querySelector("h3")?.textContent.trim().toLowerCase();
      const button = card.querySelector("button");
      const href = title ? routeMap[title] : null;

      if (!button || !href || button.dataset.navbarBound === "true") return;

      button.type = button.type || "button";
      button.dataset.navbarBound = "true";
      button.addEventListener("click", (event) => {
        if (event.defaultPrevented) return;

        window.location.href = href;
      });
    });
  }

  function applyActiveNavigation() {
    const currentPageName = getPageName(window.location.pathname);

    document.querySelectorAll(".nav a, .mobile-menu a").forEach((link) => {
      const href = link.getAttribute("href");

      if (!href) return;

      const pageName = getPageName(href);
      link.classList.toggle("active", currentPageName === pageName);
    });

    document.querySelectorAll(".sidebar-menu a, .sidebar-nav a").forEach((link) => {
      const href = link.getAttribute("href");

      if (!href) return;

      link.classList.toggle("active", currentPageName === getPageName(href));
    });
  }

  function bindSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function handleAnchorClick(event) {
        const targetId = this.getAttribute("href");

        if (!targetId || targetId.length <= 1) return;

        const target = document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        const offset = header?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: "smooth",
        });
      });
    });
  }

  if (menuToggle && mobileMenu) {
    menuToggle.setAttribute(
      "aria-expanded",
      menuToggle.getAttribute("aria-expanded") || "false",
    );
    menuToggle.setAttribute(
      "aria-controls",
      menuToggle.getAttribute("aria-controls") || mobileMenu.id || "mobileMenu",
    );
    mobileMenu.setAttribute("aria-hidden", mobileMenu.getAttribute("aria-hidden") || "true");
    mobileMenu.setAttribute("role", mobileMenu.getAttribute("role") || "navigation");

    menuToggle.addEventListener("click", openOrCloseMobileMenu);
  }

  document
    .querySelectorAll(".mobile-menu a, .mobile-menu button")
    .forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

  document.addEventListener("click", (event) => {
    if (!mobileMenu?.classList.contains("active")) return;
    if (mobileMenu.contains(event.target) || menuToggle?.contains(event.target)) return;

    closeMobileMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu?.classList.contains("active")) {
      closeMobileMenu();
    }
  });

  window.addEventListener("scroll", scheduleStickyHeaderUpdate, { passive: true });

  updateStickyHeader();
  ensureBrandIcons();
  applyRouteFixes();
  bindFeatureCardButtons();
  applyActiveNavigation();
  bindSmoothScroll();
})();
