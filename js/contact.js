(function () {
  const form = document.getElementById("contactForm");
  const submitButton = document.getElementById("contactSubmitBtn");
  const submitButtonLabel = submitButton?.querySelector(".button-label");
  const feedback = document.getElementById("contactFeedback");
  const message = document.getElementById("contactMessage");
  const counter = document.getElementById("contactMessageCounter");
  const honeypot = document.getElementById("contactHoneypot");
  const defaultButtonLabel = submitButtonLabel?.textContent || submitButton?.textContent || "Send Message";
  const previewFallbackMessage =
    "Feedback form is running in MVP preview mode. Please share feedback directly with the founder or try again after backend deployment.";

  if (!form || !window.TradeAI) return;

  function setFeedback(text, type = "info") {
    if (!feedback) return;

    feedback.textContent = text;
    feedback.className = `form-feedback ${type}`;
  }

  function setSubmitState(isLoading) {
    if (!submitButton) return;

    submitButton.disabled = isLoading;

    if (submitButtonLabel) {
      submitButtonLabel.textContent = isLoading ? "Sending..." : defaultButtonLabel;
      return;
    }

    submitButton.textContent = isLoading ? "Sending..." : defaultButtonLabel;
  }

  function updateCounter() {
    if (!message || !counter) return;

    counter.textContent = `${message.value.length} / ${message.maxLength || 2000}`;
  }

  function appendContextToMessage(baseMessage, formData) {
    const contextFields = [
      ["Country / Corridor", "country"],
      ["Product/Category", "product"],
      ["Intent", "intent"],
      ["Report Type", "reportType"],
      ["Plan", "plan"],
      ["Interest", "interest"],
      ["Source", "source"],
      ["Reviewer Role", "roleType"],
      ["Feedback Type", "feedbackType"],
      ["Priority / Rating", "priority"],
    ];

    const contextLines = contextFields
      .map(([label, name]) => {
        const value = String(formData.get(name) || "").trim();
        return value ? `${label}: ${value}` : "";
      })
      .filter((line) => line && !baseMessage.includes(line));

    if (!contextLines.length) {
      return baseMessage;
    }

    return `${baseMessage}\n\n${contextLines.join("\n")}`.trim();
  }

  function getPayload() {
    const formData = new FormData(form);
    const baseMessage = String(formData.get("message") || "").trim();

    return {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      roleType: String(formData.get("roleType") || "").trim(),
      feedbackType: String(formData.get("feedbackType") || "").trim(),
      priority: String(formData.get("priority") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: appendContextToMessage(baseMessage, formData),
      source: String(formData.get("source") || "mvp-feedback").trim(),
      interest: String(formData.get("interest") || "").trim(),
    };
  }

  function validatePayload(payload) {
    if (honeypot?.value) {
      return false;
    }

    if (!payload.name || !payload.email || !payload.roleType || !payload.feedbackType || !payload.subject || !payload.message) {
      setFeedback("Please complete all required fields.", "error");
      return false;
    }

    const emailInput = document.getElementById("contactEmail");
    if (emailInput && !emailInput.checkValidity()) {
      setFeedback("Please enter a valid email address.", "error");
      emailInput.focus();
      return false;
    }

    if (payload.message.length < 20) {
      setFeedback("Please enter at least 20 characters in your message.", "error");
      message?.focus();
      return false;
    }

    return true;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = getPayload();
    if (!validatePayload(payload)) return;

    setSubmitState(true);
    setFeedback("Sending your message...", "info");

    try {
      await window.TradeAI.request("/contact", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      form.reset();
      updateCounter();
      setFeedback("Message sent successfully. Our team will contact you soon.", "success");
      window.TradeAI.analytics?.track?.("contact_form_submitted", {
        subject: payload.subject,
        hasCompany: Boolean(payload.company),
      });
    } catch (error) {
      setFeedback(previewFallbackMessage, "error");
    } finally {
      setSubmitState(false);
    }
  });

  message?.addEventListener("input", updateCounter);
  updateCounter();
})();
