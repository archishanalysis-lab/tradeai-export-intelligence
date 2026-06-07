(function () {
  const STORAGE_KEY = "tradeai_notifications";
  const MAX_NOTIFICATIONS = 50;
  const VALID_TYPES = new Set(["info", "success", "warning", "error"]);
  const storage = window.TradeAI?.storage;
  const listeners = new Set();

  function clone(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function createId() {
    return window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function loadItems() {
    if (!storage) return [];

    const savedItems = storage.getJson(STORAGE_KEY, []);

    return Array.isArray(savedItems) ? savedItems.slice(0, MAX_NOTIFICATIONS) : [];
  }

  const items = loadItems();

  function persist() {
    storage?.setJson(STORAGE_KEY, items);
  }

  function listSnapshot() {
    return clone(items);
  }

  function notifyListeners() {
    const snapshot = listSnapshot();

    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error("notificationState listener error:", error);
      }
    });
  }

  function normalizeType(type) {
    return VALID_TYPES.has(type) ? type : "info";
  }

  /**
   * In-memory notification state with local persistence for user-facing alerts.
   */
  const notificationState = {
    push(notification) {
      if (!notification?.message) {
        console.warn("notificationState.push: missing message.");
        return null;
      }

      const item = {
        id: notification.id || createId(),
        type: normalizeType(notification.type),
        message: String(notification.message),
        title: notification.title ? String(notification.title) : null,
        createdAt: notification.createdAt || new Date().toISOString(),
        read: Boolean(notification.read),
        meta: notification.meta || null,
      };

      items.unshift(item);

      if (items.length > MAX_NOTIFICATIONS) {
        items.length = MAX_NOTIFICATIONS;
      }

      persist();
      notifyListeners();
      return clone(item);
    },

    list() {
      return listSnapshot();
    },

    getUnreadCount() {
      return items.filter((item) => !item.read).length;
    },

    markRead(id) {
      const item = items.find((candidate) => candidate.id === id);

      if (!item) return false;

      item.read = true;
      persist();
      notifyListeners();
      return true;
    },

    markAllRead() {
      items.forEach((item) => {
        item.read = true;
      });
      persist();
      notifyListeners();
    },

    dismiss(id) {
      const index = items.findIndex((item) => item.id === id);

      if (index === -1) return false;

      items.splice(index, 1);
      persist();
      notifyListeners();
      return true;
    },

    clearAll() {
      items.length = 0;
      persist();
      notifyListeners();
    },

    subscribe(listener) {
      if (typeof listener !== "function") {
        console.warn("notificationState.subscribe: listener must be a function.");
        return () => {};
      }

      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  window.TradeAI = window.TradeAI || {};
  window.TradeAI.state = window.TradeAI.state || {};
  window.TradeAI.state.notifications = notificationState;
})();
