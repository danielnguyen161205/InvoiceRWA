function requireAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/pages/login.html";
    return;
  }

  // Check token expiration
  const payload = JSON.parse(atob(token.split(".")[1]));
  const now = Date.now() / 1000;

  if (payload.exp < now) {
    localStorage.removeItem("token");
    window.location.href = "/pages/login.html";
    return;
  }

  // Check KYC verification status for all users except ADMIN
  const roles = payload.roles || (payload.role ? [payload.role] : []);
  const kycVerified = payload.kyc_verified || false;
  const currentPage = window.location.pathname;

  // Allow ADMIN to access any page without KYC
  if (roles.includes("ADMIN")) {
    return;
  }

  // Allow profile page access for everyone (so they can complete KYC/KYB)
  if (currentPage.includes('/profile.html')) {
    return;
  }

  // If not verified and trying to access dashboard, redirect to profile
  if (!kycVerified) {
    window.location.href = "/pages/profile.html";
    return;
  }
}
