/**
 * Application Constants
 * Centralized constants for the application
 */

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CACHE_TIMEOUT: 60000 // 1 minute
};

// User Roles
const USER_ROLES = {
  ADMIN: 'ADMIN',
  SME: 'SME',
  BUYER: 'BUYER',
  BANK: 'BANK'
};

// Invoice Statuses
const INVOICE_STATUS = {
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
const ORG_STATUS = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

// Organization Types
const ORG_TYPES = {
  SME: 'SME',
  BUYER: 'BUYER',
  BANK: 'BANK'
};

// Funding Categories
const FUNDING_CATEGORIES = {
  WORKING_CAPITAL: 'working_capital',
  EXPANSION: 'expansion',
  PURCHASE_MATERIALS: 'purchase_materials',
  PAY_SALARY: 'pay_salary',
  OTHER: 'other'
};

// Recourse Types
const RECOURSE_TYPES = {
  WITH_RECOURSE: 1,
  WITHOUT_RECOURSE: 0
};

// Dispute Methods
const DISPUTE_METHODS = {
  VIAC: 'VIAC',
  COURT: 'COURT',
  ARBITRATION: 'ARBITRATION'
};

// Currency Codes
const CURRENCIES = {
  VND: 'VND',
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
  GBP: 'GBP',
  CNY: 'CNY'
};

// Page Routes
const ROUTES = {
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
const DASHBOARD_ROUTES = {
  [USER_ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [USER_ROLES.BANK]: ROUTES.BANK_DASHBOARD,
  [USER_ROLES.SME]: ROUTES.SME_DASHBOARD,
  [USER_ROLES.BUYER]: ROUTES.BUYER_DASHBOARD
};

// File Upload Limits
const FILE_UPLOAD = {
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
const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100]
};

// Date Formats
const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  ISO_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss'
};

// Regex Patterns
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_VN: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
  TAX_ID: /^\d{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  URL: /^https?:\/\/.+/
};

// Error Messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi. Vui lòng thử lại.'
};

// Success Messages
const SUCCESS_MESSAGES = {
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
const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  APP_STATE: 'appState',
  ERROR_LOG: 'errorLog',
  PREFERENCES: 'preferences'
};

// Session Storage Keys
const SESSION_KEYS = {
  TOKEN: 'token',
  LAST_ACTIVITY: 'lastActivity',
  REDIRECT_URL: 'redirectUrl'
};

// Notification Types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Auto-refresh Intervals (milliseconds)
const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
    BUYER_LIST: 30000, // 30 seconds
  NOTIFICATIONS: 60000 // 1 minute
};

// Feature Flags
const FEATURES = {
  ENABLE_WEBCAM_SCAN: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_I18N: true,
  ENABLE_ANIMATIONS: true,
  ENABLE_AUTO_REFRESH: true
};

// Supported Languages
const LANGUAGES = {
  VI: 'vi',
  EN: 'en'
};

// Default Settings
const DEFAULT_SETTINGS = {
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

// Export all constants to window for non-module scripts
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  window.USER_ROLES = USER_ROLES;
  window.INVOICE_STATUS = INVOICE_STATUS;
  window.ORG_STATUS = ORG_STATUS;
  window.ORG_TYPES = ORG_TYPES;
  window.FUNDING_CATEGORIES = FUNDING_CATEGORIES;
  window.RECOURSE_TYPES = RECOURSE_TYPES;
  window.DISPUTE_METHODS = DISPUTE_METHODS;
  window.CURRENCIES = CURRENCIES;
  window.ROUTES = ROUTES;
  window.DASHBOARD_ROUTES = DASHBOARD_ROUTES;
  window.FILE_UPLOAD = FILE_UPLOAD;
  window.PAGINATION = PAGINATION;
  window.DATE_FORMATS = DATE_FORMATS;
  window.PATTERNS = PATTERNS;
  window.ERROR_MESSAGES = ERROR_MESSAGES;
  window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.SESSION_KEYS = SESSION_KEYS;
  window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
  window.REFRESH_INTERVALS = REFRESH_INTERVALS;
  window.FEATURES = FEATURES;
  window.LANGUAGES = LANGUAGES;
  window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
}
