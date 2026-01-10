/**
 * Main Application Entry Point
 * This file is loaded after all other modules have initialized
 * All modules export to window object, so no imports needed
 */

// Note: All other modules (store.js, api-client.js, errorHandler.js, notification.js,
// sanitizer.js, formatters.js, validators.js, constants.js) create their own
// window objects. This file just ensures everything is loaded and logs initialization.

if (typeof window !== 'undefined') {
  console.log('Invoice RWA Frontend modules loaded');
  console.log('Available global objects:', {
    appStore: typeof window.appStore,
    api: typeof window.api,
    notification: typeof window.notification,
    errorHandler: typeof window.errorHandler,
    formatter: typeof window.formatter,
    validator: typeof window.validator,
    sanitizer: typeof window.sanitizer,
    API_CONFIG: typeof window.API_CONFIG,
    USER_ROLES: typeof window.USER_ROLES
  });

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM ready - Invoice RWA Frontend initialized');
    });
  } else {
    console.log('DOM ready - Invoice RWA Frontend initialized');
  }
}
