const API_URL = "http://127.0.0.1:8000";

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

