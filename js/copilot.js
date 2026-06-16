(function () {
  const MAX_HISTORY_ITEMS = 5;

  const elements = {
    form: document.getElementById("copilotForm"),
    button: document.getElementById("ask-copilot-btn"),
    input: document.getElementById("copilotPrompt") || document.querySelector("textarea, input[type='text']"),
    loading: document.getElementById("copilot-loading"),
    response: document.getElementById("copilot-response"),
    error: document.getElementById("copilot-error"),
    errorMessage: document.getElementById("copilot-error-msg"),
    provider: document.getElementById("copilot-provider-label"),
    marketOpportunity: document.getElementById("copilot-market-opportunity"),
    buyerType: document.getElementById("copilot-buyer-type"),
    riskLevel: document.getElementById("copilot-risk-level"),
    documents: document.getElementById("copilot-documents"),
    nextActions: document.getElementById("copilot-next-actions"),
    disclaimer: document.getElementById("copilot-disclaimer"),
    status: document.getElementById("copilotStatus"),
    panelLoading: document.getElementById("copilotLoading"),
    panelError: document.getElementById("copilotError"),
    panelErrorMessage: document.getElementById("copilotErrorMessage"),
    panelResponse: document.getElementById("copilotResponse"),
    history: document.getElementById("copilotHistory"),
  };

  if (!elements.button || !elements.input) {
    return;
  }

  function setVisible(element, visible) {
    if (!element) return;
    element.hidden = !visible;
    element.style.display = visible ? "" : "none";
  }

  function getStoredUser() {
    const authUser = window.TradeAI?.auth?.getUser?.() || window.TradeAI?.state?.auth?.getUser?.();

    if (authUser?.id || authUser?._id || authUser?.userId || authUser?.email) {
      return authUser;
    }

    try {
      return JSON.parse(localStorage.getItem("tradeai_user") || "{}");
    } catch (error) {
      return {};
    }
  }

  function getCurrentUserKey() {
    const user = getStoredUser();
    const rawId = user?.id || user?._id || user?.userId || user?.email;
    const normalizedId = String(rawId || "").trim().toLowerCase();

    return normalizedId ? `tradeai_copilot_history_${normalizedId}` : "";
  }

  function getStoredContextValue(keys = []) {
    const params = new URLSearchParams(window.location.search);

    for (const key of keys) {
      const paramValue = params.get(key);

      if (paramValue) return paramValue;
    }

    for (const key of keys) {
      try {
        const storedValue = localStorage.getItem(`tradeai_selected_${key}`) || localStorage.getItem(`tradeai_${key}`);

        if (storedValue) return storedValue;
      } catch (error) {
        // Context is optional; Copilot still works without browser storage.
      }
    }

    return "";
  }

  function buildCopilotContextPayload(question) {
    return {
      question,
      productName: getStoredContextValue(["product", "productName"]),
      targetCountry: getStoredContextValue(["country", "targetCountry"]),
      hsCode: getStoredContextValue(["hsCode", "hs_code"]),
    };
  }

  function prefillReportPrompt() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("source") !== "trade-readiness" || elements.input.value.trim()) {
      return;
    }

    try {
      const prompt = localStorage.getItem("tradeai_latest_report_prompt") || "";

      if (prompt) {
        elements.input.value = prompt;
      }
    } catch (error) {
      // Prefill is optional; Copilot remains usable without storage.
    }
  }

  function getToken() {
    return window.TradeAI?.auth?.getToken?.() || "";
  }

  async function copilotRequest(path, options = {}) {
    if (!window.TradeAI?.request) {
      throw new Error("TradeAI API client is unavailable. Please refresh and login again.");
    }

    return window.TradeAI.request(`/copilot${path}`, options);
  }

  function readHistory() {
    const key = getCurrentUserKey();
    if (!key) return [];

    try {
      const items = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(items) ? items.slice(0, MAX_HISTORY_ITEMS) : [];
    } catch (error) {
      return [];
    }
  }

  function writeHistory(items) {
    const key = getCurrentUserKey();
    if (!key) return;

    try {
      localStorage.setItem(key, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
    } catch (error) {
      // History is a convenience only; Copilot should still answer if storage is blocked.
    }
  }

  function renderHistory(items = readHistory()) {
    if (!elements.history) return;

    elements.history.innerHTML = "";

    if (!items.length) {
      const card = document.createElement("article");
      card.className = "activity-card";
      const heading = document.createElement("h4");
      heading.textContent = "No Copilot history yet";
      const paragraph = document.createElement("p");
      paragraph.textContent = "No recent Copilot history yet. Ask your first trade question.";
      card.append(heading, paragraph);
      elements.history.appendChild(card);
      return;
    }

    items.forEach((item) => {
      elements.history.appendChild(createHistoryCard(item.question, item.response));
    });
  }

  function renderHistoryState(title, message) {
    if (!elements.history) return;

    elements.history.innerHTML = "";
    const card = document.createElement("article");
    card.className = "activity-card";
    const heading = document.createElement("h4");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    card.append(heading, paragraph);
    elements.history.appendChild(card);
  }

  async function loadServerHistory() {
    if (!getToken()) {
      renderHistoryState("Login required", "Please login again to view your saved Copilot history.");
      window.TradeAI?.auth?.requireAuth?.();
      return;
    }

    renderHistoryState("Loading Copilot history", "Fetching your saved Copilot conversations from TradeAI.");

    try {
      const data = await copilotRequest("/history");
      const items = (Array.isArray(data.messages) ? data.messages : [])
        .map((message) => ({
          id: message._id,
          question: message.question,
          response: message.response,
          createdAt: message.createdAt,
        }))
        .slice(0, MAX_HISTORY_ITEMS);

      writeHistory(items);
      renderHistory(items);
    } catch (error) {
      renderHistoryState("Failed to load history", "Your saved Copilot history could not load right now. Please refresh after checking your session.");
    }
  }

  function setLoading(isLoading) {
    setVisible(elements.loading, isLoading);
    setVisible(elements.panelLoading, isLoading);
    elements.button.disabled = isLoading;
    elements.button.innerHTML = isLoading
      ? '<span class="button-label">Analyzing...</span><span class="button-spinner" aria-hidden="true"></span>'
      : '<span class="button-label">Ask Copilot</span><span class="button-spinner" aria-hidden="true"></span>';
    if (elements.status) {
      elements.status.textContent = isLoading ? "Analyzing" : "Ready";
    }
  }

  function normalizeResponse(data, providerFallback) {
    return {
      providerLabel: data?.providerLabel || data?.provider || providerFallback,
      marketOpportunity: String(data?.marketOpportunity || data?.answer || "No market opportunity returned."),
      buyerType: String(data?.buyerType || "Importer, distributor or category buyer depending on corridor."),
      riskLevel: String(data?.riskLevel || "Medium: verify buyer, documents and landed cost before action."),
      documentsNeeded: Array.isArray(data?.documentsNeeded) ? data.documentsNeeded.map(String) : [],
      nextActions: Array.isArray(data?.nextActions)
        ? data.nextActions.map(String)
        : Array.isArray(data?.suggestedActions)
          ? data.suggestedActions.map(String)
          : [],
      disclaimer: String(
        data?.disclaimer ||
          "Use this as directional TradeAI guidance. Verify current regulations, buyer details and shipment costs before action.",
      ),
    };
  }

  function fillList(list, items) {
    if (!list) return;
    list.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function renderResponse(data, mode = "success") {
    const response = normalizeResponse(
      data,
      mode === "fallback" ? "TradeAI Rule Engine (offline preview)" : "TradeAI Copilot",
    );

    if (elements.provider) elements.provider.textContent = response.providerLabel;
    if (elements.marketOpportunity) elements.marketOpportunity.textContent = response.marketOpportunity;
    if (elements.buyerType) elements.buyerType.textContent = response.buyerType;
    if (elements.riskLevel) elements.riskLevel.textContent = response.riskLevel;
    fillList(elements.documents, response.documentsNeeded);
    fillList(elements.nextActions, response.nextActions);
    if (elements.disclaimer) elements.disclaimer.textContent = response.disclaimer;

    setVisible(elements.response, true);
    renderPanelResponse(response);
    if (mode === "success") {
      addHistoryItem(response);
    }

    if (elements.status) {
      elements.status.textContent = mode === "fallback" ? "Fallback" : "Answered";
    }
  }

  function renderPanelResponse(response) {
    if (!elements.panelResponse) return;
    elements.panelResponse.innerHTML = "";

    [
      ["Provider", response.providerLabel],
      ["Market Opportunity", response.marketOpportunity],
      ["Buyer Type", response.buyerType],
      ["Risk Level", response.riskLevel],
      ["Documents Needed", response.documentsNeeded.join(", ")],
      ["Next Actions", response.nextActions.join(", ")],
      ["Disclaimer", response.disclaimer],
    ].forEach(([title, body]) => {
      const card = document.createElement("article");
      card.className = "activity-card";
      const heading = document.createElement("h4");
      heading.textContent = title;
      const paragraph = document.createElement("p");
      paragraph.textContent = body || "Not available.";
      card.append(heading, paragraph);
      elements.panelResponse.appendChild(card);
    });
  }

  function createHistoryCard(question, response) {
    const safeResponse = normalizeResponse(response || {}, "TradeAI Copilot");
    const card = document.createElement("article");
    card.className = "activity-card";
    const heading = document.createElement("h4");
    heading.textContent = question || "TradeAI Copilot prompt";
    const paragraph = document.createElement("p");
    paragraph.textContent = `${safeResponse.providerLabel}: ${safeResponse.marketOpportunity}`;
    card.append(heading, paragraph);
    return card;
  }

  function addHistoryItem(response) {
    const question = elements.input.value.trim();
    if (!elements.history || !question) return;

    const nextItems = [
      {
        question,
        response,
        createdAt: new Date().toISOString(),
      },
      ...readHistory().filter((item) => item.question !== question),
    ].slice(0, MAX_HISTORY_ITEMS);

    writeHistory(nextItems);
    renderHistory(nextItems);
  }

  function showError(message) {
    const safeMessage = message || "Copilot backend is unavailable. Showing local preview guidance.";
    if (elements.errorMessage) elements.errorMessage.textContent = safeMessage;
    if (elements.panelErrorMessage) elements.panelErrorMessage.textContent = safeMessage;
    setVisible(elements.error, true);
    setVisible(elements.panelError, true);
  }

  async function askCopilot(event) {
    event?.preventDefault();

    const question = elements.input.value.trim();
    if (!question) return;

    setLoading(true);
    setVisible(elements.response, false);
    setVisible(elements.error, false);
    setVisible(elements.panelError, false);

    try {
      const data = await copilotRequest("/ask", {
        method: "POST",
        body: JSON.stringify(buildCopilotContextPayload(question)),
      });

      renderResponse(data, "success");
    } catch (error) {
      showError(error.message);
      if (elements.status) {
        elements.status.textContent = "Error";
      }
      renderHistoryState("Failed to save Copilot answer", "The authenticated Copilot request failed, so no temporary answer was saved to your backend history.");
    } finally {
      setLoading(false);
    }
  }

  elements.button.addEventListener("click", askCopilot);
  elements.form?.addEventListener("submit", askCopilot);

  document.querySelectorAll(".copilot-chip[data-prompt]").forEach((chip) => {
    chip.addEventListener("click", () => {
      elements.input.value = chip.dataset.prompt || "";
      elements.input.focus();
    });
  });

  prefillReportPrompt();
  loadServerHistory();
})();
