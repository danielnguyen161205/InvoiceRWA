/**
 * Application Constants
 * Centralized constants for the application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CACHE_TIMEOUT: 60000 // 1 minute
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SME: 'SME',
  BUYER: 'BUYER',
  BANK: 'BANK'
};

// Invoice Statuses
export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  EDITING: 'EDITING',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FINANCED: 'FINANCED',
  PAID: 'PAID',
  SETTLED: 'SETTLED'
};

// Organization Statuses
export const ORG_STATUS = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

// Organization Types
export const ORG_TYPES = {
  SME: 'SME',
  BUYER: 'BUYER',
  BANK: 'BANK'
};

// Funding Categories
export const FUNDING_CATEGORIES = {
  WORKING_CAPITAL: 'working_capital',
  EXPANSION: 'expansion',
  PURCHASE_MATERIALS: 'purchase_materials',
  PAY_SALARY: 'pay_salary',
  OTHER: 'other'
};

// Recourse Types
export const RECOURSE_TYPES = {
  WITH_RECOURSE: 1,
  WITHOUT_RECOURSE: 0
};

// Dispute Methods
export const DISPUTE_METHODS = {
  VIAC: 'VIAC',
  COURT: 'COURT',
  ARBITRATION: 'ARBITRATION'
};

// Currency Codes
export const CURRENCIES = {
  VND: 'VND',
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
  GBP: 'GBP',
  CNY: 'CNY'
};

// Page Routes
export const ROUTES = {
  LOGIN: '/pages/login.html',
  REGISTER: '/pages/register.html',
  SME_DASHBOARD: '/pages/sme-dashboard.html',
  BUYER_DASHBOARD: '/pages/sme-dashboard.html',
  ADMIN_DASHBOARD: '/pages/admin-dashboard.html',
  BANK_DASHBOARD: '/pages/bank-dashboard.html',
  PROFILE: '/pages/profile.html',
  KYC_VERIFICATION: '/pages/kyc-verification.html',
  KYB_VERIFICATION: '/pages/kyb-verification.html',
  KYC_ONBOARD: '/pages/kyc-onboard.html',
  BANK_REVIEW: '/pages/bank-review.html',
  INVOICE_DETAIL: '/pages/invoice-detail.html'
};

// Dashboard routes by role
export const DASHBOARD_ROUTES = {
  [USER_ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [USER_ROLES.BANK]: ROUTES.BANK_DASHBOARD,
  [USER_ROLES.SME]: ROUTES.SME_DASHBOARD,
  [USER_ROLES.BUYER]: ROUTES.BUYER_DASHBOARD
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100]
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  ISO_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss'
};

// Regex Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_VN: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
  TAX_ID: /^\d{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  URL: /^https?:\/\/.+/
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi. Vui lòng thử lại.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Đăng nhập thành công!',
  LOGOUT: 'Đăng xuất thành công!',
  REGISTER: 'Đăng ký thành công!',
  PROFILE_UPDATED: 'Cập nhật thông tin thành công!',
  PASSWORD_CHANGED: 'Đổi mật khẩu thành công!',
  INVOICE_CREATED: 'Tạo hóa đơn thành công!',
  INVOICE_UPDATED: 'Cập nhật hóa đơn thành công!',
  INVOICE_SUBMITTED: 'Gửi hóa đơn thành công!',
  FILE_UPLOADED: 'Tải lên thành công!'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  APP_STATE: 'appState',
  ERROR_LOG: 'errorLog',
  PREFERENCES: 'preferences'
};

// Session Storage Keys
export const SESSION_KEYS = {
  TOKEN: 'token',
  LAST_ACTIVITY: 'lastActivity',
  REDIRECT_URL: 'redirectUrl'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Auto-refresh Intervals (milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
    BUYER_LIST: 30000, // 30 seconds
  NOTIFICATIONS: 60000 // 1 minute
};

// Feature Flags
export const FEATURES = {
  ENABLE_WEBCAM_SCAN: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_I18N: true,
  ENABLE_ANIMATIONS: true,
  ENABLE_AUTO_REFRESH: true
};

// Supported Languages
export const LANGUAGES = {
  VI: 'vi',
  EN: 'en'
};

// Default Settings
export const DEFAULT_SETTINGS = {
  language: LANGUAGES.VI,
  theme: 'light',
  notifications: true,
  autoRefresh: true
};

// Export for non-module scripts
if (typeof window !== 'undefined') {
  window.APP_CONFIG = {
    API_URL: API_CONFIG.BASE_URL,
    USER_ROLES,
    INVOICE_STATUS,
    ORG_STATUS,
    ROUTES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
  };
}

export default {
  API_CONFIG,
  USER_ROLES,
  INVOICE_STATUS,
  ORG_STATUS,
  ROUTES,
  FILE_UPLOAD,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
