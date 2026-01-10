/**
 * Formatter Utilities
 * Common formatting functions for dates, currency, numbers, etc.
 */

class Formatters {
  /**
   * Format currency in VND
   */
  formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format currency in any currency
   */
  formatCurrency(amount, currency = 'VND') {
    const locales = {
      VND: 'vi-VN',
      USD: 'en-US',
      EUR: 'de-DE',
      JPY: 'ja-JP',
      GBP: 'en-GB',
      CNY: 'zh-CN'
    };

    return new Intl.NumberFormat(locales[currency] || 'vi-VN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format number with thousands separator
   */
  formatNumber(number, decimals = 0) {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  }

  /**
   * Format percentage
   */
  formatPercent(value, decimals = 1) {
    return `${this.formatNumber(value, decimals)}%`;
  }

  /**
   * Format date to Vietnamese locale
   */
  formatDate(date, format = 'short') {
    if (!date) return '-';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) return '-';

    const options = {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    };

    return dateObj.toLocaleDateString('vi-VN', options[format] || options.short);
  }

  /**
   * Format date and time
   */
  formatDateTime(date) {
    return this.formatDate(date, 'full');
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(date) {
    if (!date) return '-';

    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' });

    if (diffSecs < 60) return rtf.format(-diffSecs, 'second');
    if (diffMins < 60) return rtf.format(-diffMins, 'minute');
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    if (diffDays < 30) return rtf.format(-diffDays, 'day');

    return this.formatDate(dateObj);
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Format phone number (Vietnamese)
   */
  formatPhoneNumber(phone) {
    if (!phone) return '';

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format: 0XXX XXX XXX
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
  }

  /**
   * Format tax ID (Vietnamese MST)
   */
  formatTaxId(taxId) {
    if (!taxId) return '';

    const cleaned = taxId.replace(/\D/g, '');

    // Format: XXX XXX XXX
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }

    return taxId;
  }

  /**
   * Truncate text with ellipsis
   */
  truncate(text, maxLength = 50, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Format invoice status
   */
  formatInvoiceStatus(status) {
    const statusMap = {
      DRAFT: { text: 'Nháp', class: 'bg-gray-100 text-gray-700' },
      EDITING: { text: 'Đang chỉnh sửa', class: 'bg-yellow-100 text-yellow-700' },
      SUBMITTED: { text: 'Đã gửi', class: 'bg-blue-100 text-blue-700' },
      APPROVED: { text: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
      REJECTED: { text: 'Từ chối', class: 'bg-red-100 text-red-700' },
      FINANCED: { text: 'Đã tài trợ', class: 'bg-purple-100 text-purple-700' },
      PAID: { text: 'Đã thanh toán', class: 'bg-teal-100 text-teal-700' },
      SETTLED: { text: 'Đã thanh lý', class: 'bg-emerald-100 text-emerald-700' }
    };

    return statusMap[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
  }

  /**
   * Format organization status
   */
  formatOrgStatus(status) {
    const statusMap = {
      PENDING: { text: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-700' },
      UNDER_REVIEW: { text: 'Đang xem xét', class: 'bg-blue-100 text-blue-700' },
      APPROVED: { text: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
      REJECTED: { text: 'Từ chối', class: 'bg-red-100 text-red-700' }
    };

    return statusMap[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
  }

  /**
   * Format address components
   */
  formatAddress(address) {
    if (!address) return '';
    const parts = [address.street, address.ward, address.district, address.city, address.country];
    return parts.filter(Boolean).join(', ');
  }

  /**
   * Format duration (e.g., "30 days", "2 months")
   */
  formatDuration(value, unit = 'day') {
    const unitMap = {
      day: { singular: 'ngày', plural: 'ngày' },
      month: { singular: 'tháng', plural: 'tháng' },
      year: { singular: 'năm', plural: 'năm' }
    };

    const unitText = unitMap[unit] ? unitMap[unit].singular : unit;
    return `${value} ${unitText}`;
  }
}

// Global instance and export for non-module scripts
if (typeof window !== 'undefined') {
  window.formatter = new Formatters();
  // Convenience functions
  window.formatVND = (amount) => window.formatter.formatVND(amount);
  window.formatDate = (date) => window.formatter.formatDate(date);
  window.formatDateTime = (date) => window.formatter.formatDateTime(date);
}
