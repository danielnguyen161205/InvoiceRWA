// Load config - Must be loaded after config.js in HTML
const API_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

function getToken() {
  // FIXED: Check sessionStorage first (more secure), then localStorage for backward compatibility
  return sessionStorage.getItem("token") || localStorage.getItem("token");
}

function logout() {
  // FIXED: Clear both storage locations
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/pages/login.html";
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Authorization": "Bearer " + getToken(),
      "Content-Type": "application/json"
    }
  });

  if (res.status === 401) {
    logout();
    throw new Error('Unauthorized');
  }

  // FIXED: Check if response is ok before parsing JSON
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

