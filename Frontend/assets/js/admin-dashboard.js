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
        // FIXED: Handle new pagination response format {data: [...], pagination: {...}}
        const invoicesRes = await fetch(`${API_URL}/api/invoices`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (invoicesRes.ok) {
            const response = await invoicesRes.json();
            const invoices = response.data || response; // Handle both new and old format
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
                        <div class="text-sm font-medium text-gray-900">${inv.seller_name || 'Chưa có tên'}</div>
                        ${inv.sme_org_id ? 
                            `<div class="text-xs text-indigo-600 font-medium">🏢 Org #${inv.sme_org_id}</div>` : 
                            `<div class="text-xs text-red-600 font-semibold">⚠️ Thiếu Org ID</div>`
                        }
                    </td>
                    <td class="px-4 py-3">
                        <div class="text-sm font-medium text-gray-900">${inv.buyer_name || 'Chưa có tên'}</div>
                        ${inv.buyer_org_id ? 
                            `<div class="text-xs text-indigo-600 font-medium">🏢 Org #${inv.buyer_org_id}</div>` : 
                            `<div class="text-xs text-red-600 font-semibold">⚠️ Thiếu Org ID</div>`
                        }
                    </td>
                    <td class="px-4 py-3 text-sm font-semibold text-green-600">${amount}</td>
                    <td class="px-4 py-3">
                        <span class="${statusClass} px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit">
                            <i class="${statusIcon} mr-1"></i>
                            ${inv.status}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                        ${inv.token_id ? `
                            <div class="flex flex-col items-center gap-1">
                                <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center">
                                    <i class="ri-checkbox-circle-line mr-1"></i>Minted
                                </span>
                                <span class="text-xs text-gray-500" title="Token ID: ${inv.token_id}">ID: ${inv.token_id}</span>
                                <span class="text-xs font-semibold ${inv.bank_id ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'} px-2 py-0.5 rounded" title="${inv.bank_id ? 'NFT owned by Bank (after financing)' : 'NFT owned by SME (original owner)'}">
                                    ${inv.bank_id ? '👤 Bank' : '👤 SME'}
                                </span>
                            </div>
                        ` : (inv.status === 'SUBMITTED' || inv.status === 'APPROVED') ? `
                            <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                <i class="ri-alert-line mr-1"></i>Ready
                            </span>
                        ` : `
                            <span class="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                <i class="ri-close-line mr-1"></i>N/A
                            </span>
                        `}
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
                                <button onclick="rejectInvoice(${inv.id})" class="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                                    <i class="ri-close-line mr-1"></i>Reject
                                </button>
                            ` : ''}
                            ${(inv.status === 'SUBMITTED' || inv.status === 'APPROVED') && !inv.token_id ? `
                                ${!inv.sme_org_id || !inv.buyer_org_id ? `
                                    <button onclick="alert('⚠️ Cannot mint NFT:\\n\\nThis invoice is missing ${!inv.sme_org_id ? 'SME organization' : ''} ${!inv.sme_org_id && !inv.buyer_org_id ? 'and' : ''} ${!inv.buyer_org_id ? 'Buyer organization' : ''}.\\n\\nPlease edit the invoice to assign the missing organization(s).')" class="px-3 py-2 bg-orange-400 text-white text-sm rounded-lg hover:bg-orange-500 transition-colors" title="Missing Organization">
                                        <i class="ri-alert-line mr-1"></i>⚠️ Mint NFT
                                    </button>
                                ` : `
                                    <button onclick="mintInvoiceNFT(${inv.id})" class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors" title="Mint NFT">
                                        <i class="ri-nft-line mr-1"></i>Mint NFT
                                    </button>
                                `}
                            ` : ''}
                            ${inv.token_id ? `
                                <span class="px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg inline-flex items-center" title="Token ID: ${inv.token_id}">
                                    <i class="ri-checkbox-circle-line mr-1"></i>Minted
                                </span>
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
    
    // Show loading state
    content.innerHTML = `
        <div class="flex justify-center items-center py-12">
            <i class="ri-loader-4-line text-4xl text-indigo-600 animate-spin"></i>
        </div>
    `;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/kyc/organizations/${orgId}/comprehensive`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to load organization');
        
        const data = await res.json();
        const org = data.organization;
        const user = data.user;
        const kyc_persons = data.kyc_persons || [];
        const shareholders = data.shareholders || [];
        const ubo = data.ubo;
        const documents = data.documents || [];
        
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
        
        // Build comprehensive content
        content.innerHTML = `
            <!-- Organization Header -->
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">${org.legal_name}</h3>
                        <p class="text-sm text-gray-600 mt-1">Organization ID: #${org.id} ${org.uid ? `| UID: ${org.uid}` : ''}</p>
                        ${user ? `<p class="text-sm text-gray-600">User: ${user.email} | Roles: ${user.roles || 'N/A'}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <span class="${statusBadgeClass} px-4 py-2 rounded-full text-sm font-semibold">
                            ${org.status}
                        </span>
                        ${org.org_type ? `<p class="mt-2 text-sm font-medium text-indigo-600">${org.org_type}</p>` : ''}
                    </div>
                </div>
            </div>

            <!-- KYB Information Section -->
            <div class="mb-6">
                <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="ri-building-line text-indigo-600 mr-2"></i>
                    KYB - Organization Information
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Legal Name</label>
                        <p class="text-gray-800 font-medium">${org.legal_name}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Trade Name</label>
                        <p class="text-gray-800">${org.trade_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Foreign Name</label>
                        <p class="text-gray-800">${org.foreign_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Tax ID (MST)</label>
                        <p class="text-gray-800 font-mono">${org.tax_id || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Registration Number</label>
                        <p class="text-gray-800 font-mono">${org.registration_number || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Legal Form</label>
                        <p class="text-gray-800">${org.legal_form || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Operation Status</label>
                        <p class="text-gray-800">${org.operation_status || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Establishment Date</label>
                        <p class="text-gray-800">${org.establishment_date ? new Date(org.establishment_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Legal Representative</label>
                        <p class="text-gray-800">${org.legal_representative || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Wallet Address</label>
                        <p class="text-gray-800 font-mono text-xs">${org.wallet_address || 'Not connected'}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="text-xs font-semibold text-gray-600 uppercase">Business Address</label>
                        <p class="text-gray-800">${org.address || 'N/A'}</p>
                    </div>
                    ${org.tax_verification_status ? `
                    <div>
                        <label class="text-xs font-semibold text-gray-600 uppercase">Tax Verification</label>
                        <p class="text-gray-800">${org.tax_verification_status}</p>
                    </div>
                    ` : ''}
                    ${org.bank_account_info ? `
                    <div class="md:col-span-2">
                        <label class="text-xs font-semibold text-gray-600 uppercase">Bank Account Info</label>
                        <pre class="text-gray-800 text-sm bg-white p-2 rounded mt-1">${org.bank_account_info}</pre>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- KYC Persons Section -->
            ${kyc_persons.length > 0 ? `
            <div class="mb-6">
                <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="ri-user-line text-indigo-600 mr-2"></i>
                    KYC - Key Persons (${kyc_persons.length})
                </h4>
                <div class="space-y-3">
                    ${kyc_persons.map(person => `
                        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label class="text-xs font-semibold text-gray-600 uppercase">Full Name</label>
                                    <p class="text-gray-800 font-medium">${person.full_name}</p>
                                    <span class="inline-block mt-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">${person.role}</span>
                                </div>
                                <div>
                                    <label class="text-xs font-semibold text-gray-600 uppercase">ID Type & Number</label>
                                    <p class="text-gray-800">${person.id_type}: ${person.id_number}</p>
                                    ${person.id_issue_date ? `<p class="text-xs text-gray-600">Issued: ${new Date(person.id_issue_date).toLocaleDateString()}</p>` : ''}
                                </div>
                                <div>
                                    <label class="text-xs font-semibold text-gray-600 uppercase">Date of Birth</label>
                                    <p class="text-gray-800">${person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                                    <p class="text-xs text-gray-600">${person.nationality}</p>
                                </div>
                                ${person.address ? `
                                <div class="md:col-span-2">
                                    <label class="text-xs font-semibold text-gray-600 uppercase">Address</label>
                                    <p class="text-gray-800 text-sm">${person.address}</p>
                                </div>
                                ` : ''}
                                ${person.contact ? `
                                <div>
                                    <label class="text-xs font-semibold text-gray-600 uppercase">Contact</label>
                                    <p class="text-gray-800 text-sm">${person.contact}</p>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Shareholders Section -->
            ${shareholders.length > 0 ? `
            <div class="mb-6">
                <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="ri-pie-chart-line text-indigo-600 mr-2"></i>
                    Shareholders (${shareholders.length})
                </h4>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Type</th>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Ownership %</th>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">ID Number</th>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Contact</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${shareholders.map(sh => `
                                <tr class="bg-white">
                                    <td class="px-4 py-2 text-sm font-medium text-gray-800">${sh.name}</td>
                                    <td class="px-4 py-2 text-sm">
                                        <span class="px-2 py-1 ${sh.shareholder_type === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'} text-xs rounded">
                                            ${sh.shareholder_type}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2 text-sm font-semibold text-green-600">${sh.ownership_percent ? sh.ownership_percent + '%' : 'N/A'}</td>
                                    <td class="px-4 py-2 text-sm font-mono">${sh.id_number || 'N/A'}</td>
                                    <td class="px-4 py-2 text-sm">${sh.contact || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}

            <!-- UBO Section -->
            ${ubo ? `
            <div class="mb-6">
                <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="ri-shield-user-line text-indigo-600 mr-2"></i>
                    UBO (Ultimate Beneficial Owner)
                </h4>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="text-xs font-semibold text-gray-600 uppercase">Listed Status</label>
                            <p class="text-gray-800">
                                ${ubo.is_listed ? 
                                    `<span class="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                        <i class="ri-stock-line mr-1"></i> Listed
                                    </span>` : 
                                    '<span class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full">Not Listed</span>'
                                }
                            </p>
                        </div>
                        ${ubo.is_listed && ubo.stock_exchange ? `
                        <div>
                            <label class="text-xs font-semibold text-gray-600 uppercase">Stock Exchange</label>
                            <p class="text-gray-800 font-medium">${ubo.stock_exchange}</p>
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-600 uppercase">Stock Code</label>
                            <p class="text-gray-800 font-mono font-bold">${ubo.stock_code || 'N/A'}</p>
                        </div>
                        ` : ''}
                        ${ubo.notes ? `
                        <div class="md:col-span-3">
                            <label class="text-xs font-semibold text-gray-600 uppercase">Notes</label>
                            <p class="text-gray-800">${ubo.notes}</p>
                        </div>
                        ` : ''}
                    </div>
                    ${ubo.ownership_documents && ubo.ownership_documents.length > 0 ? `
                    <div class="mt-4">
                        <label class="text-xs font-semibold text-gray-600 uppercase mb-2 block">Ownership Documents</label>
                        <div class="space-y-2">
                            ${ubo.ownership_documents.map(doc => `
                                <div class="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                    <div class="flex items-center">
                                        <i class="ri-file-line text-2xl text-blue-500 mr-3"></i>
                                        <div>
                                            <p class="text-sm font-medium text-gray-800">${doc.filename || 'Document'}</p>
                                            ${doc.size ? `<p class="text-xs text-gray-500">${(doc.size / 1024).toFixed(2)} KB</p>` : ''}
                                        </div>
                                    </div>
                                    ${doc.download_url ? `
                                    <a href="${doc.download_url}" target="_blank" class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                                        <i class="ri-eye-line mr-1"></i>View
                                    </a>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Documents Section -->
            ${documents.length > 0 ? `
            <div class="mb-6">
                <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="ri-file-list-line text-indigo-600 mr-2"></i>
                    Uploaded Documents (${documents.length})
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${documents.map(doc => `
                        <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex items-start justify-between">
                                <div class="flex items-start flex-1">
                                    <i class="ri-file-${doc.filename && doc.filename.endsWith('.xml') ? 'code' : 'text'}-line text-3xl ${doc.filename && doc.filename.endsWith('.xml') ? 'text-orange-500' : 'text-blue-500'} mr-3"></i>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-800 truncate">${doc.filename || 'Unnamed'}</p>
                                        <p class="text-xs text-gray-500">${doc.doc_type || 'Unknown type'}</p>
                                        ${doc.upload_time ? `<p class="text-xs text-gray-400 mt-1">${new Date(doc.upload_time).toLocaleString()}</p>` : ''}
                                        ${doc.uploaded_by ? `<p class="text-xs text-gray-500">By: ${doc.uploaded_by}</p>` : ''}
                                    </div>
                                </div>
                                ${doc.download_url ? `
                                <a href="${doc.download_url}" target="_blank" class="ml-2 px-3 py-2 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors whitespace-nowrap">
                                    <i class="ri-eye-line mr-1"></i>View
                                </a>
                                ` : `
                                <span class="ml-2 px-3 py-2 bg-gray-300 text-gray-600 text-xs rounded cursor-not-allowed">
                                    <i class="ri-lock-line mr-1"></i>N/A
                                </span>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : `
            <div class="mb-6">
                <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="ri-file-list-line text-indigo-600 mr-2"></i>
                    Uploaded Documents
                </h4>
                <div class="bg-gray-50 p-8 rounded-lg text-center">
                    <i class="ri-inbox-line text-4xl text-gray-400 mb-2"></i>
                    <p class="text-gray-500">No documents uploaded yet</p>
                </div>
            </div>
            `}

            <!-- Review History -->
            <div class="mb-6 bg-blue-50 p-4 rounded-lg">
                <h4 class="text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <i class="ri-history-line text-blue-600 mr-2"></i>
                    Review Information
                </h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <label class="text-xs font-semibold text-gray-600">Created</label>
                        <p class="text-gray-800">${org.created_at ? new Date(org.created_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600">Last Updated</label>
                        <p class="text-gray-800">${org.updated_at ? new Date(org.updated_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    ${org.verified_at ? `
                    <div>
                        <label class="text-xs font-semibold text-gray-600">Verified At</label>
                        <p class="text-gray-800">${new Date(org.verified_at).toLocaleString()}</p>
                    </div>
                    ` : ''}
                    ${org.risk_level ? `
                    <div>
                        <label class="text-xs font-semibold text-gray-600">Risk Level</label>
                        <p class="text-gray-800 font-medium">${org.risk_level}</p>
                    </div>
                    ` : ''}
                    ${org.rejection_reason ? `
                    <div class="col-span-2">
                        <label class="text-xs font-semibold text-red-600">Rejection Reason</label>
                        <p class="text-red-700">${org.rejection_reason}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Show/hide review buttons based on status
        const reviewButtons = document.querySelector('#orgReviewModal .sticky.bottom-0');
        if (!canReview) {
            // Hide approve/reject buttons, only show close button
            reviewButtons.querySelector('textarea').disabled = true;
            reviewButtons.querySelector('textarea').placeholder = 'Review already completed';
            reviewButtons.querySelectorAll('button')[0].style.display = 'none'; // Approve
            reviewButtons.querySelectorAll('button')[1].style.display = 'none'; // Reject
        } else {
            reviewButtons.querySelector('textarea').disabled = false;
            reviewButtons.querySelector('textarea').placeholder = 'Enter your review comments...';
            reviewButtons.querySelectorAll('button')[0].style.display = 'flex'; // Approve
            reviewButtons.querySelectorAll('button')[1].style.display = 'flex'; // Reject
        }
        
    } catch (error) {
        console.error('Error loading organization:', error);
        content.innerHTML = `
            <div class="text-center py-12">
                <i class="ri-error-warning-line text-5xl text-red-500 mb-4"></i>
                <p class="text-red-500 font-medium">Error loading organization details</p>
                <p class="text-gray-500 text-sm mt-2">${error.message}</p>
            </div>
        `;
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

    const comments = document.getElementById('reviewComments').value.trim();

    // Validate comments for rejection
    if (action === 'REJECT' && !comments) {
        if (window.notification) {
            window.notification.warning('Vui lòng nhập lý do từ chối / Please enter rejection reason', 3000);
        } else {
            alert('⚠️ Vui lòng nhập lý do từ chối / Please enter rejection reason');
        }
        document.getElementById('reviewComments').focus();
        return;
    }

    // Show confirmation for approve action
    if (action === 'APPROVE') {
        const confirmed = await window.notification?.confirm(
            'Bạn có chắc chắn muốn phê duyệt tổ chức này?\n\nAre you sure you want to approve this organization?',
            'Xác nhận phê duyệt / Confirm Approval'
        ) || confirm('Bạn có chắc chắn muốn phê duyệt tổ chức này?');

        if (!confirmed) return;
    }

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
            const error = await res.json();
            throw new Error(error.detail || 'Review failed');
        }

        const result = await res.json();

        // Show success notification
        if (window.notification) {
            if (action === 'APPROVE') {
                window.notification.success(
                    `✅ Đã phê duyệt tổ chức #${currentOrgId} thành công! / Organization approved successfully!`,
                    4000
                );
            } else {
                window.notification.success(
                    `✅ Đã từ chối tổ chức #${currentOrgId} / Organization rejected`,
                    4000
                );
            }
        } else {
            alert(`✅ Organization ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully!`);
        }

        closeOrgReviewModal();
        loadOrganizations();
        loadStats();

    } catch (error) {
        console.error('Error reviewing organization:', error);

        if (window.notification) {
            window.notification.error(error.message, 5000);
        } else {
            alert('❌ Error: ' + error.message);
        }
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
                    <label class="text-sm font-semibold text-gray-600 flex items-center">
                        SME Organization
                        ${!inv.sme_org_id ? '<span class="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">Thiếu</span>' : ''}
                    </label>
                    <select id="edit_sme_org_id" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" disabled>
                        <option value="">-- Chọn SME Organization --</option>
                    </select>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600 flex items-center">
                        Buyer Organization
                        ${!inv.buyer_org_id ? '<span class="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">Thiếu</span>' : ''}
                    </label>
                    <select id="edit_buyer_org_id" class="w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg" disabled>
                        <option value="">-- Chọn Buyer Organization --</option>
                    </select>
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
            
            <!-- NFT Information Section -->
            ${inv.token_id ? `
                <div class="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200 mt-6">
                    <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <svg class="h-5 w-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                        </svg>
                        NFT Information (Blockchain)
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <label class="text-xs font-semibold text-gray-500 uppercase">Token ID</label>
                            <p class="text-lg font-mono text-purple-700 mt-1">${inv.token_id}</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <label class="text-xs font-semibold text-gray-500 uppercase">Token Standard</label>
                            <p class="text-lg text-gray-800 mt-1">${inv.token_standard || 'ERC-721'}</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow-sm col-span-2">
                            <label class="text-xs font-semibold text-gray-500 uppercase">Contract Address</label>
                            <p class="text-sm font-mono text-gray-600 mt-1 break-all">${inv.nft_contract_address || 'N/A'}</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow-sm col-span-2">
                            <label class="text-xs font-semibold text-gray-500 uppercase">Transaction Hash</label>
                            <p class="text-sm font-mono text-gray-600 mt-1 break-all">${inv.blockchain_tx_hash || 'N/A'}</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <label class="text-xs font-semibold text-gray-500 uppercase">Tokenized At</label>
                            <p class="text-sm text-gray-700 mt-1">${inv.tokenized_at ? new Date(inv.tokenized_at).toLocaleString('vi-VN') : 'N/A'}</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <label class="text-xs font-semibold text-gray-500 uppercase">Current NFT Owner</label>
                            <p class="text-sm font-semibold mt-1 ${inv.bank_id ? 'text-blue-600' : 'text-green-600'}">
                                ${inv.bank_id ? '🏦 Bank (Financed)' : '🏭 SME (Original Owner)'}
                            </p>
                            ${inv.bank_id ? `<p class="text-xs text-gray-500 mt-1">NFT transferred to bank after financing</p>` : `<p class="text-xs text-gray-500 mt-1">NFT still with original seller</p>`}
                        </div>
                    </div>
                </div>
            ` : (inv.status === 'SUBMITTED' || inv.status === 'APPROVED') ? `
                
            ` : ''}
        `;
        
        // Load organizations into dropdowns
        await loadOrganizationsForInvoice(inv.sme_org_id, inv.buyer_org_id);
        
        // Show/hide edit button - Admin can always edit to fix org IDs
        const editBtn = document.getElementById('invoiceEditBtn');
        editBtn.classList.remove('hidden');
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
    } catch (error) {
        console.error('Error loading invoice:', error);
        alert('Error loading invoice details');
    }
}

async function loadOrganizationsForInvoice(currentSmeOrgId, currentBuyerOrgId) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/kyc/organizations/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) return;
        
        const organizations = await res.json();
        const approvedOrgs = organizations.filter(o => o.status === 'APPROVED');
        
        // Populate SME org dropdown
        const smeSelect = document.getElementById('edit_sme_org_id');
        smeSelect.innerHTML = '<option value="">-- Chọn SME Organization --</option>' +
            approvedOrgs.map(org => 
                `<option value="${org.id}" ${org.id === currentSmeOrgId ? 'selected' : ''}>
                    ${org.legal_name || org.trade_name} (ID: ${org.id})
                </option>`
            ).join('');
        
        // Populate Buyer org dropdown  
        const buyerSelect = document.getElementById('edit_buyer_org_id');
        buyerSelect.innerHTML = '<option value="">-- Chọn Buyer Organization --</option>' +
            approvedOrgs.map(org => 
                `<option value="${org.id}" ${org.id === currentBuyerOrgId ? 'selected' : ''}>
                    ${org.legal_name || org.trade_name} (ID: ${org.id})
                </option>`
            ).join('');
            
    } catch (error) {
        console.error('Error loading organizations:', error);
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
    
    // Enable organization dropdowns
    document.getElementById('edit_sme_org_id').removeAttribute('disabled');
    document.getElementById('edit_buyer_org_id').removeAttribute('disabled');
    
    // Change border color to indicate edit mode
    document.querySelectorAll('#invoiceDetailContent input, #invoiceDetailContent select').forEach(input => {
        input.classList.remove('bg-gray-50', 'border-gray-200');
        input.classList.add('bg-white', 'border-indigo-300');
    });
    
    // Show save button, hide edit button
    document.getElementById('invoiceEditBtn').classList.add('hidden');
    document.getElementById('invoiceSaveBtn').classList.remove('hidden');
}

async function saveInvoiceEdit() {
    if (!currentInvoice) return;
    
    const editNote = prompt('Nhập ghi chú về những gì bạn đã thay đổi:');
    if (!editNote) return;
    
    try {
        const token = localStorage.getItem('token');
        const smeOrgId = document.getElementById('edit_sme_org_id').value;
        const buyerOrgId = document.getElementById('edit_buyer_org_id').value;
        
        const updateData = {
            amount: parseFloat(document.getElementById('edit_amount').value),
            issue_date: document.getElementById('edit_issue_date').value,
            lookup_code: document.getElementById('edit_lookup_code').value,
            buyer_name: document.getElementById('edit_buyer_name').value,
            payment_term: parseInt(document.getElementById('edit_payment_term').value),
            proposed_ltv: parseFloat(document.getElementById('edit_ltv').value),
            discount_rate: parseFloat(document.getElementById('edit_discount').value),
            sme_org_id: smeOrgId ? parseInt(smeOrgId) : null,
            buyer_org_id: buyerOrgId ? parseInt(buyerOrgId) : null,
            edit_note: editNote
        };
        
        const res = await fetch(`${API_URL}/api/invoices/${currentInvoice.id}/admin-edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Không thể cập nhật invoice');
        }
        
        const result = await res.json();
        alert(`✅ Cập nhật thành công!\n\n${editNote}`);
        
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

// Reject invoice with comment
async function rejectInvoice(invoiceId) {
    const comment = prompt('Please enter rejection reason (this will be sent to both SME and Buyer):');
    
    if (!comment || comment.trim() === '') {
        alert('Rejection reason is required!');
        return;
    }
    
    if (!confirm(`Are you sure you want to reject this invoice?\n\nReason: ${comment}\n\nBoth SME and Buyer will be notified.`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/invoices/${invoiceId}/decision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                decision: 'REJECTED',
                comment: comment.trim()
            })
        });
        
        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }
        
        const result = await res.json();
        alert(`✓ ${result.message}\n\nRejection reason has been sent to both SME and Buyer.`);
        loadInvoices();
        loadStats();
        
    } catch (error) {
        console.error('Error rejecting invoice:', error);
        alert('Error: ' + error.message);
    }
}

// Mint NFT for invoice (Admin only)
async function mintInvoiceNFT(invoiceId) {
    // Show confirmation modal
    const confirmed = await window.notification?.confirm(
        '🎨 Mint NFT cho hóa đơn này?\n\nThis will:\n- Create an ERC-721 token on blockchain\n- Initial owner: SME organization\n- Transfer to Bank when purchased\n\nMake sure both SME and Buyer organizations have wallet addresses configured.',
        'Xác nhận Mint NFT / Confirm NFT Minting'
    ) || confirm('🎨 Mint NFT cho hóa đơn này?\n\nMake sure both SME and Buyer organizations have wallet addresses configured.');

    if (!confirmed) return;

    // Create minting modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div class="text-center">
                <div class="mb-4">
                    <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Đang mint NFT... / Minting NFT</h3>
                <p class="text-gray-600 text-sm mb-4">Vui lòng chờ trong giây lát / Please wait a moment</p>
                <div class="bg-gray-100 rounded-full p-3">
                    <p class="text-xs text-gray-500">Blockchain Transaction</p>
                    <p class="text-sm font-mono text-indigo-600">Processing...</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/blockchain/mint/${invoiceId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to mint NFT');
        }

        const result = await res.json();

        // Remove loading modal
        document.body.removeChild(modal);

        // Create success modal with transaction details
        const successModal = document.createElement('div');
        successModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        successModal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
                <div class="text-center mb-6">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">NFT Minted Successfully! / NFT Đã Đúc Thành Công!</h3>
                    <p class="text-gray-600">Invoice has been tokenized on the blockchain</p>
                </div>

                <div class="space-y-3 mb-6">
                    <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
                        <label class="text-xs font-semibold text-purple-600 uppercase">Token ID</label>
                        <p class="text-lg font-mono font-bold text-purple-700">${result.token_id}</p>
                    </div>

                    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                        <label class="text-xs font-semibold text-blue-600 uppercase">Transaction Hash</label>
                        <div class="flex items-center gap-2 mt-1">
                            <p class="text-xs font-mono text-blue-700 break-all flex-1">${result.tx_hash}</p>
                            <button onclick="navigator.clipboard.writeText('${result.tx_hash}'); this.textContent='✓'; setTimeout(() => this.textContent='📋', 2000);" class="text-lg hover:scale-110 transition-transform" title="Copy">
                                📋
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gray-50 rounded-lg p-3">
                            <label class="text-xs font-semibold text-gray-600 uppercase">Gas Used</label>
                            <p class="text-sm font-bold text-gray-800">${result.gas_used || 'N/A'}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <label class="text-xs font-semibold text-gray-600 uppercase">Status</label>
                            <p class="text-sm font-bold text-green-600">✓ Confirmed</p>
                        </div>
                    </div>

                    ${result.contract_address ? `
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                        <label class="text-xs font-semibold text-green-600 uppercase">Contract Address</label>
                        <div class="flex items-center gap-2 mt-1">
                            <p class="text-xs font-mono text-green-700 break-all flex-1">${result.contract_address}</p>
                            <button onclick="navigator.clipboard.writeText('${result.contract_address}'); this.textContent='✓'; setTimeout(() => this.textContent='📋', 2000);" class="text-lg hover:scale-110 transition-transform" title="Copy">
                                📋
                            </button>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="bg-indigo-50 rounded-lg p-4 mb-6">
                    <p class="text-sm text-indigo-800">
                        <strong>Note:</strong> The NFT is now owned by the SME organization and will be transferred to Bank when purchased.
                    </p>
                </div>

                <button onclick="this.closest('.fixed').remove(); loadInvoices();" class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-semibold transition-colors">
                    Đóng / Close
                </button>
            </div>
        `;
        document.body.appendChild(successModal);

        // Also show notification
        if (window.notification) {
            window.notification.success(
                `✅ NFT #${result.token_id} minted successfully!`,
                5000
            );
        }

        loadInvoices();

    } catch (error) {
        console.error('Error minting NFT:', error);

        // Remove loading modal if exists
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }

        // Show error modal
        const errorModal = document.createElement('div');
        errorModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        errorModal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div class="text-center mb-6">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">NFT Minting Failed</h3>
                    <p class="text-red-600 font-mono text-sm bg-red-50 p-3 rounded">${error.message}</p>
                </div>

                <div class="space-y-2 mb-6 text-sm text-gray-600">
                    <p><strong>Possible causes:</strong></p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>SME or Buyer organization missing wallet address</li>
                        <li>Blockchain network connection issue</li>
                        <li>Insufficient gas fees</li>
                        <li>Smart contract error</li>
                    </ul>
                </div>

                <button onclick="this.closest('.fixed').remove();" class="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-semibold transition-colors">
                    Đóng / Close
                </button>
            </div>
        `;
        document.body.appendChild(errorModal);

        // Also show error notification
        if (window.notification) {
            window.notification.error(error.message, 6000);
        }
    }
}

// Check for duplicate wallet addresses
async function checkDuplicateWallets() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/kyc/admin/wallets-check`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            throw new Error('Failed to check wallets');
        }
        
        const data = await res.json();
        
        if (data.duplicate_count === 0) {
            alert(`✅ Không có wallet trùng lặp!\n\n` +
                  `Tổng số organizations có wallet: ${data.total_organizations_with_wallets}\n` +
                  `Số wallet duy nhất: ${data.unique_wallets}`);
        } else {
            let message = `⚠️ Phát hiện ${data.duplicate_count} wallet bị trùng lặp!\n\n`;
            
            data.duplicates.forEach((dup, index) => {
                message += `Wallet ${index + 1}: ${dup.wallet_address}\n`;
                dup.organizations.forEach(org => {
                    message += `  - Org #${org.id}: ${org.legal_name}\n`;
                });
                message += '\n';
            });
            
            message += `\n💡 Mỗi organization phải có wallet riêng để mint NFT!\n`;
            message += `Hãy vào Organization Detail để cập nhật wallet address.`;
            
            alert(message);
            
            // Log to console for details
            console.log('Duplicate Wallets:', data.duplicates);
            console.log('All Wallets:', data.all_wallets);
        }
        
    } catch (error) {
        console.error('Error checking wallets:', error);
        alert('❌ Lỗi khi kiểm tra wallets:\n\n' + error.message);
    }
}
