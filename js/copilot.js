(function () {
  const normalizeBackendBaseUrl = (url) => {
    const cleanUrl = String(url || "").replace(/\/$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl.slice(0, -4) : cleanUrl;
  };

  const configuredApiUrl = window.TradeAI?.config?.API_URL || window.TradeAI?.API_URL;
  const configuredBackendBaseUrl =
    window.TradeAI?.config?.API_BASE_URL ||
    window.TradeAI?.API_BASE_URL ||
    window.TRADEAI_API_URL ||
    (["localhost", "127.0.0.1", ""].includes(window.location.hostname)
      ? "http://localhost:5000"
      : "https://tradeai-export-intelligence-1.onrender.com");
  const copilotApiRoot = configuredApiUrl
    ? configuredApiUrl.replace(/\/$/, "")
    : `${normalizeBackendBaseUrl(configuredBackendBaseUrl)}/api`;

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
    addHistoryItem(response);

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

  function addHistoryItem(response) {
    if (!elements.history || !elements.input.value.trim()) return;
    if (elements.history.querySelector("h4")?.textContent === "No Copilot history yet") {
      elements.history.innerHTML = "";
    }

    const card = document.createElement("article");
    card.className = "activity-card";
    const heading = document.createElement("h4");
    heading.textContent = elements.input.value.trim();
    const paragraph = document.createElement("p");
    paragraph.textContent = `${response.providerLabel}: ${response.marketOpportunity}`;
    card.append(heading, paragraph);
    elements.history.prepend(card);
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
      const token = localStorage.getItem("tradeai_token");
      const response = await fetch(`${copilotApiRoot}/copilot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question, token }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Copilot backend returned ${response.status}.`);
      }

      renderResponse(data, "success");
    } catch (error) {
      showError(error.message);
      renderResponse(getRuleBasedFallback(question), "fallback");
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

  function getRuleBasedFallback(question) {
    const q = question.toLowerCase();
    const isGulf = /uae|dubai|saudi|oman|qatar|gulf/.test(q);
    const isAfrica = /kenya|tanzania|uganda|rwanda|africa/.test(q);
    const isChina = /china|sourcing|supplier/.test(q);
    const isPharma = /pharma|medicine|drug|medical|healthcare/.test(q);
    const isRice = /rice|basmati/.test(q);
    const isTurmeric = /turmeric|spice|spices/.test(q);
    const isTextile = /textile|garment|apparel|cotton|fabric/.test(q);

    if (isGulf || isRice || isTurmeric) {
      return {
        providerLabel: "TradeAI Rule Engine (offline preview)",
        marketOpportunity:
          "Gulf markets, especially UAE, are practical first targets for Indian spices, basmati rice and processed food because of distributor depth, retail demand and re-export channels.",
        buyerType: "Food importers, supermarket suppliers, HORECA distributors, wholesale traders and re-export buyers.",
        riskLevel: "Medium: verify labeling, shelf-life, buyer payment terms and destination conformity requirements.",
        documentsNeeded: [
          "Commercial invoice",
          "Packing list",
          "Certificate of origin",
          "Health or phytosanitary certificate",
          "SASO or ECAS documents where applicable",
        ],
        nextActions: [
          "Confirm HS code and destination labeling requirements.",
          "Prepare buyer-ready product specs with MOQ and shelf life.",
          "Shortlist UAE importers and distributors by product category.",
        ],
        disclaimer:
          "Rule-based preview. Verify current GCC documentation, buyer credibility and shipment costs before action.",
      };
    }

    if (isAfrica || isTextile) {
      return {
        providerLabel: "TradeAI Rule Engine (offline preview)",
        marketOpportunity:
          "Kenya and nearby East Africa markets can suit Indian textiles and consumer goods through importers, wholesalers and regional distributors.",
        buyerType: "Importers, wholesale distributors, retail chain suppliers and category trading companies.",
        riskLevel: "Medium-high: validate buyer creditworthiness, port costs, product standards and first-order payment terms.",
        documentsNeeded: [
          "Commercial invoice",
          "Packing list",
          "Certificate of origin",
          "Bill of lading",
          "PVoC or destination conformity documents where applicable",
        ],
        nextActions: [
          "Check Kenya Bureau of Standards requirements.",
          "Confirm fabric composition, HS code and labeling details.",
          "Use LC or protected payment terms for first shipment.",
        ],
        disclaimer:
          "Rule-based preview. Confirm East Africa compliance and buyer details before quoting or shipping.",
      };
    }

    if (isPharma) {
      return {
        providerLabel: "TradeAI Rule Engine (offline preview)",
        marketOpportunity:
          "Pharma exporters from India should prioritize regulated corridors where documentation readiness, distributor licensing and product registration can be validated early.",
        buyerType: "Licensed pharma importers, hospital procurement teams, distributors and government or institutional buyers.",
        riskLevel: "High: product registration, destination health authority approval and buyer validation are critical.",
        documentsNeeded: [
          "Commercial invoice",
          "Packing list",
          "Certificate of origin",
          "Certificate of analysis",
          "Pharma product registration or health authority approval",
        ],
        nextActions: [
          "Select one target country and verify product registration pathway.",
          "Prepare dossier, COA and product specification sheets.",
          "Validate importer license and payment terms before samples or shipment.",
        ],
        disclaimer:
          "Rule-based preview. Pharma exports require current regulatory review and qualified compliance advice.",
      };
    }

    if (isChina) {
      return {
        providerLabel: "TradeAI Rule Engine (offline preview)",
        marketOpportunity:
          "China is primarily a sourcing intelligence corridor for comparing suppliers, landed cost, quality checks and import dependency risk.",
        buyerType: "Verified manufacturers, trading companies, OEM suppliers and sourcing agents.",
        riskLevel: "High: supplier verification, inspection and payment protection are important before placing orders.",
        documentsNeeded: [
          "Proforma invoice",
          "Packing list",
          "Bill of lading",
          "Import declaration",
          "Quality inspection certificate",
        ],
        nextActions: [
          "Compare at least three suppliers by MOQ, certification and delivery terms.",
          "Request samples or third-party inspection.",
          "Calculate landed cost including duty, freight and insurance.",
        ],
        disclaimer:
          "Rule-based preview. Independently verify suppliers, product quality and import requirements.",
      };
    }

    return {
      providerLabel: "TradeAI Rule Engine (offline preview)",
      marketOpportunity:
        "TradeAI covers East Africa, Gulf and China sourcing corridors. Pick the product and target country, then compare buyer type, documents and landed cost.",
      buyerType: "Importers, distributors, institutional buyers or sourcing suppliers depending on corridor.",
      riskLevel: "Medium: main risks are unclear HS code, missing documents, weak buyer validation and untested landed cost.",
      documentsNeeded: ["Commercial invoice", "Packing list", "Certificate of origin", "Bill of lading", "HS code confirmation"],
      nextActions: [
        "Specify target country and product category.",
        "Confirm HS code and destination documents.",
        "Prepare a buyer outreach list and export-readiness checklist.",
      ],
      disclaimer:
        "Rule-based preview. Type a target country such as UAE, Kenya or China for more specific guidance.",
    };
  }
})();
