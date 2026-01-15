/**
 * Notification Component
 */

(function() {
  'use strict';

  class Notification {
    constructor() {
      this.container = null;
      this.init();
    }

    init() {
      this.container = document.getElementById('notification-container');
      
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
        `;
        document.body.appendChild(this.container);
      }
    }

    show(message, type = 'info', duration = 4000) {
      const notification = document.createElement('div');
      
      const icons = {
        success: '<i class="ri-checkbox-circle-line"></i>',
        error: '<i class="ri-error-warning-line"></i>',
        warning: '<i class="ri-alert-line"></i>',
        info: '<i class="ri-information-line"></i>'
      };

      const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
      };

      notification.innerHTML = `
        <div style="
          background: white;
          border-left: 4px solid ${colors[type]};
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideIn 0.3s ease-out;
          min-width: 300px;
        ">
          <div style="font-size: 24px; color: ${colors[type]};">
            ${icons[type]}
          </div>
          <div style="flex: 1; color: #1f2937; font-size: 14px; line-height: 1.5;">
            ${this.escapeHtml(message)}
          </div>
          <button class="notification-close" style="
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            font-size: 20px;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <i class="ri-close-line"></i>
          </button>
        </div>
      `;

      if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
          }
          .notification-close:hover { color: #4b5563 !important; }
        `;
        document.head.appendChild(style);
      }

      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => {
        this.removeNotification(notification);
      });

      this.container.appendChild(notification);

      if (duration > 0) {
        setTimeout(() => {
          this.removeNotification(notification);
        }, duration);
      }

      return notification;
    }

    removeNotification(notification) {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    success(message, duration = 4000) {
      return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
      return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
      return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
      return this.show(message, 'info', duration);
    }

    clearAll() {
      if (this.container) {
        this.container.innerHTML = '';
      }
    }
  }

  window.notification = new Notification();
  console.log('Notification component loaded');
})();
