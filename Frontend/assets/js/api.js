const API_URL = "http://127.0.0.1:8000";

function getToken() {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
}

function logout() {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}

async function apiFetch(path, options = {}) {
  // Ensure path ends with / to avoid 307 redirects
  if (!path.endsWith('/') && !path.includes('?') && path.includes('/api/') && !path.match(/\/\d+$/)) {
    path = path + '/';
  }
  
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

