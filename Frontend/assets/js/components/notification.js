/**
 * Toast Notification System
 * Replaces alert() with a modern, user-friendly notification system
 */

class NotificationManager {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.init();
  }

  /**
   * Initialize the notification container
   */
  init() {
    // Create container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  /**
   * Show a notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type: success, error, warning, info
   * @param {number} duration - Duration in ms (default: 3000)
   * @returns {Object} Notification control object
   */
  show(message, type = 'info', duration = 3000) {
    const notification = this.createNotification(message, type, duration);
    this.addNotification(notification);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, duration);
    }

    return {
      id: notification.id,
      dismiss: () => this.dismiss(notification.id),
      update: (newMessage) => this.update(notification.id, newMessage)
    };
  }

  /**
   * Create notification element
   */
  createNotification(message, type, duration) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const styles = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'ri-check-line text-green-500',
        iconBg: 'bg-green-100',
        title: 'Thành công'
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'ri-error-warning-line text-red-500',
        iconBg: 'bg-red-100',
        title: 'Lỗi'
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'ri-alert-line text-yellow-600',
        iconBg: 'bg-yellow-100',
        title: 'Cảnh báo'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'ri-information-line text-blue-500',
        iconBg: 'bg-blue-100',
        title: 'Thông báo'
      }
    };

    const style = styles[type] || styles.info;

    const element = document.createElement('div');
    element.id = id;
    element.className = `${style.bg} ${style.border} border rounded-lg shadow-lg p-4 flex items-start gap-3 transform transition-all duration-300 translate-x-full opacity-0`;
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-live', 'polite');

    element.innerHTML = `
      <div class="${style.iconBg} rounded-full p-1 flex-shrink-0">
        <i class="${style.icon} text-lg"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-900 text-sm">${style.title}</p>
        <p class="text-gray-700 text-sm mt-1 break-words">${this.escapeHtml(message)}</p>
      </div>
      <button type="button" class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" aria-label="Close notification">
        <i class="ri-close-line text-lg"></i>
      </button>
      ${duration > 0 ? `
        <div class="absolute bottom-0 left-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div class="h-full bg-current opacity-30 transition-all duration-100 ease-linear" style="animation: progress ${duration}ms linear forwards"></div>
        </div>
      ` : ''}
    `;

    // Add close button handler
    const closeBtn = element.querySelector('button');
    closeBtn.addEventListener('click', () => this.dismiss(id));

    return { id, element, type, message };
  }

  /**
   * Add notification to container
   */
  addNotification(notification) {
    this.notifications.push(notification);
    this.container.appendChild(notification.element);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.element.classList.remove('translate-x-full', 'opacity-0');
    });
  }

  /**
   * Dismiss a notification
   */
  dismiss(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return;

    const notification = this.notifications[index];

    // Animate out
    notification.element.classList.add('translate-x-full', 'opacity-0');

    // Remove from DOM after animation
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
    }, 300);

    // Remove from array
    this.notifications.splice(index, 1);
  }

  /**
   * Update notification message
   */
  update(id, newMessage) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return;

    notification.message = newMessage;
    const messageEl = notification.element.querySelector('p:last-of-type');
    if (messageEl) {
      messageEl.textContent = newMessage;
    }
  }

  /**
   * Clear all notifications
   */
  clear() {
    [...this.notifications].forEach(n => this.dismiss(n.id));
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Convenience methods

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  /**
   * Show a confirmation dialog
   */
  async confirm(message, title = 'Xác nhận') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      overlay.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">${this.escapeHtml(title)}</h3>
          <p class="text-gray-700 mb-6">${this.escapeHtml(message)}</p>
          <div class="flex gap-3 justify-end">
            <button type="button" class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" id="confirm-cancel">
              Hủy
            </button>
            <button type="button" class="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors" id="confirm-ok">
              Xác nhận
            </button>
          </div>
        </div>
      `;

      const cancelBtn = overlay.querySelector('#confirm-cancel');
      const okBtn = overlay.querySelector('#confirm-ok');

      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(false);
      });

      okBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(true);
      });

      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
          resolve(false);
        }
      });

      document.body.appendChild(overlay);
    });
  }
}

// Global instance
export const notification = new NotificationManager();

// Auto-export for non-module scripts
if (typeof window !== 'undefined') {
  window.notification = notification;
  // Convenience alias
  window.toast = notification;
  // Replace alert with better alternatives
  window showAlert = (message, type = 'info') => notification.show(message, type);
  window.showConfirm = (message) => notification.confirm(message);
}

export default notification;
