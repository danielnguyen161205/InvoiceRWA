/**
 * Main Application Entry Point
 * Initializes all core modules and exports global utilities
 */

// Import all core modules
import { store } from './core/store.js';
import { api, ApiError } from './core/api-client.js';
import { errorHandler } from './core/errorHandler.js';
import { notification } from './components/notification.js';

// Import utilities
import { formatter } from './utils/formatters.js';
import { validator } from './utils/validators.js';
import { sanitizer } from './utils/sanitizer.js';
import * as constants from './utils/constants.js';

/**
 * Application initialization
 */
class App {
  constructor() {
    this.store = store;
    this.api = api;
    this.notification = notification;
    this.errorHandler = errorHandler;
    this.formatter = formatter;
    this.validator = validator;
    this.sanitizer = sanitizer;
    this.constants = constants;
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.initialized) return;

    console.log('Initializing Invoice RWA Frontend...');

    // Set up global error handlers
    this.setupErrorHandlers();

    // Set up token refresh logic
    this.setupTokenRefresh();

    // Set up activity tracking
    this.setupActivityTracking();

    // Set up CSP
    this.sanitizer.setCSP();

    this.initialized = true;
    console.log('Invoice RWA Frontend initialized successfully');
  }

  /**
   * Setup global error handlers
   */
  setupErrorHandlers() {
    // Add API error interceptor to notification system
    this.api.addResponseInterceptor(async (data, url) => {
      // Check for error responses
      if (data && data.error) {
        this.notification.error(data.error);
      }
      return data;
    });
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    setInterval(() => {
      const token = this.api.getToken();
      if (!token) return;

      try {
        // Check if token expires in less than 5 minutes
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // Refresh if expiring in less than 5 minutes (300000ms)
        if (timeUntilExpiry < 300000 && timeUntilExpiry > 0) {
          console.log('Refreshing token...');
          this.api.refreshToken().catch(err => {
            console.error('Token refresh failed:', err);
            this.api.logout();
          });
        }
      } catch (e) {
        console.error('Error checking token expiry:', e);
      }
    }, 60000); // Check every minute
  }

  /**
   * Track user activity for auto-logout
   */
  setupActivityTracking() {
    let activityTimer;

    const resetTimer = () => {
      clearTimeout(activityTimer);
      // Auto-logout after 30 minutes of inactivity
      activityTimer = setTimeout(() => {
        const token = this.api.getToken();
        if (token) {
          console.log('Auto-logout due to inactivity');
          this.notification.warning('Phiên làm việc đã hết hạn do không hoạt động.');
          this.api.logout();
        }
      }, 30 * 60 * 1000);
    };

    // Track activity events
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Start timer
    resetTimer();
  }

  /**
   * Require authentication for current page
   */
  requireAuth() {
    const token = this.api.getToken();

    if (!token) {
      window.location.href = '/pages/login.html';
      return false;
    }

    // Check token expiration
    if (this.api.isTokenExpired(token)) {
      this.api.clearToken();
      window.location.href = '/pages/login.html';
      return false;
    }

    // Decode and check user status
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.roles || (payload.role ? [payload.role] : []);
      const kycVerified = payload.kyc_verified || false;
      const currentPage = window.location.pathname;

      // Allow ADMIN to access any page without KYC
      if (roles.includes(constants.USER_ROLES.ADMIN)) {
        return true;
      }

      // Allow profile page access for everyone
      if (currentPage.includes('/profile.html')) {
        return true;
      }

      // If not verified and trying to access dashboard, redirect to profile
      if (!kycVerified) {
        this.notification.info('Vui lòng hoàn thành xác thực KYC trước khi tiếp tục.');
        window.location.href = '/pages/profile.html';
        return false;
      }

      return true;
    } catch (e) {
      console.error('Error decoding token:', e);
      this.api.logout();
      return false;
    }
  }

  /**
   * Get current user from token
   */
  getCurrentUser() {
    const token = this.api.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles || (payload.role ? [payload.role] : []),
        kycVerified: payload.kyc_verified || false,
        orgStatus: payload.org_status
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Check if user has role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes(role);
  }

  /**
   * Redirect user based on role
   */
  redirectByRole() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = '/pages/login.html';
      return;
    }

    // Admin -> Admin Dashboard
    if (user.roles.includes(constants.USER_ROLES.ADMIN)) {
      window.location.href = constants.ROUTES.ADMIN_DASHBOARD;
      return;
    }

    // Check KYC status
    if (!user.kycVerified) {
      window.location.href = constants.ROUTES.PROFILE;
      return;
    }

    // Redirect based on role priority: BANK > SME > BUYER
    if (user.roles.includes(constants.USER_ROLES.BANK)) {
      window.location.href = constants.ROUTES.BANK_DASHBOARD;
    } else if (user.roles.includes(constants.USER_ROLES.SME)) {
      window.location.href = constants.ROUTES.SME_DASHBOARD;
    } else if (user.roles.includes(constants.USER_ROLES.BUYER)) {
      window.location.href = constants.ROUTES.BUYER_DASHBOARD;
    } else {
      window.location.href = '/pages/login.html';
    }
  }

  /**
   * Logout
   */
  logout() {
    this.store.clear();
    this.api.clearToken();
    this.notification.success('Đăng xuất thành công!');
    setTimeout(() => {
      window.location.href = '/pages/login.html';
    }, 500);
  }
}

// Create and export global app instance
export const app = new App();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for non-module scripts (global namespace)
if (typeof window !== 'undefined') {
  // Create a global window.app object
  window.app = app;

  // Export all utilities to global scope for backwards compatibility
  window.store = store;
  window.api = api;
  window.notification = notification;
  window.errorHandler = errorHandler;
  window.formatter = formatter;
  window.validator = validator;
  window.sanitizer = sanitizer;
  window.ApiError = ApiError;

  // Export constants
  Object.assign(window, constants);

  // Convenience functions
  window.requireAuth = () => app.requireAuth();
  window.getCurrentUser = () => app.getCurrentUser();
  window.hasRole = (role) => app.hasRole(role);
  window.logout = () => app.logout();
  window.redirectByRole = () => app.redirectByRole();

  // Legacy compatibility
  window.getToken = () => api.getToken();
  window.logout = () => app.logout();

  console.log('Invoice RWA Frontend modules loaded');
}

export default app;
