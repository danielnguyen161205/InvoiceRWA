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
  if (!payload) return true;
  
  // If no exp field, token never expires (for development)
  if (!payload.exp) {
    console.log("⚠️ Token has no expiration time - treating as valid");
    return false;
  }

  const now = Date.now() / 1000;
  const expired = payload.exp < now;
  console.log(`⏰ Token exp: ${payload.exp}, Now: ${now}, Expired: ${expired}`);
  return expired;
}

/**
 * Logout and redirect to login
 */
function logout() {
  console.log("🚪 logout() called - clearing tokens");
  console.trace("Logout called from:");
  
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");

  // Show notification if available
  if (window.notification) {
    window.notification.info("Phiên đăng nhập đã hết hạn");
  }

  console.log("🔄 Redirecting to login...");
  window.location.href = "./login.html";
}

/**
 * Require authentication for current page
 * Redirects to login if not authenticated or token expired
 * Redirects to profile if KYC not completed (except ADMIN)
 */
function requireAuth() {
  console.log("🔒 requireAuth() called");
  console.log("📍 Current page:", window.location.pathname);
  console.log("🕐 Timestamp:", new Date().toISOString());
  
  // Get token from sessionStorage first (more secure), then localStorage  
  const token = getToken();
  console.log("🎫 Token found:", token ? "YES" : "NO");
  
  if (token) {
    console.log("🎫 Token preview:", token.substring(0, 50) + "...");
  }

  if (!token) {
    console.log("❌ No token found - redirecting to login");
    logout();
    return false;
  }

  // Check token expiration
  if (isTokenExpired(token)) {
    console.log("❌ Token expired - redirecting to login");
    logout();
    return false;
  }

  // Decode token to get user info
  const payload = decodeToken(token);
  if (!payload) {
    console.log("❌ Cannot decode token - redirecting to login");
    logout();
    return false;
  }

  console.log("✅ Token valid - User:", payload.email, "Roles:", payload.roles);

  // Check KYC verification status for all users except ADMIN
  const roles = payload.roles || (payload.role ? [payload.role] : []);
  const kycVerified = payload.kyc_verified || false;
  const currentPage = window.location.pathname;

  // Allow ADMIN to access any page without KYC
  if (roles.includes("ADMIN")) {
    console.log("👑 Admin user - access granted");
    return true;
  }

  // Allow profile page access for everyone (so they can complete KYC/KYB)
  if (currentPage.includes('/profile.html')) {
    console.log("📄 Profile page - access granted");
    return true;
  }

  // If not verified and trying to access dashboard, redirect to profile
  if (!kycVerified) {
    console.log("⚠️ KYC not verified - redirecting to profile");
    if (window.notification) {
      window.notification.info("Vui lòng hoàn thành xác thực KYC trước khi tiếp tục");
    }
    window.location.href = "./profile.html";
    return false;
  }

  console.log("✅ All checks passed - access granted");
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
  window.getToken = getToken;
  window.decodeToken = decodeToken;
  window.isTokenExpired = isTokenExpired;
  window.logout = logout;
  window.getCurrentUser = getCurrentUser;
  window.hasRole = hasRole;
  window.hasAnyRole = hasAnyRole;
  window.requireAuth = requireAuth;
}
