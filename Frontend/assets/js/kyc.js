// Load config - Must be loaded after config.js in HTML
const API_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : "http://127.0.0.1:8000";
const API = API_URL + '/api/kyc';

// Check if user already has an organization
async function checkExistingOrganization() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/pages/login.html';
    return null;
  }

  try {
    const res = await fetch(API + '/organizations/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/pages/login.html';
    return;
  }

  // Check if organization already exists
  const existingOrg = await checkExistingOrganization();
  if (existingOrg) {
    document.getElementById('orgArea').style.display = 'block';
    document.getElementById('orgId').innerText = existingOrg.id;
    window._currentOrg = existingOrg;
    
    // Show status
    const statusDiv = document.createElement('div');
    statusDiv.className = 'p-4 mb-4 rounded-lg';
    if (existingOrg.status === 'APPROVED') {
      statusDiv.className += ' bg-green-50 border border-green-200 text-green-800';
      statusDiv.innerHTML = '<i class="ri-checkbox-circle-line"></i> Your organization is approved!';
    } else if (existingOrg.status === 'UNDER_REVIEW') {
      statusDiv.className += ' bg-yellow-50 border border-yellow-200 text-yellow-800';
      statusDiv.innerHTML = '<i class="ri-time-line"></i> Your organization is under review.';
    } else if (existingOrg.status === 'REJECTED') {
      statusDiv.className += ' bg-red-50 border border-red-200 text-red-800';
      statusDiv.innerHTML = '<i class="ri-error-warning-line"></i> Your organization was rejected.';
    } else {
      statusDiv.className += ' bg-blue-50 border border-blue-200 text-blue-800';
      statusDiv.innerHTML = '<i class="ri-information-line"></i> Please upload documents and submit for review.';
    }
    document.getElementById('orgArea').insertBefore(statusDiv, document.getElementById('orgArea').firstChild);
  }
});

document.getElementById('orgForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const token = localStorage.getItem('token');
  const payload = {
    legal_name: document.getElementById('legal_name').value,
    trade_name: document.getElementById('trade_name').value,
    tax_id: document.getElementById('tax_id').value,
    address: document.getElementById('address').value
  };

  const res = await fetch(API + '/organizations', {
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
  document.getElementById('orgArea').style.display = 'block';
  document.getElementById('orgId').innerText = org.id;
  window._currentOrg = org;
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  if (!fileInput.files.length) { alert('Pick a file'); return; }
  const file = fileInput.files[0];

  const form = new FormData();
  form.append('file', file);
  form.append('uploaded_by', 'frontend_user');

  const token = localStorage.getItem('token');
  const orgId = window._currentOrg.id;
  const res = await fetch(`http://127.0.0.1:8000/api/kyc/organizations/${orgId}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: form
  });

  if (!res.ok) {
    const txt = await res.text();
    document.getElementById('uploadResult').innerText = 'Upload failed: ' + txt;
    return;
  }

  const doc = await res.json();
  document.getElementById('uploadResult').innerText = `Uploaded: ${doc.filename} (hash: ${doc.file_hash})`;
});

document.getElementById('submitReview').addEventListener('click', async () => {
  const token = localStorage.getItem('token');
  const orgId = window._currentOrg.id;
  const res = await fetch(`http://127.0.0.1:8000/api/kyc/organizations/${orgId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) { alert('Submit failed'); return; }
  alert('Submitted for review! Please wait for admin approval.');
  window.location.href = '/pages/login.html';
});
