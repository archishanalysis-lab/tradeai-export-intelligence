(function () {
  const QUEUE_KEY = "tradeai_analytics_events";
  const SESSION_KEY = "tradeai_analytics_session";
  const MAX_QUEUE_SIZE = 75;
  const MAX_LABEL_LENGTH = 50;
  const MAX_STRING_LENGTH = 160;
  const DEDUPE_WINDOW_MS = 650;
  const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]{1,79}$/;

  let lastEventSignature = "";
  let lastEventAt = 0;

  // Set window.TRADEAI_DEBUG_ANALYTICS = true in DevTools to inspect queued events.
  function isDebugEnabled() {
    return Boolean(window.TRADEAI_DEBUG_ANALYTICS);
  }

  function getStorage() {
    return window.TradeAI?.storage || null;
  }

  function getQueue() {
    return getStorage()?.getJson(QUEUE_KEY, []) || [];
  }

  function saveQueue(events) {
    const storage = getStorage();
    if (!storage) return;

    // Keep the newest events only so localStorage cannot grow indefinitely.
    storage.setJson(QUEUE_KEY, events.slice(-MAX_QUEUE_SIZE));
  }

  function generateId() {
    return (
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
  }

  function getOrCreateSessionId() {
    const storage = getStorage();
    const existingSession = storage?.get(SESSION_KEY);

    if (existingSession) return existingSession;

    const sessionId = generateId();
    storage?.set(SESSION_KEY, sessionId);
    return sessionId;
  }

  function getCurrentUserId() {
    const authState = window.TradeAI?.state?.auth || window.TradeAI?.auth;
    const user = authState?.getUser?.();
    return user?.id || user?._id || "anonymous";
  }

  function normaliseEventName(eventName) {
    if (typeof eventName !== "string") {
      if (isDebugEnabled()) {
        console.warn("[TradeAI analytics] invalid event name:", eventName);
      }
      return null;
    }

    const normalized = eventName.trim();
    if (!EVENT_NAME_PATTERN.test(normalized)) {
      if (isDebugEnabled()) {
        console.warn("[TradeAI analytics] event name rejected:", eventName);
      }
      return null;
    }

    return normalized;
  }

  function trimString(value, maxLength = MAX_STRING_LENGTH) {
    return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
  }

  function sanitizeValue(value) {
    if (value === null || value === undefined) return null;

    if (typeof value === "string") return trimString(value);
    if (typeof value === "number" || typeof value === "boolean") return value;
    if (Array.isArray(value)) return value.slice(0, 10).map(sanitizeValue);

    if (typeof value === "object") {
      return Object.keys(value).reduce((safeObject, key) => {
        safeObject[key] = sanitizeValue(value[key]);
        return safeObject;
      }, {});
    }

    return String(value).slice(0, MAX_STRING_LENGTH);
  }

  function sanitizeProperties(properties = {}) {
    if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
      return {};
    }

    return Object.keys(properties).reduce((safeProperties, key) => {
      safeProperties[key] = sanitizeValue(properties[key]);
      return safeProperties;
    }, {});
  }

  function shouldDedupe(event) {
    const signature = JSON.stringify({
      event: event.event,
      path: event.path,
      properties: event.properties,
    });
    const now = Date.now();
    const isDuplicate =
      signature === lastEventSignature && now - lastEventAt < DEDUPE_WINDOW_MS;

    lastEventSignature = signature;
    lastEventAt = now;
    return isDuplicate;
  }

  function getApiBaseUrl() {
    return window.TradeAI?.API_BASE_URL || window.TradeAI?.apiBaseUrl || null;
  }

  function track(eventName, properties = {}) {
    const normalizedEventName = normaliseEventName(eventName);
    if (!normalizedEventName) return null;

    const event = {
      event: normalizedEventName,
      properties: sanitizeProperties(properties),
      path: window.location.pathname,
      href: window.location.href.split("#")[0],
      userId: getCurrentUserId(),
      sessionId: getOrCreateSessionId(),
      performanceTime: Math.round(performance.now()),
      ts: new Date().toISOString(),
    };

    if (shouldDedupe(event)) return event;

    saveQueue([...getQueue(), event]);

    if (isDebugEnabled()) {
      console.info("[TradeAI analytics]", event);
    }

    return event;
  }

  async function flush(options = {}) {
    const queue = getQueue();
    if (!queue.length) return false;

    const payload = JSON.stringify({ events: queue });

    if (options.useBeacon && navigator.sendBeacon && getApiBaseUrl()) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(`${getApiBaseUrl()}/analytics/events`, blob);

      if (sent) {
        saveQueue([]);
      }

      return sent;
    }

    if (!window.TradeAI?.request) return false;

    try {
      await window.TradeAI.request("/analytics/events", {
        method: "POST",
        body: payload,
      });
      saveQueue([]);
      return true;
    } catch (error) {
      if (isDebugEnabled()) {
        console.warn("[TradeAI analytics] flush failed:", error);
      }
      return false;
    }
  }

  function getTrackedElementData(target) {
    const labelSource =
      target.getAttribute("aria-label") ||
      target.dataset.trackLabel ||
      target.textContent ||
      "";

    return {
      label: trimString(labelSource, MAX_LABEL_LENGTH) || null,
      href: target.matches("a") ? target.getAttribute("href") || null : null,
      plan: target.dataset.plan || null,
    };
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-track]");
    if (!target) return;

    track(target.dataset.track, getTrackedElementData(target));
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flush({ useBeacon: true });
    }
  });

  window.addEventListener("pagehide", () => {
    flush({ useBeacon: true });
  });

  window.TradeAI = window.TradeAI || {};
  window.TradeAI.analytics = {
    track,
    flush,
  };

  function trackPageView() {
    track("page_view", {
      title: document.title || null,
      referrer: document.referrer || null,
    });
    flush();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackPageView, { once: true });
  } else {
    trackPageView();
  }
})();
