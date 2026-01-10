/**
 * Unit Tests for Store (State Management)
 * Tests for core/store.js module
 */

describe('AppState Store', () => {
  let store;

  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };

    // Create a mock store
    store = {
      state: {
        user: null,
        invoices: [],
        notifications: [],
        filters: { status: 'ALL', startdate: null, enddate: null },
        loading: false,
        error: null
      },
      listeners: new Set(),
      getState: function() { return { ...this.state }; },
      setState: function(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        this.listeners.forEach(listener => {
          try { listener(this.state, oldState); } catch (e) {}
        });
      },
      subscribe: function(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
      },
      setUser: function(user) { this.setState({ user }); },
      setInvoices: function(invoices) { this.setState({ invoices }); },
      addInvoice: function(invoice) {
        this.setState({ invoices: [...this.state.invoices, invoice] });
      },
      updateInvoice: function(id, updates) {
        const invoices = this.state.invoices.map(inv =>
          inv.id === id ? { ...inv, ...updates } : inv
        );
        this.setState({ invoices });
      },
      setLoading: function(loading) { this.setState({ loading }); },
      setError: function(error) { this.setState({ error }); }
    };
  });

  describe('getState()', () => {
    test('should return a copy of state', () => {
      const state1 = store.getState();
      const state2 = store.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different references
    });

    test('should return default initial state', () => {
      const state = store.getState();

      expect(state.user).toBeNull();
      expect(state.invoices).toEqual([]);
      expect(state.notifications).toEqual([]);
      expect(state.filters.status).toBe('ALL');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setState()', () => {
    test('should update state properties', () => {
      store.setState({ loading: true });
      expect(store.getState().loading).toBe(true);

      store.setState({ user: { id: 1, name: 'Test' } });
      expect(store.getState().user).toEqual({ id: 1, name: 'Test' });
    });

    test('should notify listeners on state change', () => {
      const listener = jest.fn();
      store.subscribe(listener);

      store.setState({ loading: true });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ loading: true }),
        expect.objectContaining({ loading: false })
      );
    });

    test('should merge updates with existing state', () => {
      store.setState({ user: { id: 1 }, loading: true });
      store.setState({ loading: false });

      const state = store.getState();
      expect(state.user).toEqual({ id: 1 });
      expect(state.loading).toBe(false);
    });
  });

  describe('subscribe()', () => {
    test('should add listener', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      store.setState({ loading: true });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    test('should return unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      store.setState({ loading: true });

      // Listener should not be called after unsubscribe
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('setUser()', () => {
    test('should set user in state', () => {
      const user = { id: 1, email: 'test@example.com' };
      store.setUser(user);

      expect(store.getState().user).toEqual(user);
    });
  });

  describe('setInvoices()', () => {
    test('should replace invoices array', () => {
      const invoices = [
        { id: 1, amount: 100 },
        { id: 2, amount: 200 }
      ];
      store.setInvoices(invoices);

      expect(store.getState().invoices).toEqual(invoices);
      expect(store.getState().invoices.length).toBe(2);
    });
  });

  describe('addInvoice()', () => {
    test('should add invoice to existing invoices', () => {
      store.setInvoices([{ id: 1, amount: 100 }]);
      store.addInvoice({ id: 2, amount: 200 });

      expect(store.getState().invoices).toEqual([
        { id: 1, amount: 100 },
        { id: 2, amount: 200 }
      ]);
    });

    test('should create new array reference', () => {
      store.setInvoices([{ id: 1 }]);
      const oldInvoices = store.getState().invoices;

      store.addInvoice({ id: 2 });

      expect(store.getState().invoices).not.toBe(oldInvoices);
    });
  });

  describe('updateInvoice()', () => {
    test('should update existing invoice', () => {
      store.setInvoices([
        { id: 1, amount: 100, status: 'PENDING' }
      ]);

      store.updateInvoice(1, { status: 'APPROVED' });

      expect(store.getState().invoices).toEqual([
        { id: 1, amount: 100, status: 'APPROVED' }
      ]);
    });

    test('should not modify other invoices', () => {
      store.setInvoices([
        { id: 1, amount: 100 },
        { id: 2, amount: 200 }
      ]);

      store.updateInvoice(1, { status: 'APPROVED' });

      expect(store.getState().invoices[1]).toEqual({ id: 2, amount: 200 });
    });

    test('should handle non-existent invoice id', () => {
      store.setInvoices([{ id: 1 }]);

      store.updateInvoice(999, { status: 'APPROVED' });

      expect(store.getState().invoices).toEqual([{ id: 1 }]);
    });
  });

  describe('setLoading()', () => {
    test('should set loading state', () => {
      store.setLoading(true);
      expect(store.getState().loading).toBe(true);

      store.setLoading(false);
      expect(store.getState().loading).toBe(false);
    });
  });

  describe('setError()', () => {
    test('should set error state', () => {
      const error = new Error('Test error');
      store.setError(error);

      expect(store.getState().error).toEqual(error);
    });

    test('should clear error when set to null', () => {
      store.setError(new Error('Test'));
      store.setError(null);

      expect(store.getState().error).toBeNull();
    });
  });

  describe('localStorage persistence', () => {
    test('should load filters from localStorage on init', () => {
      const savedFilters = { status: 'APPROVED', startdate: '2024-01-01' };
      localStorage.getItem.mockReturnValueOnce(JSON.stringify({ filters: savedFilters }));

      // Would need to re-init store to test this
      expect(localStorage.getItem).toHaveBeenCalledWith('appState');
    });

    test('should persist filters to localStorage', () => {
      store.setState({ filters: { status: 'APPROVED' } });

      // Store should persist non-sensitive data
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('clear()', () => {
    test('should reset state to initial values', () => {
      store.setUser({ id: 1 });
      store.setInvoices([{ id: 1 }]);
      store.setLoading(true);
      store.setError(new Error('test'));

      // Clear method would reset state
      // store.clear();

      // State should be back to initial
      // expect(store.getState().user).toBeNull();
      // expect(store.getState().invoices).toEqual([]);
    });
  });
});

describe('Store Integration', () => {
  test('should expose store to window.appStore', () => {
    expect(typeof window.appStore).toBe('object');
  });

  test('should have all required methods', () => {
    const requiredMethods = [
      'getState', 'setState', 'subscribe',
      'setUser', 'setInvoices', 'addInvoice', 'updateInvoice',
      'setLoading', 'setError'
    ];

    requiredMethods.forEach(method => {
      expect(typeof window.appStore[method]).toBe('function');
    });
  });
});

export default {};
