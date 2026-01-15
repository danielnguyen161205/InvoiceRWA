/**
 * State Management Store
 * Simple state management for application data
 */

(function() {
  'use strict';

  class Store {
    constructor() {
      this.state = {};
      this.listeners = {};
    }

    get(key) {
      return this.state[key];
    }

    set(key, value) {
      const oldValue = this.state[key];
      this.state[key] = value;
      
      if (this.listeners[key]) {
        this.listeners[key].forEach(callback => {
          callback(value, oldValue);
        });
      }
    }

    subscribe(key, callback) {
      if (!this.listeners[key]) {
        this.listeners[key] = [];
      }
      this.listeners[key].push(callback);
      
      return () => {
        const index = this.listeners[key].indexOf(callback);
        if (index > -1) {
          this.listeners[key].splice(index, 1);
        }
      };
    }

    remove(key) {
      delete this.state[key];
      delete this.listeners[key];
    }

    clear() {
      this.state = {};
      this.listeners = {};
    }

    getAll() {
      return { ...this.state };
    }
  }

  window.store = new Store();
  console.log('Store module loaded');
})();
