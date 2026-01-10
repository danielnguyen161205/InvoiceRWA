// Check authentication and ensure user is ADMIN
requireAuth();

// API_URL is defined in api.js
let currentOrgId = null;

// Check if user has ADMIN role
const token = localStorage.getItem('token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload.roles || (payload.role ? [payload.role] : []);
    
    if (!roles.includes('ADMIN')) {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/pages/login.html';
    }
}

// Load dashboard data on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin dashboard loaded');
    loadOrganizations();
    loadInvoices();
    loadStats();
});

// Load statistics
async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        
        // Get all organizations
        const orgsRes = await fetch(`${API_URL}/api/kyc/organizations/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (orgsRes.ok) {
            const orgs = await orgsRes.json();
            const pending = orgs.filter(o => o.status === 'PENDING').length;
            const review = orgs.filter(o => o.status === 'UNDER_REVIEW').length;
            const approved = orgs.filter(o => o.status === 'APPROVED').length;
            
            document.getElementById('pendingOrgsCount').innerText = pending;
            document.getElementById('reviewOrgsCount').innerText = review;
            document.getElementById('approvedOrgsCount').innerText = approved;
        }
        
        // Get all invoices
        const invoicesRes = await fetch(`${API_URL}/api/invoices`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (invoicesRes.ok) {
            const invoices = await invoicesRes.json();
            document.getElementById('totalInvoicesCount').innerText = invoices.length;
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load organizations
async function loadOrganizations() {
    console.log('Loading organizations...');
    try {
        const token = localStorage.getItem('token');
        const statusFilter = document.getElementById('orgStatusFilter').value;
        
        console.log('Fetching from:', `${API_URL}/api/kyc/organizations/all`);
        const res = await fetch(`${API_URL}/api/kyc/organizations/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Error response:', errorText);
            throw new Error('Failed to load organizations');
        }
        
        const organizations = await res.json();
        console.log('Loaded organizations:', organizations);
        const tbody = document.getElementById('organizationsTableBody');
        
        // Filter by status
        const filtered = statusFilter === 'ALL' 
            ? organizations 
            : organizations.filter(o => o.status === statusFilter);
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                        <i class="ri-inbox-line text-3xl"></i>
                        <p class="mt-2">No organizations found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filtered.map(org => {
            let statusClass = '';
            let statusIcon = '';
            
            switch(org.status) {
                case 'PENDING':
                    statusClass = 'bg-blue-100 text-blue-700';
                    statusIcon = 'ri-time-line';
                    break;
                case 'UNDER_REVIEW':
                    statusClass = 'bg-yellow-100 text-yellow-700';
                    statusIcon = 'ri-eye-line';
                    break;
                case 'APPROVED':
                    statusClass = 'bg-green-100 text-green-700';
                    statusIcon = 'ri-checkbox-circle-line';
                    break;
                case 'REJECTED':
                    statusClass = 'bg-red-100 text-red-700';
                    statusIcon = 'ri-close-circle-line';
                    break;
            }
            
            const created = org.created_at ? new Date(org.created_at).toLocaleDateString() : 'N/A';
            const canReview = org.status === 'PENDING' || org.status === 'UNDER_REVIEW';
            
            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">#${org.id}</td>
                    <td class="px-4 py-3">
                        <div class="text-sm font-semibold text-gray-900">${org.legal_name}</div>
                        <div class="text-xs text-gray-500">${org.trade_name || 'No trade name'}</div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">${org.trade_name || 'N/A'}</td>
                    <td class="px-4 py-3 text-sm font-mono text-gray-600">${org.tax_id || 'N/A'}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                            ${org.user_roles || 'N/A'}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="${statusClass} px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit">
                            <i class="${statusIcon} mr-1"></i>
                            ${org.status}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">${created}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="openOrgReviewModal(${org.id})" class="px-4 py-2 ${canReview ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'} text-white text-sm rounded-lg transition-colors">
                            <i class="ri-eye-line mr-1"></i>${canReview ? 'Review' : 'View'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading organizations:', error);
        const tbody = document.getElementById('organizationsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-red-500">
                    <i class="ri-error-warning-line text-3xl"></i>
                    <p class="mt-2">Error loading organizations</p>
                </td>
            </tr>
        `;
    }
}

// Load invoices
async function loadInvoices() {
    console.log('Loading invoices...');
    try {
        const token = localStorage.getItem('token');
        const statusFilter = document.getElementById('invoiceStatusFilter').value;
        
        console.log('Fetching from:', `${API_URL}/api/invoices/admin/all`);
        const res = await fetch(`${API_URL}/api/invoices/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Invoice response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Invoice error response:', errorText);
            throw new Error('Failed to load invoices');
        }
        
        const invoices = await res.json();
        console.log('Loaded invoices:', invoices);
        const tbody = document.getElementById('invoicesTableBody');
        
        // Filter by status
        const filtered = statusFilter === 'ALL' 
            ? invoices 
            : invoices.filter(i => i.status === statusFilter);
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                        <i class="ri-inbox-line text-3xl"></i>
                        <p class="mt-2">No invoices found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filtered.map(inv => {
            let statusClass = '';
            let statusIcon = '';
            
            switch(inv.status) {
                case 'DRAFT':
                    statusClass = 'bg-gray-100 text-gray-700';
                    statusIcon = 'ri-draft-line';
                    break;
                case 'EDITING':
                    statusClass = 'bg-orange-100 text-orange-700';
                    statusIcon = 'ri-edit-line';
                    break;
                case 'SUBMITTED':
                    statusClass = 'bg-yellow-100 text-yellow-700';
                    statusIcon = 'ri-send-plane-line';
                    break;
                case 'APPROVED':
                    statusClass = 'bg-green-100 text-green-700';
                    statusIcon = 'ri-checkbox-circle-line';
                    break;
                case 'DISPUTED':
                    statusClass = 'bg-red-100 text-red-700';
                    statusIcon = 'ri-alarm-warning-line';
                    break;
                case 'REJECTED':
                    statusClass = 'bg-red-100 text-red-700';
                    statusIcon = 'ri-close-circle-line';
                    break;
                default:
                    statusClass = 'bg-gray-100 text-gray-700';
                    statusIcon = 'ri-question-line';
            }
            
            const created = inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A';
            const issueDate = inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : 'N/A';
            const amount = inv.amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(inv.amount) : 'N/A';
            const canApprove = inv.status === 'SUBMITTED';
            
            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3">
                        <div class="text-sm font-bold text-gray-900">#${inv.invoice_number || inv.id}</div>
                        <div class="text-xs text-gray-500">${inv.serial_no || 'No serial'}</div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="text-sm text-gray-700">User #${inv.sme_id}</div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="text-sm text-gray-700">${inv.buyer_name || 'N/A'}</div>
                        ${inv.buyer_id ? `<div class="text-xs text-gray-500">User #${inv.buyer_id}</div>` : ''}
                    </td>
                    <td class="px-4 py-3 text-sm font-semibold text-green-600">${amount}</td>
                    <td class="px-4 py-3">
                        <span class="${statusClass} px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit">
                            <i class="${statusIcon} mr-1"></i>
                            ${inv.status}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <div class="text-sm text-gray-600">${issueDate}</div>
                        <div class="text-xs text-gray-500">Created: ${created}</div>
                    </td>
                    <td class="px-4 py-3 text-center">
                        <div class="flex gap-2 justify-center">
                            <button onclick="viewInvoiceDetail(${inv.id})" class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="ri-file-line mr-1"></i>View
                            </button>
                            ${canApprove ? `
                                <button onclick="approveInvoice(${inv.id})" class="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                    <i class="ri-checkbox-line mr-1"></i>Approve
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading invoices:', error);
        const tbody = document.getElementById('invoicesTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-red-500">
                    <i class="ri-error-warning-line text-3xl"></i>
                    <p class="mt-2">Error loading invoices</p>
                </td>
            </tr>
        `;
    }
}

// Open organization review modal
async function openOrgReviewModal(orgId) {
    currentOrgId = orgId;
    const modal = document.getElementById('orgReviewModal');
    const content = document.getElementById('orgReviewContent');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/kyc/organizations/${orgId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to load organization');
        
        const org = await res.json();
        const canReview = org.status === 'PENDING' || org.status === 'UNDER_REVIEW';
        
        let statusBadgeClass = '';
        switch(org.status) {
            case 'PENDING':
                statusBadgeClass = 'bg-blue-100 text-blue-700';
                break;
            case 'UNDER_REVIEW':
                statusBadgeClass = 'bg-yellow-100 text-yellow-700';
                break;
            case 'APPROVED':
                statusBadgeClass = 'bg-green-100 text-green-700';
                break;
            case 'REJECTED':
                statusBadgeClass = 'bg-red-100 text-red-700';
                break;
        }
        
        content.innerHTML = `
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">Organization #${org.id}</h3>
                        <p class="text-sm text-gray-600 mt-1">UID: ${org.uid || 'N/A'}</p>
                    </div>
                    <span class="${statusBadgeClass} px-4 py-2 rounded-full text-sm font-semibold">
                        ${org.status}
                    </span>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                    <label class="text-sm font-semibold text-gray-600">Legal Name</label>
                    <p class="text-gray-800 font-medium mt-1 p-3 bg-gray-50 rounded-lg">${org.legal_name}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Trade Name</label>
                    <p class="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg">${org.trade_name || 'Not provided'}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Tax ID</label>
                    <p class="text-gray-800 font-mono mt-1 p-3 bg-gray-50 rounded-lg">${org.tax_id || 'Not provided'}</p>
                </div>
                <div class="col-span-2">
                    <label class="text-sm font-semibold text-gray-600">Business Address</label>
                    <p class="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg">${org.address || 'Not provided'}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Created Date</label>
                    <p class="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg">${org.created_at ? new Date(org.created_at).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Risk Level</label>
                    <p class="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg">${org.risk_level || 'Not assessed'}</p>
                </div>
            </div>
        `;
        
        // Show/hide review buttons based on status
        const reviewButtons = document.querySelector('#orgReviewModal .flex.space-x-3');
        if (!canReview) {
            reviewButtons.style.display = 'none';
        } else {
            reviewButtons.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Error loading organization:', error);
        content.innerHTML = `<p class="text-red-500">Error loading organization details</p>`;
    }
}

// Close organization review modal
function closeOrgReviewModal() {
    const modal = document.getElementById('orgReviewModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentOrgId = null;
    document.getElementById('reviewComments').value = '';
}

// Review organization
async function reviewOrganization(action) {
    if (!currentOrgId) return;
    
    const comments = document.getElementById('reviewComments').value;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/kyc/organizations/${currentOrgId}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                action: action,
                comments: comments
            })
        });
        
        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }
        
        alert(`Organization ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully!`);
        closeOrgReviewModal();
        loadOrganizations();
        loadStats();
        
    } catch (error) {
        console.error('Error reviewing organization:', error);
        alert('Error: ' + error.message);
    }
}

// View invoice detail (redirect to invoice detail page or open modal)
// View invoice detail in modal
let currentInvoice = null;

async function viewInvoiceDetail(invoiceId) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to load invoice');
        
        const inv = await res.json();
        currentInvoice = inv;
        
        const modal = document.getElementById('invoiceDetailModal');
        const content = document.getElementById('invoiceDetailContent');
        
        const amount = inv.amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(inv.amount) : 'N/A';
        const issueDate = inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : 'N/A';
        const created = inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A';
        
        // Status badge
        let statusClass = '';
        switch(inv.status) {
            case 'DRAFT': statusClass = 'bg-gray-100 text-gray-700'; break;
            case 'EDITING': statusClass = 'bg-orange-100 text-orange-700'; break;
            case 'SUBMITTED': statusClass = 'bg-yellow-100 text-yellow-700'; break;
            case 'APPROVED': statusClass = 'bg-green-100 text-green-700'; break;
            case 'DISPUTED': statusClass = 'bg-red-100 text-red-700'; break;
            case 'REJECTED': statusClass = 'bg-red-100 text-red-700'; break;
        }
        
        content.innerHTML = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">Invoice #${inv.invoice_number || inv.id}</h3>
                        <p class="text-sm text-gray-600 mt-1">Serial: ${inv.serial_no || 'N/A'}</p>
                    </div>
                    <span class="${statusClass} px-4 py-2 rounded-full text-sm font-semibold">
                        ${inv.status}
                    </span>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-semibold text-gray-600">Amount</label>
                    <input type="number" id="edit_amount" value="${inv.amount || ''}" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" readonly>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Currency</label>
                    <input type="text" value="${inv.currency || 'VND'}" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" readonly>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Issue Date</label>
                    <input type="date" id="edit_issue_date" value="${inv.issue_date || ''}" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" readonly>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Lookup Code</label>
                    <input type="text" id="edit_lookup_code" value="${inv.lookup_code || ''}" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" readonly>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Buyer Name</label>
                    <input type="text" id="edit_buyer_name" value="${inv.buyer_name || ''}" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" readonly>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Payment Term (days)</label>
                    <input type="number" id="edit_payment_term" value="${inv.payment_term || ''}" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" readonly>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Proposed LTV</label>
                    <input type="number" step="0.01" id="edit_ltv" value="${inv.proposed_ltv || ''}" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" readonly>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Discount Rate</label>
                    <input type="number" step="0.01" id="edit_discount" value="${inv.discount_rate || ''}" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" readonly>
                </div>
                <div class="col-span-2">
                    <label class="text-sm font-semibold text-gray-600">Created</label>
                    <p class="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg">${created}</p>
                </div>
            </div>
        `;
        
        // Show/hide edit button based on status
        const editBtn = document.getElementById('invoiceEditBtn');
        if (inv.status === 'DRAFT' || inv.status === 'EDITING') {
            editBtn.classList.remove('hidden');
        } else {
            editBtn.classList.add('hidden');
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
    } catch (error) {
        console.error('Error loading invoice:', error);
        alert('Error loading invoice details');
    }
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoiceDetailModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentInvoice = null;
}

function enableInvoiceEdit() {
    // Enable all input fields
    document.getElementById('edit_amount').removeAttribute('readonly');
    document.getElementById('edit_issue_date').removeAttribute('readonly');
    document.getElementById('edit_lookup_code').removeAttribute('readonly');
    document.getElementById('edit_buyer_name').removeAttribute('readonly');
    document.getElementById('edit_payment_term').removeAttribute('readonly');
    document.getElementById('edit_ltv').removeAttribute('readonly');
    document.getElementById('edit_discount').removeAttribute('readonly');
    
    // Change border color to indicate edit mode
    document.querySelectorAll('#invoiceDetailContent input').forEach(input => {
        input.classList.remove('bg-gray-50', 'border-gray-200');
        input.classList.add('bg-white', 'border-indigo-300');
    });
    
    // Show save button, hide edit button
    document.getElementById('invoiceEditBtn').classList.add('hidden');
    document.getElementById('invoiceSaveBtn').classList.remove('hidden');
}

async function saveInvoiceEdit() {
    if (!currentInvoice) return;
    
    const editNote = prompt('Enter a note about what you changed:');
    if (!editNote) return;
    
    try {
        const token = localStorage.getItem('token');
        const updateData = {
            amount: parseFloat(document.getElementById('edit_amount').value),
            issue_date: document.getElementById('edit_issue_date').value,
            lookup_code: document.getElementById('edit_lookup_code').value,
            buyer_name: document.getElementById('edit_buyer_name').value,
            payment_term: parseInt(document.getElementById('edit_payment_term').value),
            proposed_ltv: parseFloat(document.getElementById('edit_ltv').value),
            discount_rate: parseFloat(document.getElementById('edit_discount').value),
            edit_note: editNote
        };
        
        const res = await fetch(`${API_URL}/api/invoices/${currentInvoice.id}/buyer-edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to update invoice');
        }
        
        const result = await res.json();
        alert(`✓ ${result.message}\nStatus: ${result.status}\n\nSupplier must now approve the changes.`);
        
        closeInvoiceModal();
        loadInvoices(); // Reload list
        
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Error saving invoice: ' + error.message);
    }
}

// Approve invoice
async function approveInvoice(invoiceId) {
    if (!confirm('Are you sure you want to approve this invoice?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/invoices/${invoiceId}/decision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ decision: 'APPROVED' })
        });
        
        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }
        
        alert('Invoice approved successfully!');
        loadInvoices();
        loadStats();
        
    } catch (error) {
        console.error('Error approving invoice:', error);
        alert('Error: ' + error.message);
    }
}
