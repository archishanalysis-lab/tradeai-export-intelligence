(function () {
  const DEFAULT_TAB = "overview";
  const tabs = Array.from(document.querySelectorAll("[data-dashboard-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-dashboard-panel]"));

  if (!tabs.length || !panels.length) return;

  function getRequestedTab() {
    const hash = window.location.hash.replace("#", "").trim();
    return panels.some((panel) => panel.dataset.dashboardPanel === hash) ? hash : DEFAULT_TAB;
  }

  function activateTab(tabName) {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.dashboardTab === tabName;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-current", isActive ? "page" : "false");
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.dashboardPanel !== tabName;
    });
  }

  function handleHashChange() {
    activateTab(getRequestedTab());
  }

  window.addEventListener("hashchange", handleHashChange);
  handleHashChange();
})();
