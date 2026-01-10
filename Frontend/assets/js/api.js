// Configure API URL based on environment
// For development, uses localhost. For production, configure accordingly.
let API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://127.0.0.1:8000"
    : window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

// Override with environment variable if set (for custom deployments)
if (window.env && window.env.API_URL) {
    API_URL = window.env.API_URL;
}

function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
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

  return res.json();
}

