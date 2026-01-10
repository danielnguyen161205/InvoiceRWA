/**
 * Validator Utilities
 * Form validation functions with Vietnamese error messages
 */

class Validators {
  /**
   * Validate required field
   */
  required(value, message = 'Trường này là bắt buộc') {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate email
   */
  email(value, message = 'Email không hợp lệ') {
    if (!value) return { valid: true }; // Skip if empty (use required validator)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate phone number (Vietnamese)
   */
  phone(value, message = 'Số điện thoại không hợp lệ') {
    if (!value) return { valid: true };

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    const cleaned = value.replace(/\s/g, '');

    if (!phoneRegex.test(cleaned)) {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate tax ID (Vietnamese - 10 digits)
   */
  taxId(value, message = 'Mã số thuế phải có 10 chữ số') {
    if (!value) return { valid: true };

    const taxIdRegex = /^\d{10}$/;
    if (!taxIdRegex.test(value.replace(/\s/g, ''))) {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate minimum length
   */
  minLength(value, min, message) {
    if (!value) return { valid: true };

    if (value.length < min) {
      return {
        valid: false,
        message: message || `Phải có ít nhất ${min} ký tự`
      };
    }
    return { valid: true };
  }

  /**
   * Validate maximum length
   */
  maxLength(value, max, message) {
    if (!value) return { valid: true };

    if (value.length > max) {
      return {
        valid: false,
        message: message || `Không được vượt quá ${max} ký tự`
      };
    }
    return { valid: true };
  }

  /**
   * Validate number range
   */
  between(value, min, max, message) {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return { valid: false, message: 'Giá trị không hợp lệ' };
    }

    if (num < min || num > max) {
      return {
        valid: false,
        message: message || `Phải từ ${min} đến ${max}`
      };
    }
    return { valid: true };
  }

  /**
   * Validate minimum value
   */
  min(value, min, message) {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return { valid: false, message: 'Giá trị không hợp lệ' };
    }

    if (num < min) {
      return {
        valid: false,
        message: message || `Phải lớn hơn hoặc bằng ${min}`
      };
    }
    return { valid: true };
  }

  /**
   * Validate maximum value
   */
  max(value, max, message) {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return { valid: false, message: 'Giá trị không hợp lệ' };
    }

    if (num > max) {
      return {
        valid: false,
        message: message || `Phải nhỏ hơn hoặc bằng ${max}`
      };
    }
    return { valid: true };
  }

  /**
   * Validate date is not in the past
   */
  futureDate(value, message = 'Ngày không được ở trong quá khứ') {
    if (!value) return { valid: true };

    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate date range (end date >= start date)
   */
  dateRange(startDate, endDate, message = 'Ngày kết thúc phải sau ngày bắt đầu') {
    if (!startDate || !endDate) return { valid: true };

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate password strength
   */
  password(value, message = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số') {
    if (!value) return { valid: true };

    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(value)) {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate passwords match
   */
  passwordMatch(password, confirmPassword, message = 'Mật khẩu xác nhận không khớp') {
    if (!password || !confirmPassword) return { valid: true };

    if (password !== confirmPassword) {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate URL
   */
  url(value, message = 'URL không hợp lệ') {
    if (!value) return { valid: true };

    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, message };
    }
  }

  /**
   * Validate file type
   */
  fileType(file, allowedTypes, message) {
    if (!file) return { valid: true };

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: message || `Chỉ chấp nhận các định dạng: ${allowedTypes.join(', ')}`
      };
    }
    return { valid: true };
  }

  /**
   * Validate file size
   */
  fileSize(file, maxSizeBytes, message) {
    if (!file) return { valid: true };

    if (file.size > maxSizeBytes) {
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        message: message || `Kích thước file không được vượt quá ${maxSizeMB}MB`
      };
    }
    return { valid: true };
  }

  /**
   * Validate invoice amount (positive number)
   */
  invoiceAmount(value, message = 'Giá trị hóa đơn phải lớn hơn 0') {
    const amount = parseFloat(value);

    if (isNaN(amount) || amount <= 0) {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate percentage (0-100)
   */
  percentage(value, message = 'Giá trị phải từ 0 đến 100') {
    return this.between(value, 0, 100, message);
  }

  /**
   * Validate LTV ratio (0-100)
   */
  ltv(value, message = 'LTV phải từ 0 đến 100%') {
    return this.percentage(value, message);
  }

  /**
   * Validate discount rate (0-100)
   */
  discountRate(value, message = 'Lãi suất chiết khấu phải từ 0 đến 100%') {
    return this.percentage(value, message);
  }

  /**
   * Validate payment term (positive integer)
   */
  paymentTerm(value, message = 'Thời hạn thanh toán phải là số nguyên dương') {
    const term = parseInt(value);

    if (isNaN(term) || term <= 0) {
      return { valid: false, message };
    }
    return { valid: true };
  }

  /**
   * Validate a form field and show error
   */
  validateField(field, rules, options = {}) {
    const { showInline = true, errorClass = 'border-red-500', errorElementId = null } = options;
    const value = field.value;

    for (const rule of rules) {
      const result = rule(value);
      if (!result.valid) {
        // Add error class to field
        field.classList.add(errorClass);
        field.setAttribute('aria-invalid', 'true');

        // Show inline error message
        if (showInline) {
          let errorEl;
          if (errorElementId) {
            errorEl = document.getElementById(errorElementId);
          } else {
            // Find or create error element
            errorEl = field.parentNode.querySelector('.error-message');
            if (!errorEl) {
              errorEl = document.createElement('span');
              errorEl.className = 'error-message text-red-500 text-sm mt-1';
              field.parentNode.appendChild(errorEl);
            }
          }

          if (errorEl) {
            errorEl.textContent = result.message;
            errorEl.style.display = 'block';
          }
        }

        return { valid: false, message: result.message };
      }
    }

    // Clear error
    field.classList.remove(errorClass);
    field.removeAttribute('aria-invalid');

    if (showInline) {
      let errorEl;
      if (errorElementId) {
        errorEl = document.getElementById(errorElementId);
      } else {
        errorEl = field.parentNode.querySelector('.error-message');
      }
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    }

    return { valid: true };
  }

  /**
   * Validate entire form
   */
  validateForm(form, schema) {
    const errors = [];
    let isValid = true;

    for (const [fieldName, rules] of Object.entries(schema)) {
      const field = form.querySelector(`[name="${fieldName}"]`) ||
                   document.getElementById(fieldName);

      if (!field) continue;

      const result = this.validateField(field, rules, { showInline: true });

      if (!result.valid) {
        isValid = false;
        errors.push({ field: fieldName, message: result.message });
      }
    }

    return {
      valid: isValid,
      errors
    };
  }

  /**
   * Clear all validation errors from a form
   */
  clearErrors(form) {
    const fields = form.querySelectorAll('[aria-invalid="true"]');
    fields.forEach(field => {
      field.classList.remove('border-red-500');
      field.removeAttribute('aria-invalid');
    });

    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  }
}

// Global instance
export const validator = new Validators();

// Export for non-module scripts
if (typeof window !== 'undefined') {
  window.validator = validator;
  // Convenience functions
  window.validateRequired = (value) => validator.required(value);
  window.validateEmail = (value) => validator.email(value);
  window.validatePhone = (value) => validator.phone(value);
}

export default validator;
