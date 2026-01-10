/**
 * InvoiceRWA Configuration
 * MVP Fix #3: Centralized API configuration to replace hardcoded URLs
 */

// Determine environment based on hostname
const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

// API Configuration
const CONFIG = {
    // API Base URL - Auto-detects environment
    API_BASE_URL: isLocal ? 'http://127.0.0.1:8000' : 'https://api.invoicerwa.com',

    // API Endpoints (derived from base URL)
    API: {
        AUTH: '/api/auth',
        USERS: '/api/users',
        INVOICES: '/api/invoices',
        KYC: '/api/kyc',
        BANK: '/api/bank',
        ADMIN: '/api/admin',
        BLOCKCHAIN: '/api/blockchain',
        NOTIFICATIONS: '/api/notifications'
    },

    // App Configuration
    APP: {
        NAME: 'InvoiceRWA',
        VERSION: '1.0.0-mvp',
        ENVIRONMENT: isLocal ? 'development' : 'production'
    },

    // Timeout settings
    TIMEOUT: {
        DEFAULT: 30000,      // 30 seconds
        UPLOAD: 300000,      // 5 minutes for file uploads
        BLOCKCHAIN: 60000    // 1 minute for blockchain operations
    },

    // Refresh settings
    TOKEN_REFRESH_BEFORE: 300000,  // 5 minutes before expiry

    // Auto-refresh interval
    AUTO_REFRESH_INTERVAL: 30000    // 30 seconds
};

// Helper to get full API URL
CONFIG.getApiUrl = function(endpoint) {
    return CONFIG.API_BASE_URL + endpoint;
};

// Helper to get full endpoint URL
CONFIG.getEndpoint = function(path) {
    if (path.startsWith('http')) {
        return path; // Already absolute URL
    }
    return CONFIG.API_BASE_URL + path;
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
