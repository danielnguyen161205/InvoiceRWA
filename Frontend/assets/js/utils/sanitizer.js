/**
 * XSS Prevention Utilities
 * Sanitizes user input to prevent XSS attacks
 */

class Sanitizer {
  /**
   * Escape HTML special characters
   */
  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
      return String(unsafe);
    }

    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Unescape HTML special characters
   */
  unescapeHtml safe) {
    const div = document.createElement('div');
    div.innerHTML = safe;
    return div.textContent || div.innerText || '';
  }

  /**
   * Escape HTML for use in textContent (safer alternative)
   */
  setText(element, text) {
    if (element && element.textContent !== undefined) {
      element.textContent = text;
      return element;
    }
    return null;
  }

  /**
   * Sanitize HTML using a whitelist approach
   * Allows only safe HTML tags and attributes
   */
  sanitizeHtml(dirty, options = {}) {
    const {
      allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'span', 'div'],
      allowedAttributes = {
        '*': ['class', 'id'],
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height']
      }
    } = options;

    // Create a temporary element to parse HTML
    const template = document.createElement('template');
    template.innerHTML = dirty.trim();
    const sanitized = template.content;

    // Remove disallowed elements
    const walker = document.createTreeWalker(
      sanitized,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToRemove = [];
    let node;

    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check if tag is allowed
        if (!allowedTags.includes(node.tagName.toLowerCase())) {
          nodesToRemove.push(node);
          continue;
        }

        // Remove disallowed attributes
        const attrs = node.attributes;
        for (let i = attrs.length - 1; i >= 0; i--) {
          const attr = attrs[i];
          const tagName = node.tagName.toLowerCase();
          const attrName = attr.name.toLowerCase();

          // Check if attribute is allowed for this tag
          const tagAllowedAttrs = allowedAttributes[tagName] || allowedAttributes['*'] || [];
          const globalAllowedAttrs = allowedAttributes['*'] || [];

          if (!tagAllowedAttrs.includes(attrName) && !globalAllowedAttrs.includes(attrName)) {
            node.removeAttribute(attr.name);
          }

          // Sanitize attribute values
          if (attrName === 'href' || attrName === 'src') {
            // Prevent javascript: and data: URLs
            if (attr.value.toLowerCase().startsWith('javascript:') ||
                attr.value.toLowerCase().startsWith('data:') ||
                attr.value.toLowerCase().startsWith('vbscript:')) {
              node.removeAttribute(attr.name);
            }
          }
        }
      }
    }

    // Remove disallowed nodes
    nodesToRemove.forEach(node => node.remove());

    return sanitized.innerHTML;
  }

  /**
   * Sanitize URL to prevent javascript: and other dangerous protocols
   */
  sanitizeUrl(url) {
    if (typeof url !== 'string') return '';

    // Check for dangerous protocols
    const dangerous = ['javascript:', 'vbscript:', 'data:', 'file:', 'about:'];
    const lowerUrl = url.toLowerCase().trim();

    for (const protocol of dangerous) {
      if (lowerUrl.startsWith(protocol)) {
        return '#';
      }
    }

    // Allow http, https, mailto, tel, relative paths
    return url;
  }

  /**
   * Create safe DOM element from HTML string
   */
  createElement(html, tagName = 'div') {
    const element = document.createElement(tagName);
    element.innerHTML = this.sanitizeHtml(html);
    return element;
  }

  /**
   * Check if a string contains potentially dangerous content
   */
  isSuspicious(input) {
    if (typeof input !== 'string') return false;

    const dangerous = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /onmouseover=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\(/i,
      /fromCharCode/i,
      /<svg/i
    ];

    return dangerous.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize object keys and values recursively
   */
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? this.escapeHtml(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.escapeHtml(key);
      sanitized[sanitizedKey] = this.sanitizeObject(value);
    }

    return sanitized;
  }

  /**
   * Create a CSP (Content Security Policy) meta tag
   */
  setCSP(directives = {}) {
    const defaultDirectives = {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data: https:",
      'font-src': "'self' https://cdnjs.cloudflare.com",
      'connect-src': "'self' http://127.0.0.1:8000",
      'frame-ancestors': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'"
    };

    const merged = { ...defaultDirectives, ...directives };
    const cspString = Object.entries(merged)
      .map(([key, value]) => `${key} ${value}`)
      .join('; ');

    let meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      document.head.prepend(meta);
    }
    meta.content = cspString;
  }

  /**
   * Validate and sanitize file upload
   */
  sanitizeFile(file) {
    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large');
    }

    // Check filename for suspicious patterns
    if (this.isSuspicious(file.name)) {
      throw new Error('Invalid filename');
    }

    return file;
  }

  /**
   * Safe alternative to innerHTML
   * Always prefer this over element.innerHTML = ...
   */
  setHTML(element, html) {
    if (!element) return;
    element.innerHTML = this.sanitizeHtml(html);
    return element;
  }
}

// Global instance
export const sanitizer = new Sanitizer();

// Export for non-module scripts
if (typeof window !== 'undefined') {
  window.sanitizer = sanitizer;
  // Convenience functions
  window.escapeHtml = (text) => sanitizer.escapeHtml(text);
  window.sanitizeHtml = (html) => sanitizer.sanitizeHtml(html);
  window.sanitizeUrl = (url) => sanitizer.sanitizeUrl(url);
  window.setSafeHTML = (el, html) => sanitizer.setHTML(el, html);
}

export default sanitizer;
