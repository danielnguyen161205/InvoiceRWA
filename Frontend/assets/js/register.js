const API_URL = "http://127.0.0.1:8000";

// Password strength checker
function checkPasswordStrength(password) {
  let strength = 0;
  let feedback = [];

  if (password.length >= 8) strength++;
  else feedback.push("Ít nhất 8 ký tự / At least 8 characters");

  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  else feedback.push("Chữ hoa và thường / Upper and lower case");

  if (/\d/.test(password)) strength++;
  else feedback.push("Số / Numbers");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  else feedback.push("Ký tự đặc biệt / Special characters");

  return { strength, feedback };
}

// Update password strength indicator
function updatePasswordStrength(password) {
  const container = document.getElementById('passwordStrength');
  const bar = document.getElementById('strengthBar');
  const text = document.getElementById('strengthText');

  if (!password) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  const { strength, feedback } = checkPasswordStrength(password);

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const widths = ['20%', '40%', '60%', '80%', '100%'];
  const labels = ['Yếu / Weak', 'Khá / Fair', 'Trung bình / Medium', 'Mạnh / Strong', 'Rất mạnh / Very Strong'];

  bar.className = `h-full transition-all duration-300 ${colors[strength - 1] || 'bg-red-500'}`;
  bar.style.width = widths[strength - 1] || '20%';

  const remainingTips = feedback.slice(0, 3).join(', ');
  text.textContent = strength === 5
    ? `✅ Mật khẩu mạnh! / Strong password!`
    : `${labels[strength - 1]} (${strength}/5) - Mẹo: ${remainingTips}`;

  // Show remaining tips in list if weak
  if (strength < 3) {
    const list = document.createElement('ul');
    list.className = 'text-xs text-gray-600 mt-1 list-disc list-inside';
    feedback.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      list.appendChild(li);
    });
    text.appendChild(list);
  }
}

// Show form errors
function showFormErrors(errors) {
  const container = document.getElementById('formErrors');
  const list = document.getElementById('errorList');

  if (errors.length === 0) {
    container.classList.add('hidden');
    return;
  }

  list.innerHTML = '';
  errors.forEach(error => {
    const li = document.createElement('li');
    li.textContent = error;
    list.appendChild(li);
  });

  container.classList.remove('hidden');
}

async function register(event) {
  event && event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const organizationName = document.getElementById('organizationName').value.trim();
  const password = document.getElementById('loginPass').value;
  const confirm = document.getElementById('confirmPass').value;
  const role = document.getElementById('userRole').value;

  // Validation
  const errors = [];

  if (!name) errors.push('Vui lòng nhập họ tên / Please enter your full name');
  if (!email) errors.push('Vui lòng nhập email / Please enter email');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email không hợp lệ / Invalid email format');
  }
  if (!organizationName) errors.push('Vui lòng nhập tên tổ chức / Please enter organization name');
  if (!password) errors.push('Vui lòng nhập mật khẩu / Please enter password');
  if (!confirm) errors.push('Vui lòng xác nhận mật khẩu / Please confirm password');
  if (!role) errors.push('Vui lòng chọn vai trò / Please select your role');

  if (password !== confirm) {
    errors.push('Mật khẩu không khớp / Passwords do not match');
  }

  if (password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự / Password must be at least 6 characters');
  }

  showFormErrors(errors);
  if (errors.length > 0) {
    // Scroll to error container
    document.getElementById('formErrors').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Show loading state
  const btn = document.getElementById('registerBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `
    <svg class="animate-spin h-5 w-5 mr-2 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Processing...
  `;

  try {
    // Send registration request with organization_name
    const res = await fetch(API_URL + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: name,
        organization_name: organizationName,
        role: [role]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || 'Đăng ký thất bại / Registration failed');
    }

    // Store token
    localStorage.setItem('token', data.access_token);

    // Show success notification
    if (window.notification) {
      window.notification.success(
        'Đăng ký thành công! / Registration successful!',
        5000
      );
    } else {
      alert('✅ Đăng ký thành công! / Registration successful!');
    }

    // Redirect with appropriate message
    let message = 'Đăng ký thành công! / Registration successful! ';
    if (role === 'BANK') {
      message += '\n\nVui lòng hoàn thành xác minh KYB (Know Your Business) trong hồ sơ để tiếp tục.\n\nPlease complete KYB (Know Your Business) verification in your profile to continue.';
    } else if (role === 'SME') {
      message += '\n\nVui lòng hoàn thành xác minh KYC (Know Your Customer) trong hồ sơ để tiếp tục.\n\nPlease complete KYC (Know Your Customer) verification in your profile to continue.';
    }

    alert(message);

    // Redirect to profile page for KYC/KYB
    setTimeout(() => {
      window.location.href = '/pages/profile.html';
    }, 500);

  } catch (error) {
    console.error('Registration error:', error);

    // Show error notification
    if (window.notification) {
      window.notification.error(error.message, 5000);
    } else {
      alert('❌ ' + error.message);
    }

    showFormErrors([error.message]);

    // Reset button
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (form) {
    form.addEventListener('submit', register);
  }

  // Password strength listener
  const passwordInput = document.getElementById('loginPass');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value);
    });
  }

  // Toggle password visibility
  const eyeIcon = document.getElementById('loginEye');
  if (eyeIcon) {
    eyeIcon.addEventListener('click', () => {
      const passwordInput = document.getElementById('loginPass');
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;

      // Toggle icon
      eyeIcon.className = type === 'password'
        ? 'ri-eye-line login__eye'
        : 'ri-eye-off-line login__eye';
    });
  }

  // Real-time email validation
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const email = emailInput.value.trim().toLowerCase();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.classList.add('border-red-500');
        if (window.notification) {
          window.notification.warning('Email không hợp lệ / Invalid email format', 3000);
        }
      } else {
        emailInput.classList.remove('border-red-500');
      }
    });
  }

  // Real-time password match validation
  const confirmInput = document.getElementById('confirmPass');
  if (confirmInput) {
    confirmInput.addEventListener('input', () => {
      const password = passwordInput.value;
      const confirm = confirmInput.value;

      if (confirm && password !== confirm) {
        confirmInput.classList.add('border-red-500');
        confirmInput.classList.remove('border-green-500');
      } else if (confirm && password === confirm) {
        confirmInput.classList.remove('border-red-500');
        confirmInput.classList.add('border-green-500');
      } else {
        confirmInput.classList.remove('border-red-500', 'border-green-500');
      }
    });
  }
});
