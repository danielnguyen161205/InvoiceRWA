/**
 * Centralized State Management
 * Provides a reactive state store for the application
 */

class AppState {
  constructor() {
    this.state = {
      user: null,
      invoices: [],
      notifications: [],
      filters: {
        status: 'ALL',
        startdate: null,
        enddate: null
      },
      loading: false,
      error: null
    };
    this.listeners = new Set();
    this.init();
  }

  /**
   * Initialize store from localStorage
   */
  init() {
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Restore persisted state (not sensitive data)
        this.state.filters = parsed.filters || this.state.filters;
      }
    } catch (e) {
      console.warn('Failed to restore state:', e);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   */
  setState(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Persist non-sensitive state
    this.persist();

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.state, oldState);
      } catch (e) {
        console.error('Listener error:', e);
      }
    });
  }

  /**
   * Subscribe to state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Persist state to localStorage
   */
  persist() {
    try {
      const toPersist = {
        filters: this.state.filters
      };
      localStorage.setItem('appState', JSON.stringify(toPersist));
    } catch (e) {
      console.warn('Failed to persist state:', e);
    }
  }

  /**
   * Clear all state
   */
  clear() {
    this.state = {
      user: null,
      invoices: [],
      notifications: [],
      filters: {
        status: 'ALL',
        startdate: null,
        enddate: null
      },
      loading: false,
      error: null
    };
    localStorage.removeItem('appState');
    this.notify();
  }

  notify() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Listener error:', e);
      }
    });
  }

  // Convenience methods for common state updates

  setUser(user) {
    this.setState({ user });
  }

  setInvoices(invoices) {
    this.setState({ invoices });
  }

  addInvoice(invoice) {
    this.setState({ invoices: [...this.state.invoices, invoice] });
  }

  updateInvoice(id, updates) {
    const invoices = this.state.invoices.map(inv =>
      inv.id === id ? { ...inv, ...updates } : inv
    );
    this.setState({ invoices });
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  setError(error) {
    this.setState({ error });
  }

  addNotification(notification) {
    const notifications = [
      ...this.state.notifications,
      { ...notification, id: Date.now() }
    ];
    this.setState({ notifications });

    // Auto-remove notification after duration
    if (notification.duration !== Infinity) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration || 3000);
    }
  }

  removeNotification(id) {
    const notifications = this.state.notifications.filter(n => n.id !== id);
    this.setState({ notifications });
  }
}

// Global store instance
export const store = new AppState();

// Auto-export for backwards compatibility with non-module scripts
if (typeof window !== 'undefined') {
  window.appStore = store;
}

export default store;
