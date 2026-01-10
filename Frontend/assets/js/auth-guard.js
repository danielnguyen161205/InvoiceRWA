/**
 * Authentication Guard
 * Protects pages by requiring authentication and KYC verification
 * Updated to use secure token storage (sessionStorage preferred)
 */

/**
 * Get current access token (sessionStorage preferred, fallback to localStorage)
 */
function getToken() {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
}

/**
 * Decode JWT payload
 */
function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(atob(base64).split("").map((c) => {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token) {
  if (!token) return true;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  const now = Date.now() / 1000;
  return payload.exp < now;
}

/**
 * Logout and redirect to login
 */
function logout() {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");

  // Show notification if available
  if (window.notification) {
    window.notification.info("Phiên đăng nhập đã hết hạn");
  }

  window.location.href = "/pages/login.html";
}

/**
 * Require authentication for current page
 * Redirects to login if not authenticated or token expired
 * Redirects to profile if KYC not completed (except ADMIN)
 */
function requireAuth() {
  // Get token from sessionStorage first (more secure), then localStorage
  const token = getToken();

  if (!token) {
    logout();
    return false;
  }

  // Check token expiration
  if (isTokenExpired(token)) {
    logout();
    return false;
  }

  // Decode token to get user info
  const payload = decodeToken(token);
  if (!payload) {
    logout();
    return false;
  }

  // Check KYC verification status for all users except ADMIN
  const roles = payload.roles || (payload.role ? [payload.role] : []);
  const kycVerified = payload.kyc_verified || false;
  const currentPage = window.location.pathname;

  // Allow ADMIN to access any page without KYC
  if (roles.includes("ADMIN")) {
    return true;
  }

  // Allow profile page access for everyone (so they can complete KYC/KYB)
  if (currentPage.includes('/profile.html')) {
    return true;
  }

  // If not verified and trying to access dashboard, redirect to profile
  if (!kycVerified) {
    if (window.notification) {
      window.notification.info("Vui lòng hoàn thành xác thực KYC trước khi tiếp tục");
    }
    window.location.href = "/pages/profile.html";
    return false;
  }

  return true;
}

/**
 * Get current user info from token
 */
function getCurrentUser() {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    return null;
  }

  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    username: payload.username || payload.preferred_username,
    roles: payload.roles || (payload.role ? [payload.role] : []),
    kycVerified: payload.kyc_verified || false,
    orgStatus: payload.org_status,
    exp: payload.exp
  };
}

/**
 * Check if current user has a specific role
 */
function hasRole(role) {
  const user = getCurrentUser();
  return user && user.roles && user.roles.includes(role);
}

/**
 * Check if current user has any of the specified roles
 */
function hasAnyRole(roles) {
  const user = getCurrentUser();
  if (!user || !user.roles) return false;
  return roles.some(role => user.roles.includes(role));
}

// Export for non-module scripts
if (typeof window !== 'undefined') {
  window.getCurrentUser = getCurrentUser;
  window.hasRole = hasRole;
  window.hasAnyRole = hasAnyRole;
}

export { getToken, decodeToken, isTokenExpired, logout, getCurrentUser, hasRole, hasAnyRole };
export default requireAuth;
