/* =========================================================
   TRADEAI THEME SYSTEM
========================================================= */

(function () {
  const THEME_KEY = "tradeai_theme";
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeStorage = window.TradeAI?.storage;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  if (!themeStorage) {
    console.error("theme.js: TradeAI.storage is required but not loaded.");
    return;
  }

  function getStoredTheme() {
    const theme = themeStorage.get(THEME_KEY);
    return theme === "light" || theme === "dark" ? theme : null;
  }

  function getCurrentTheme() {
    return root.classList.contains("light-theme") ? "light" : "dark";
  }

  function updateThemeIcon(mode) {
    if (!themeToggle) return;

    let icon = themeToggle.querySelector("i");

    if (!icon) {
      icon = document.createElement("i");
      icon.setAttribute("aria-hidden", "true");
      themeToggle.appendChild(icon);
    }

    icon.className = mode === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    themeToggle.setAttribute(
      "aria-label",
      mode === "light" ? "Switch to dark mode" : "Switch to light mode",
    );
  }

  function updateMetaTheme(mode) {
    let metaTheme = document.querySelector('meta[name="theme-color"]');

    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.setAttribute("name", "theme-color");
      document.head.appendChild(metaTheme);
    }

    metaTheme.setAttribute("content", mode === "light" ? "#f4f7fb" : "#06101f");
  }

  function applyTheme(mode) {
    const normalizedMode = mode === "light" ? "light" : "dark";

    root.classList.toggle("light-theme", normalizedMode === "light");
    document.body?.classList.toggle("light-theme", normalizedMode === "light");
    updateThemeIcon(normalizedMode);
    updateMetaTheme(normalizedMode);

    window.dispatchEvent(
      new CustomEvent("tradeai:theme-change", {
        detail: { theme: normalizedMode },
      }),
    );
  }

  function saveTheme(mode) {
    themeStorage.set(THEME_KEY, mode);
  }

  function setTheme(mode) {
    const normalizedMode = mode === "light" ? "light" : "dark";

    applyTheme(normalizedMode);
    saveTheme(normalizedMode);
  }

  function toggleTheme() {
    setTheme(getCurrentTheme() === "light" ? "dark" : "light");
  }

  function applyInitialTheme() {
    const storedTheme = getStoredTheme();

    if (storedTheme) {
      applyTheme(storedTheme);
      return;
    }

    applyTheme(systemTheme.matches ? "dark" : "light");
  }

  applyInitialTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  systemTheme.addEventListener("change", (event) => {
    if (getStoredTheme()) return;

    applyTheme(event.matches ? "dark" : "light");
  });

  document.addEventListener("keydown", (event) => {
    if (event.altKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === "t") {
      event.preventDefault();
      toggleTheme();
    }
  });

  window.TradeAI = window.TradeAI || {};
  window.TradeAI.theme = {
    applyTheme,
    getCurrentTheme,
    setTheme,
    toggleTheme,
  };
})();
