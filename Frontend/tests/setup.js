/**
 * Vitest Setup File
 * Global test configuration and mocks
 */

import { jsdom } from 'jsdom';

// Mock DOM APIs for testing
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    id: '',
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    setAttribute: function(name, value) { this[name] = value; },
    getAttribute: function(name) { return this[name]; },
    appendChild: function(child) { return child; },
    removeChild: function() {},
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    addEventListener: function() {},
    removeEventListener: function() {},
    classList: {
      add: function() {},
      remove: function() {},
      toggle: function() {},
      contains: function() { return false; }
    }
  }),
  head: {
    appendChild: function() {},
    prepend: function() {},
    querySelector: function() { return null; }
  },
  body: {
    appendChild: function() { return {}; },
    prepend: function() {},
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; }
  },
  querySelector: function() { return null; },
  querySelectorAll: function() { return []; },
  getElementById: function() { return null; },
  getElementsByClassName: function() { return []; },
  getElementsByTagName: function() { return []; }
};

// Mock localStorage
global.localStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = String(value);
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  },
  get length() {
    return Object.keys(this.store).length;
  },
  key: function(index) {
    return Object.keys(this.store)[index] || null;
  }
};

// Mock sessionStorage
global.sessionStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = String(value);
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

// Mock window object
global.window = {
  location: {
    href: 'http://127.0.0.1:5500/pages/login.html',
    pathname: '/pages/login.html',
    search: '',
    hash: '',
    reload: function() {}
  },
  history: {
    pushState: function() {},
    replaceState: function() {},
    go: function() {},
    back: function() {},
    forward: function() {}
  },
  sessionStorage: global.sessionStorage,
  localStorage: global.localStorage,
  document: global.document,
  addEventListener: function() {},
  removeEventListener: function() {},
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearTimeout: clearTimeout,
  clearInterval: clearInterval,
  requestAnimationFrame: function(callback) {
    return setTimeout(callback, 16);
  },
  cancelAnimationFrame: clearTimeout,
  scrollTo: function() {},
  getComputedStyle: function() {
    return {
      getPropertyValue: function() { return ''; }
    };
  }
};

// Mock fetch API
global.fetch = function() {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Map()
  });
};

// Mock atob and btoa
global.atob = function(str) {
  return Buffer.from(str, 'base64').toString('binary');
};

global.btoa = function(str) {
  return Buffer.from(str, 'binary').toString('base64');
};

// Export globals for use in tests
export { document, window, localStorage, sessionStorage };
