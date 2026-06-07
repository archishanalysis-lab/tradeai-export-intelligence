(function () {
  const form = document.getElementById("copilotForm");
  const prompt = document.getElementById("copilotPrompt");
  const response = document.getElementById("copilotResponse");
  const submitButton = document.getElementById("copilotSubmit");
  const submitLabel = submitButton?.querySelector(".button-label");

  if (!form || !prompt || !response || !window.TradeAI) return;

  const promptHints = [
    "Find textile buyers in Germany",
    "Suggest best export market for turmeric from India",
    "Recommend HS codes for cotton T-shirts",
    "Find UAE buyers for Indian spices",
  ];

  let hintIndex = 0;

  function setLoading(isLoading) {
    response.setAttribute("aria-busy", String(isLoading));

    if (!submitButton) return;

    submitButton.disabled = isLoading;

    if (submitLabel) {
      submitLabel.textContent = isLoading ? "Thinking..." : "Ask Copilot";
    }
  }

  function createCard(title, body, subtext) {
    const card = document.createElement("article");
    card.className = "activity-card";

    const heading = document.createElement("h4");
    heading.textContent = title;
    card.appendChild(heading);

    const paragraph = document.createElement("p");
    paragraph.textContent = body;
    card.appendChild(paragraph);

    if (subtext) {
      const small = document.createElement("p");
      small.className = "table-subtext";
      small.textContent = subtext;
      card.appendChild(small);
    }

    return card;
  }

  function renderLoading() {
    response.replaceChildren(
      createCard("Thinking...", "TradeAI Copilot is preparing your trade recommendation."),
    );
  }

  function renderError(message) {
    response.replaceChildren(
      createCard("Copilot could not respond", message),
    );
  }

  function render(data) {
    const cards = [
      createCard(
        "Copilot response",
        data.answer || "No response returned.",
        `Provider: ${data.provider || "TradeAI"}`,
      ),
      ...(data.suggestedActions || []).map((action) =>
        createCard(action, "Suggested next action from TradeAI Copilot."),
      ),
    ];

    response.replaceChildren(...cards);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!TradeAI.auth.requireAuth()) return;

    const value = prompt.value.trim();

    if (!value) {
      renderError("Please enter a trade question before asking Copilot.");
      prompt.focus();
      return;
    }

    try {
      setLoading(true);
      renderLoading();

      const data = await TradeAI.request("/copilot/ask", {
        method: "POST",
        body: JSON.stringify({ prompt: value }),
      });

      render(data);
    } catch (error) {
      renderError(error.message);
      TradeAI.toast(error.message, "error");
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
