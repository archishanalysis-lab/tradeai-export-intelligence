(function () {
  const form = document.getElementById("copilotForm");
  const prompt = document.getElementById("copilotPrompt");
  const response = document.getElementById("copilotResponse");
  const history = document.getElementById("copilotHistory");
  const loadingState = document.getElementById("copilotLoading");
  const errorState = document.getElementById("copilotError");
  const errorMessage = document.getElementById("copilotErrorMessage");
  const statusBadge = document.getElementById("copilotStatus");
  const submitButton = document.getElementById("copilotSubmit");
  const submitLabel = submitButton?.querySelector(".button-label");

  if (!form || !prompt || !response || !window.TradeAI) return;

  const promptHints = [
    "best markets for turmeric from India",
    "Find UAE buyers for Indian spices",
    "Recommend HS codes for cotton T-shirts",
    "Create a buyer outreach plan for Kenya",
  ];

  const sessionHistory = [];
  let hintIndex = 0;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getAuthToken() {
    function readStorage(storage, key) {
      try {
        return storage.getItem(key);
      } catch (error) {
        return "";
      }
    }

    return (
      window.TradeAI?.auth?.getToken?.() ||
      readStorage(window.localStorage, "tradeai_token") ||
      readStorage(window.sessionStorage, "tradeai_token") ||
      ""
    );
  }

  function setStatus(label, tone = "") {
    if (!statusBadge) return;
    statusBadge.textContent = label;
    statusBadge.className = `status-badge ${tone}`.trim();
  }

  function setLoading(isLoading) {
    response.setAttribute("aria-busy", String(isLoading));
    if (loadingState) loadingState.hidden = !isLoading;

    if (!submitButton) return;

    submitButton.disabled = isLoading;

    if (submitLabel) {
      submitLabel.textContent = isLoading ? "Thinking..." : "Ask Copilot";
    }
  }

  function normalizeAnswer(data) {
    if (typeof data === "string") {
      return { answer: data };
    }

    return {
      answer:
        data?.answer ||
        data?.response ||
        data?.message ||
        "Copilot returned a response, but no answer text was provided.",
      provider: data?.provider || data?.source || "TradeAI Copilot",
      suggestedActions: Array.isArray(data?.suggestedActions)
        ? data.suggestedActions
        : Array.isArray(data?.actions)
          ? data.actions
          : [],
      checklist: Array.isArray(data?.checklist) ? data.checklist : [],
      isFallback: Boolean(data?.isFallback),
    };
  }

  function turmericFallback() {
    return {
      isFallback: true,
      provider: "DEMO FALLBACK",
      answer:
        "For turmeric exports from India, good MVP-review target markets are UAE, Saudi Arabia, Kenya, Qatar and Oman. UAE is useful for premium retail and re-export routes, Saudi Arabia and Qatar are attractive for food-service and packaged spice demand, while Kenya can be a practical East Africa entry corridor. Treat this as sample guidance until live market, buyer and compliance data are connected.",
      suggestedActions: [
        "Compare UAE and Saudi Arabia first for premium packaged turmeric demand.",
        "Validate HS code 0910 and product form before quoting.",
        "Prepare buyer-ready specs: curcumin percentage, packaging, certifications and MOQ.",
        "Use Buyer Discovery to shortlist importer, distributor and food-service segments.",
      ],
      checklist: [
        "Confirm turmeric format: whole, powder, organic or extract.",
        "Check destination labeling and residue requirements.",
        "Compare landed cost, shelf life and buyer MOQ expectations.",
      ],
    };
  }

  function genericFallback(question) {
    if (/turmeric|haldi/i.test(question)) {
      return turmericFallback();
    }

    return {
      isFallback: true,
      provider: "DEMO FALLBACK",
      answer:
        "TradeAI Copilot is running in MVP fallback mode. A practical next step is to define the product, target country, buyer type, HS-code range and compliance risk, then compare two corridors before outreach. Live AI recommendations will become more specific once the backend Copilot service is available.",
      suggestedActions: [
        "Choose one product and two target countries.",
        "Review buyer segments before requesting introductions.",
        "Generate an export opportunity report for a structured next-step plan.",
      ],
      checklist: [
        "Product name and specs are clear.",
        "Target market and buyer type are selected.",
        "Compliance and document risks are noted.",
      ],
    };
  }

  function renderList(title, items) {
    if (!items.length) return "";

    return `
      <div class="copilot-list-block">
        <h5>${escapeHtml(title)}</h5>
        <ul>
          ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  function renderAnswer(question, data) {
    const answer = normalizeAnswer(data);
    const fallbackBadge = answer.isFallback
      ? `<span class="status-badge status-pending">FALLBACK DEMO</span>`
      : `<span class="status-badge status-active">LIVE RESPONSE</span>`;

    response.innerHTML = `
      <article class="activity-card copilot-answer-card">
        <div class="copilot-answer-header">
          <h4>Copilot response</h4>
          ${fallbackBadge}
        </div>
        <p class="table-subtext"><strong>Prompt:</strong> ${escapeHtml(question)}</p>
        <p>${escapeHtml(answer.answer)}</p>
        ${renderList("Suggested next actions", answer.suggestedActions)}
        ${renderList("Readiness checklist", answer.checklist)}
        <p class="table-subtext">Provider: ${escapeHtml(answer.provider)}</p>
      </article>
    `;

    setStatus(answer.isFallback ? "Fallback demo" : "Answered", answer.isFallback ? "status-pending" : "status-active");
    addHistory(question, answer);
  }

  function renderError(message) {
    if (errorState) errorState.hidden = false;
    if (errorMessage) {
      errorMessage.textContent = message;
    }
    setStatus("Fallback mode", "status-pending");
  }

  function addHistory(question, answer) {
    sessionHistory.unshift({
      question,
      answer: answer.answer,
      fallback: answer.isFallback,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    sessionHistory.splice(5);
    renderHistory();
  }

  function renderHistory() {
    if (!history) return;

    history.innerHTML = sessionHistory
      .map(
        (item) => `
          <article class="activity-card">
            <h4>${escapeHtml(item.question)}</h4>
            <p>${escapeHtml(item.answer).slice(0, 180)}${item.answer.length > 180 ? "..." : ""}</p>
            <p class="table-subtext">${escapeHtml(item.time)}${item.fallback ? " · fallback demo" : " · backend response"}</p>
          </article>
        `,
      )
      .join("");
  }

  async function askCopilot(question) {
    const token = getAuthToken();

    return TradeAI.request("/copilot/ask", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ prompt: question }),
    });
  }

  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      prompt.value = button.dataset.prompt || "";
      prompt.focus();
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!TradeAI.auth.requireAuth()) return;

    const question = prompt.value.trim();

    if (!question) {
      renderError("Please enter a trade question before asking Copilot.");
      prompt.focus();
      return;
    }

    try {
      setLoading(true);
      if (errorState) errorState.hidden = true;
      setStatus("Thinking", "status-pending");

      const data = await askCopilot(question);
      renderAnswer(question, data);
    } catch (error) {
      const fallback = genericFallback(question);
      renderError("Backend Copilot is unavailable. Showing clearly labeled demo guidance for MVP preview.");
      renderAnswer(question, fallback);
    } finally {
      setLoading(false);
    }
  });

  window.setInterval(() => {
    if (document.activeElement === prompt || prompt.value.trim()) return;

    hintIndex = (hintIndex + 1) % promptHints.length;
    prompt.placeholder = promptHints[hintIndex];
  }, 3600);
})();
