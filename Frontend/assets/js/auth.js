/**
 * Authentication Handler
 * Improved with secure token storage and notification system
 */

// Load config - Must be loaded after config.js in HTML
const API_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

/**
 * Login with email and password
 */
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error");

  // Validate inputs
  if (!email || !password) {
    if (errorEl) errorEl.innerText = "Vui lòng nhập email và mật khẩu";
    if (window.notification) {
      window.notification.error("Vui lòng nhập email và mật khẩu");
    }
    return;
  }

  try {
    const res = await fetch(API_URL + "/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg = errorData.detail || "Đăng nhập thất bại";

      if (errorEl) errorEl.innerText = errorMsg;
      if (window.notification) {
        window.notification.error(errorMsg);
      }
      return;
    }

    const data = await res.json();

    // 1️⃣ Store JWT in sessionStorage (more secure than localStorage)
    sessionStorage.setItem("token", data.access_token);

    // Store refresh token if provided
    if (data.refresh_token) {
      localStorage.setItem("refreshToken", data.refresh_token);
    }

    // 2️⃣ Decode roles from JWT
    const payload = JSON.parse(atob(data.access_token.split(".")[1]));
    const roles = payload.roles || (payload.role ? [payload.role] : []);
    const kycVerified = payload.kyc_verified || false;
    const orgStatus = payload.org_status;

    // 3️⃣ Show success message
    if (window.notification) {
      window.notification.success("Đăng nhập thành công!");
    }

    // 4️⃣ Admin users go directly to admin dashboard (no KYC required)
    if (roles.includes("ADMIN")) {
      window.location.href = "./admin-dashboard.html";
      return;
    }

    // 5️⃣ Bank users need KYB verification - redirect to profile page
    if (roles.includes("BANK") && !kycVerified) {
      window.location.href = "./profile.html";
      return;
    }

    // 6️⃣ SME/BUYER users need KYC - redirect to profile page
    if ((roles.includes("SME") || roles.includes("BUYER")) && !kycVerified) {
      window.location.href = "./profile.html";
      return;
    }

    // 7️⃣ If verified, redirect based on role: BANK -> SME -> BUYER
    if (roles.includes("BANK")) {
      window.location.href = "./bank-dashboard.html";
    } else if (roles.includes("SME")) {
      window.location.href = "./sme-dashboard.html";
    } else if (roles.includes("BUYER")) {
      window.location.href = "./sme-dashboard.html";
    } else {
      if (window.notification) {
        window.notification.error("Vai trò không được xác định");
      } else {
        alert("Unknown role");
      }
    }

  } catch (error) {
    console.error("Login error:", error);
    const errorMsg = "Lỗi kết nối. Vui lòng thử lại.";

    if (errorEl) errorEl.innerText = errorMsg;
    if (window.notification) {
      window.notification.error(errorMsg);
    } else {
      alert(errorMsg);
    }
  }
}

/**
 * Get current token (prefer sessionStorage, fallback to localStorage)
 */
function getToken() {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
}

/**
 * Logout user
 */
function logout() {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/pages/login.html";
}

/**
 * Show KYB modal for Bank users
 */
function showKybModal(orgStatus) {
  const modal = document.getElementById('kycModal');
  const statusMessage = document.getElementById('kycStatusMessage');
  const formContainer = document.getElementById('kycFormContainer');

  if (!modal) return;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Update status message for Bank KYB
  if (!orgStatus) {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200';
    statusMessage.innerHTML = '<p class="text-blue-800"><i class="ri-information-line"></i> Vui lòng hoàn thành xác thực KYB (Know Your Business) để truy cập thị trường hóa đơn.</p>';
    formContainer.style.display = 'block';
  } else if (orgStatus === 'PENDING' || orgStatus === 'UNDER_REVIEW') {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200';
    statusMessage.innerHTML = '<p class="text-yellow-800"><i class="ri-time-line"></i> Đơn đăng ký KYB của bạn đang được xem xét. Vui lòng chờ quản trị viên phê duyệt.</p>';
    formContainer.style.display = 'none';
  } else if (orgStatus === 'REJECTED') {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-red-50 border border-red-200';
    statusMessage.innerHTML = '<p class="text-red-800"><i class="ri-error-warning-line"></i> Đơn đăng ký KYB của bạn bị từ chối. Vui lòng liên hệ hỗ trợ.</p>';
    formContainer.style.display = 'none';
  }

  initializeKycForm();
}

/**
 * Show KYC modal for SME/Buyer users
 */
function showKycModal(orgStatus) {
  const modal = document.getElementById('kycModal');
  const statusMessage = document.getElementById('kycStatusMessage');
  const formContainer = document.getElementById('kycFormContainer');

  if (!modal) return;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Update status message based on organization status
  if (!orgStatus) {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200';
    statusMessage.innerHTML = '<p class="text-blue-800"><i class="ri-information-line"></i> Vui lòng hoàn thành xác thực KYC để truy cập bảng điều khiển của bạn.</p>';
    formContainer.style.display = 'block';
  } else if (orgStatus === 'PENDING' || orgStatus === 'UNDER_REVIEW') {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200';
    statusMessage.innerHTML = '<p class="text-yellow-800"><i class="ri-time-line"></i> Đơn đăng ký KYC của bạn đang được xem xét. Vui lòng chờ quản trị viên phê duyệt.</p>';
    formContainer.style.display = 'none';
  } else if (orgStatus === 'REJECTED') {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-red-50 border border-red-200';
    statusMessage.innerHTML = '<p class="text-red-800"><i class="ri-error-warning-line"></i> Đơn đăng ký KYC của bạn bị từ chối. Vui lòng liên hệ hỗ trợ.</p>';
    formContainer.style.display = 'none';
  }

  initializeKycForm();
}

/**
 * Initialize KYC form handlers
 */
function initializeKycForm() {
  const form = document.getElementById('kycOrgForm');
  const uploadSection = document.getElementById('uploadSection');
  const submitBtn = document.getElementById('kycSubmitBtn');
  const submitReviewBtn = document.getElementById('kycSubmitReviewBtn');
  const closeBtn = document.getElementById('closeKycModal');

  let currentOrgId = null;

  // Close modal handler
  if (closeBtn) {
    closeBtn.onclick = () => {
      const modal = document.getElementById('kycModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      // Logout user
      logout();
    };
  }

  // Create organization
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const token = getToken();
      if (!token) {
        if (window.notification) {
          window.notification.error('Phiên đăng nhập đã hết hạn');
        }
        logout();
        return;
      }

      const payload = {
        legal_name: document.getElementById('kyc_legal_name').value,
        trade_name: document.getElementById('kyc_trade_name').value || null,
        tax_id: document.getElementById('kyc_tax_id').value || null,
        address: document.getElementById('kyc_address').value || null
      };

      try {
        const res = await fetch(API_URL + '/api/kyc/organizations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Không thể tạo tổ chức');
        }

        const org = await res.json();
        currentOrgId = org.id;

        // Show upload section and submit for review button
        uploadSection.style.display = 'block';
        submitBtn.style.display = 'none';
        submitReviewBtn.style.display = 'block';

        if (window.notification) {
          window.notification.success('Tạo tổ chức thành công! Vui lòng tải lên tài liệu và gửi để xem xét.');
        } else {
          alert('Organization created successfully! Please upload documents and submit for review.');
        }
      } catch (error) {
        console.error('Create organization error:', error);
        if (window.notification) {
          window.notification.error(error.message || 'Không thể tạo tổ chức');
        } else {
          alert('Failed to create organization');
        }
      }
    };
  }

  // Upload document
  const uploadBtn = document.getElementById('kyc_upload_btn');
  if (uploadBtn) {
    uploadBtn.onclick = async () => {
      const fileInput = document.getElementById('kyc_file_input');
      if (!fileInput.files.length) {
        if (window.notification) {
          window.notification.warning('Vui lòng chọn file');
        } else {
          alert('Please select a file');
        }
        return;
      }

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploaded_by', 'user');

      const token = getToken();
      const resultEl = document.getElementById('kyc_upload_result');

      // Show loading state
      if (resultEl) {
        resultEl.innerHTML = '<p class="text-blue-600"><i class="ri-loader-4-line animate-spin"></i> Đang tải lên...</p>';
      }

      try {
        const res = await fetch(`${API_URL}/api/kyc/organizations/${currentOrgId}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Tải lên thất bại');
        }

        const doc = await res.json();
        if (resultEl) {
          resultEl.innerHTML = `<p class="text-green-600">✓ Đã tải lên: ${doc.filename}</p>`;
        }

        if (window.notification) {
          window.notification.success('Tài liệu đã được tải lên thành công');
        }
      } catch (error) {
        console.error('Upload error:', error);
        if (resultEl) {
          resultEl.innerHTML = `<p class="text-red-600">✗ Tải lên thất bại: ${error.message}</p>`;
        }
        if (window.notification) {
          window.notification.error(error.message || 'Tải lên thất bại');
        }
      }
    };
  }

  // Submit for review
  if (submitReviewBtn) {
    submitReviewBtn.onclick = async () => {
      const token = getToken();

      if (!token) {
        if (window.notification) {
          window.notification.error('Phiên đăng nhập đã hết hạn');
        }
        logout();
        return;
      }

      // Show loading state
      if (submitReviewBtn) {
        submitReviewBtn.disabled = true;
        submitReviewBtn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Đang gửi...';
      }

      try {
        const res = await fetch(`${API_URL}/api/kyc/organizations/${currentOrgId}/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Gửi thất bại');
        }

        if (window.notification) {
          window.notification.success('Đơn đăng ký KYC đã được gửi thành công! Vui lòng chờ quản trị viên phê duyệt.');
        } else {
          alert('KYC application submitted successfully! Please wait for admin approval. You will be logged out.');
        }

        // Logout after short delay
        setTimeout(() => {
          logout();
        }, 2000);

      } catch (error) {
        console.error('Submit error:', error);
        if (window.notification) {
          window.notification.error(error.message || 'Gửi thất bại');
        } else {
          alert('Submit failed');
        }

        // Reset button
        if (submitReviewBtn) {
          submitReviewBtn.disabled = false;
          submitReviewBtn.innerHTML = 'Gửi xem xét';
        }
      }
    };
  }
}

// Initialize login form on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login__form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      login();
    });
  }
});
