/**
 * Sanitizer Utility
 */

(function() {
  'use strict';

  class Sanitizer {
    escapeHtml(str) {
      if (typeof str !== 'string') return str;
      
      const htmlEscapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
      };
      
      return str.replace(/[&<>"'/]/g, char => htmlEscapeMap[char]);
    }

    stripHtml(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/<[^>]*>/g, '');
    }

    sanitize(str, options = {}) {
      const {
        allowHtml = false,
        maxLength = null,
        trim = true
      } = options;

      if (typeof str !== 'string') return str;

      let result = str;

      if (trim) {
        result = result.trim();
      }

      if (!allowHtml) {
        result = this.stripHtml(result);
      }

      result = this.escapeHtml(result);

      if (maxLength && result.length > maxLength) {
        result = result.substring(0, maxLength);
      }

      return result;
    }

    sanitizeEmail(email) {
      if (typeof email !== 'string') return null;
      
      email = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        return null;
      }
      
      return email;
    }

    sanitizeUrl(url) {
      if (typeof url !== 'string') return null;
      
      url = url.trim();
      const allowedProtocols = ['http:', 'https:'];
      
      try {
        const parsed = new URL(url);
        if (!allowedProtocols.includes(parsed.protocol)) {
          return null;
        }
        return url;
      } catch (e) {
        return null;
      }
    }
  }

  window.sanitizer = new Sanitizer();
  console.log('Sanitizer utility loaded');
})();
