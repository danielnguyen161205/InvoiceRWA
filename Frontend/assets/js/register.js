const API_URL = "http://127.0.0.1:8000";

async function register(event) {
  event && event.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('loginPass').value;
  const confirm = document.getElementById('confirmPass').value;
  const role = document.getElementById('userRole').value;

  if (!name || !email || !password || !confirm) {
    alert('Please fill in all fields');
    return;
  }

  if (!role) {
    alert('Please select your role');
    return;
  }

  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }

  // Send roles as array to support multiple roles server-side
  const res = await fetch(API_URL + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: [role] })
  });

  if (!res.ok) {
    const txt = await res.text();
    alert('Register failed: ' + txt);
    return;
  }

  const data = await res.json();
  // Store token and redirect to profile page
  localStorage.setItem('token', data.access_token);
  
  let message = 'Registration successful! ';
  if (role === 'BANK') {
    message += 'Please complete KYB (Know Your Business) verification in your profile to access the invoice marketplace.';
  } else if (role === 'SME' || role === 'BUYER') {
    message += 'Please complete KYC (Know Your Customer) verification in your profile to continue.';
  }
  
  alert(message);
  window.location.href = '/pages/profile.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (form) form.addEventListener('submit', register);
});
