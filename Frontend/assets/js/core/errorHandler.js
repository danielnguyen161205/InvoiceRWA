/**
 * Global Error Handler
 * Centralized error handling for uncaught errors, promise rejections, and API errors
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.init();
  }

  /**
   * Initialize global error handlers
   */
  init() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        source: 'uncaught',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        source: 'unhandledRejection',
        promise: event.promise
      });
    });
  }

  /**
   * Handle an error
   */
  handleError(error, context = {}) {
    const errorInfo = this.formatError(error, context);

    // Log to console
    console.error('Error:', errorInfo);

    // Add to error log
    this.addToLog(errorInfo);

    // Show user-friendly message
    this.showUserMessage(errorInfo);

    // Report to backend (optional)
    this.reportError(errorInfo);

    return errorInfo;
  }

  /**
   * Format error for logging
   */
  formatError(error, context) {
    return {
      message: error?.message || String(error),
      stack: error?.stack || null,
      name: error?.name || 'Error',
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  /**
   * Add error to log
   */
  addToLog(errorInfo) {
    this.errorLog.push(errorInfo);

    // Keep log size under limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Persist to sessionStorage for debugging
    try {
      sessionStorage.setItem('errorLog', JSON.stringify(this.errorLog.slice(-20)));
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Show user-friendly error message
   */
  showUserMessage(errorInfo) {
    // Use notification system if available
    if (typeof window !== 'undefined' && window.notification) {
      // Don't show notification for expected errors (like 401 Unauthorized)
      if (errorInfo.message === 'Unauthorized' || errorInfo.message.includes('401')) {
        return;
      }

      // Show user-friendly message based on error type
      let message = this.getUserMessage(errorInfo);
      window.notification.error(message, 5000);
    } else {
      // Fallback to console
      console.error('User message:', this.getUserMessage(errorInfo));
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(errorInfo) {
    // Network errors
    if (errorInfo.message.includes('Failed to fetch') || errorInfo.message.includes('NetworkError')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
    }

    // API errors with specific messages
    if (errorInfo.context?.status === 404) {
      return 'Không tìm thấy tài nguyên yêu cầu.';
    }

    if (errorInfo.context?.status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }

    if (errorInfo.context?.status === 500) {
      return 'Lỗi máy chủ. Vui lòng thử lại sau.';
    }

    // Validation errors
    if (errorInfo.message.includes('validation') || errorInfo.message.includes('Invalid')) {
      return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    }

    // Default message - hide technical details from users
    return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }

  /**
   * Report error to backend (optional)
   */
  async reportError(errorInfo) {
    // Skip error reporting in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return;
    }

    try {
      // Get API URL from config or use default
      const API_URL = window.API_URL || 'http://127.0.0.1:8000';

      await fetch(`${API_URL}/api/errors/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...errorInfo,
          // Remove sensitive info
          userAgent: undefined,
          stack: errorInfo.stack // Include stack for debugging
        })
      });
    } catch (e) {
      // Silently fail if error reporting fails
      console.warn('Failed to report error:', e);
    }
  }

  /**
   * Handle API errors specifically
   */
  handleApiError(response, errorData) {
    const error = new Error(errorData?.detail || response.statusText);
    error.status = response.status;
    error.url = response.url;

    return this.handleError(error, {
      source: 'api',
      status: response.status,
      url: response.url
    });
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearLog() {
    this.errorLog = [];
    sessionStorage.removeItem('errorLog');
  }

  /**
   * Wrap an async function with error handling
   */
  wrap(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error; // Re-throw for caller to handle
      }
    };
  }
}

// Global instance
export const errorHandler = new ErrorHandler();

// Export for non-module scripts
if (typeof window !== 'undefined') {
  window.errorHandler = errorHandler;
  // Convenience functions
  window.handleError = (error, context) => errorHandler.handleError(error, context);
  window.wrapAsync = (fn, context) => errorHandler.wrap(fn, context);
}

export default errorHandler;
