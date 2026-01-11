const API_URL = "http://127.0.0.1:8000";

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API_URL + "/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    document.getElementById("error").innerText = "Login failed";
    return;
  }

  const data = await res.json();

  // 1️⃣ store JWT
  localStorage.setItem("token", data.access_token);

  // 2️⃣ decode roles from JWT
  const payload = JSON.parse(atob(data.access_token.split(".")[1]));
  const roles = payload.roles || (payload.role ? [payload.role] : []);
  const kycVerified = payload.kyc_verified || false;
  const orgStatus = payload.org_status;

  // 3️⃣ Admin users go directly to admin dashboard (no KYC required)
  if (roles.includes("ADMIN")) {
    window.location.href = "./admin-dashboard.html";
    return;
  }

  // 4️⃣ Bank users need KYB verification - redirect to profile page
  if (roles.includes("BANK") && !kycVerified) {
    window.location.href = "./profile.html";
    return;
  }

  // 5️⃣ SME/BUYER users need KYC - redirect to profile page
  if ((roles.includes("SME") || roles.includes("BUYER")) && !kycVerified) {
    window.location.href = "./profile.html";
    return;
  }

  // 6️⃣ If verified, redirect based on role: BANK -> SME -> BUYER
  if (roles.includes("BANK")) {
    window.location.href = "./bank-dashboard.html";
  } else if (roles.includes("SME")) {
    window.location.href = "./sme-dashboard.html";
  } else if (roles.includes("BUYER")) {
    window.location.href = "./sme-dashboard.html";
  } else {
    alert("Unknown role");
  }
}

function showKybModal(orgStatus) {
  // For now, use the same KYC modal but with different messaging
  // In a full implementation, you'd create a separate KYB form
  const modal = document.getElementById('kycModal');
  const statusMessage = document.getElementById('kycStatusMessage');
  const formContainer = document.getElementById('kycFormContainer');
  
  if (!modal) return;
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  // Update status message for Bank KYB
  if (!orgStatus) {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200';
    statusMessage.innerHTML = '<p class="text-blue-800"><i class="ri-information-line"></i> Please complete KYB (Know Your Business) verification to access the invoice marketplace.</p>';
    formContainer.style.display = 'block';
  } else if (orgStatus === 'PENDING' || orgStatus === 'UNDER_REVIEW') {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200';
    statusMessage.innerHTML = '<p class="text-yellow-800"><i class="ri-time-line"></i> Your KYB application is under review. Please wait for admin approval.</p>';
    formContainer.style.display = 'none';
  } else if (orgStatus === 'REJECTED') {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-red-50 border border-red-200';
    statusMessage.innerHTML = '<p class="text-red-800"><i class="ri-error-warning-line"></i> Your KYB application was rejected. Please contact support.</p>';
    formContainer.style.display = 'none';
  }
  
  initializeKycForm();
}

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
    statusMessage.innerHTML = '<p class="text-blue-800"><i class="ri-information-line"></i> Please complete KYC verification to access your dashboard.</p>';
    formContainer.style.display = 'block';
  } else if (orgStatus === 'PENDING' || orgStatus === 'UNDER_REVIEW') {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200';
    statusMessage.innerHTML = '<p class="text-yellow-800"><i class="ri-time-line"></i> Your KYC application is under review. Please wait for admin approval.</p>';
    formContainer.style.display = 'none';
  } else if (orgStatus === 'REJECTED') {
    statusMessage.className = 'mb-4 p-4 rounded-lg bg-red-50 border border-red-200';
    statusMessage.innerHTML = '<p class="text-red-800"><i class="ri-error-warning-line"></i> Your KYC application was rejected. Please contact support.</p>';
    formContainer.style.display = 'none';
  }
  
  initializeKycForm();
}

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
      localStorage.removeItem('token');
      window.location.href = './login.html';
    };
  }
  
  // Create organization
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      
      const token = localStorage.getItem('token');
      const payload = {
        legal_name: document.getElementById('kyc_legal_name').value,
        trade_name: document.getElementById('kyc_trade_name').value || null,
        tax_id: document.getElementById('kyc_tax_id').value || null,
        address: document.getElementById('kyc_address').value || null
      };
      
      const res = await fetch(API_URL + '/api/kyc/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        alert('Failed to create organization');
        return;
      }
      
      const org = await res.json();
      currentOrgId = org.id;
      
      // Show upload section and submit for review button
      uploadSection.style.display = 'block';
      submitBtn.style.display = 'none';
      submitReviewBtn.style.display = 'block';
      
      alert('Organization created successfully! Please upload documents and submit for review.');
    };
  }
  
  // Upload document
  const uploadBtn = document.getElementById('kyc_upload_btn');
  if (uploadBtn) {
    uploadBtn.onclick = async () => {
      const fileInput = document.getElementById('kyc_file_input');
      if (!fileInput.files.length) {
        alert('Please select a file');
        return;
      }
      
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploaded_by', 'user');
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/kyc/organizations/${currentOrgId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) {
        const txt = await res.text();
        document.getElementById('kyc_upload_result').innerText = 'Upload failed: ' + txt;
        return;
      }
      
      const doc = await res.json();
      document.getElementById('kyc_upload_result').innerHTML = 
        `<p class="text-green-600">✓ Uploaded: ${doc.filename}</p>`;
    };
  }
  
  // Submit for review
  if (submitReviewBtn) {
    submitReviewBtn.onclick = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/kyc/organizations/${currentOrgId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        alert('Submit failed');
        return;
      }
      
      alert('KYC application submitted successfully! Please wait for admin approval. You will be logged out.');
      localStorage.removeItem('token');
      window.location.href = './login.html';
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login__form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      login();
    });
  }
});
