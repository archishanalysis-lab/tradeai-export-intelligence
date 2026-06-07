(function () {
  const form = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("forgotEmail");

  if (!form || !emailInput || !window.TradeAI?.request) return;

  function setMessage(message, type = "success") {
    let node = form.querySelector(".form-message");

    if (!node) {
      node = document.createElement("div");
      node.className = "form-message";
      node.setAttribute("role", "alert");
      node.setAttribute("aria-live", "polite");
      form.insertBefore(node, form.querySelector('button[type="submit"]'));
    }

    node.textContent = message;
    node.className = `form-message form-message-${type}`;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    if (!email || !emailInput.checkValidity()) {
      setMessage("Enter a valid account email.", "error");
      emailInput.focus();
      return;
    }

    try {
      button.disabled = true;
      button.dataset.originalText = button.dataset.originalText || button.textContent.trim();
      button.textContent = "Sending...";

      const data = await TradeAI.request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        retries: 0,
      });

      setMessage(data.message || "If the email exists, reset instructions will be sent.");
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      button.disabled = false;
      button.textContent = button.dataset.originalText || "Request Reset Link";
    }
  });
})();
