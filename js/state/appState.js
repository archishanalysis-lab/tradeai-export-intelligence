(function () {
  const initialStore = {
    products: [],
    buyers: [],
    inquiries: [],
    notifications: [],
    analytics: {},
  };

  const store = cloneValue(initialStore);
  const validKeys = new Set(Object.keys(initialStore));
  const listeners = new Set();

  function cloneValue(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function isPlainObject(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }

  function notifyListeners(partial) {
    const stateSnapshot = appState.getState();
    const partialSnapshot = cloneValue(partial);

    listeners.forEach((listener) => {
      try {
        listener(partialSnapshot, stateSnapshot);
      } catch (error) {
        console.error("appState listener error:", error);
      }
    });
  }

  function applyPartial(partial) {
    Object.keys(partial).forEach((key) => {
      if (!validKeys.has(key)) {
        console.warn(`appState.setState: unknown key "${key}"`);
        return;
      }

      if (isPlainObject(partial[key]) && isPlainObject(store[key])) {
        store[key] = {
          ...store[key],
          ...partial[key],
        };
        return;
      }

      store[key] = partial[key];
    });
  }

  const appState = {
    getState() {
      return cloneValue(store);
    },
    init(initialState = {}) {
      applyPartial(initialState);
      notifyListeners(initialState);
    },
    setState(partial) {
      if (!isPlainObject(partial)) {
        console.warn("appState.setState: partial state must be an object.");
        return;
      }

      applyPartial(partial);
      notifyListeners(partial);
    },
    resetState() {
      Object.keys(initialStore).forEach((key) => {
        store[key] = cloneValue(initialStore[key]);
      });
      notifyListeners(appState.getState());
    },
    subscribe(listener) {
      if (typeof listener !== "function") {
        console.warn("appState.subscribe: listener must be a function.");
        return () => {};
      }

      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  window.TradeAI = window.TradeAI || {};
  window.TradeAI.state = window.TradeAI.state || {};
  window.TradeAI.state.app = appState;
})();
