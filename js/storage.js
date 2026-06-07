(function () {
  const memoryStore = new Map();

  function canUseLocalStorage() {
    try {
      const probeKey = "__tradeai_storage_probe__";
      window.localStorage.setItem(probeKey, "1");
      window.localStorage.removeItem(probeKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  const hasLocalStorage = canUseLocalStorage();

  const storage = {
    get(key, fallback = null) {
      try {
        if (hasLocalStorage) {
          const value = window.localStorage.getItem(key);
          return value === null ? fallback : value;
        }
      } catch (error) {
        return memoryStore.has(key) ? memoryStore.get(key) : fallback;
      }

      return memoryStore.has(key) ? memoryStore.get(key) : fallback;
    },

    set(key, value) {
      try {
        if (hasLocalStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch (error) {
        // Fall back to memory storage when the browser blocks localStorage.
      }

      memoryStore.set(key, value);
    },

    remove(key) {
      try {
        if (hasLocalStorage) {
          window.localStorage.removeItem(key);
          return;
        }
      } catch (error) {
        memoryStore.delete(key);
        return;
      }

      memoryStore.delete(key);
    },

    getJson(key, fallback = null) {
      try {
        const value = this.get(key);
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        return fallback;
      }
    },

    setJson(key, value) {
      this.set(key, JSON.stringify(value));
    },
  };

  window.TradeAI = {
    ...(window.TradeAI || {}),
    storage,
  };
})();
