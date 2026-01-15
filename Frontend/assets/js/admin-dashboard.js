// Authentication is handled by auth-guard.js loaded in HTML
// Auth check happens BEFORE this script runs via DOMContentLoaded in HTML

// API_URL is defined in api.js
let currentOrgId = null;

// Load dashboard data on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Admin dashboard DOMContentLoaded - loading data...');
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
                    <td class="px-4 py-3 text-sm font-semibold text-green-600">
                        ${amount}
                        ${inv.status === 'DISPUTED' && inv.increased_amount ? `
                            <div class="text-xs mt-1">
                                <span class="text-gray-500">Was: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(inv.previous_amount || inv.amount)}</span>
                                <i class="ri-arrow-right-line text-orange-500"></i>
                                <span class="text-orange-600 font-bold">New: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(inv.increased_amount)}</span>
                            </div>
                        ` : ''}
                    </td>
                    <td class="px-4 py-3">
                        <span class="${statusClass} px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit">
                            <i class="${statusIcon} mr-1"></i>
                            ${inv.status}
                        </span>
                        ${inv.status === 'DISPUTED' && inv.dispute_type ? `
                            <div class="mt-1">
                                <span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                    ${inv.dispute_type === 'POST_FINANCE' ? '💰 Post-Finance' : '📋 Pre-Finance'}
                                </span>
                            </div>
                        ` : ''}
                    </td>
                    <td class="px-4 py-3 text-center">
                        ${inv.token_id ? `
                            <div class="flex flex-col items-center gap-1">
                                <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center">
                                    <i class="ri-checkbox-circle-line mr-1"></i>Minted
                                </span>
                                <span class="text-xs text-gray-500" title="Token ID: ${inv.token_id}">ID: ${inv.token_id}</span>
                                <span class="text-xs font-semibold ${inv.bank_id ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'} px-2 py-0.5 rounded" title="${inv.bank_id ? 'Token owned by Bank (after financing)' : 'Token owned by SME (original owner)'}">
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
                        <div class="flex gap-2 justify-center flex-wrap">
                            <button onclick="viewInvoiceDetail(${inv.id})" class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="ri-file-line mr-1"></i>View
                            </button>
                            ${inv.status === 'DISPUTED' && inv.dispute_type === 'POST_FINANCE' ? `
                                <button onclick="openDisputeModal(${inv.id})" class="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors animate-pulse">
                                    <i class="ri-alarm-warning-line mr-1"></i>Resolve Dispute
                                </button>
                            ` : ''}
                            ${inv.status === 'FINANCING' && inv.dispute_resolution_action === 'ACCEPT_INCREASED' && inv.additional_financing_amount ? `
                                <button onclick="confirmAdditionalDisbursement(${inv.id})" class="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors animate-pulse">
                                    <i class="ri-bank-card-line mr-1"></i>Confirm Disbursement
                                </button>
                                <div class="text-xs text-purple-700 font-bold">
                                    Additional: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(inv.additional_financing_amount)}
                                </div>
                            ` : ''}
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
                                        <i class="ri-alert-line mr-1"></i>⚠️ Mint Token
                                    </button>
                                ` : `
                                    <button onclick="mintInvoiceNFT(${inv.id})" class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors" title="Mint Token">
                                        <i class="ri-nft-line mr-1"></i>Mint Token
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
                            <label class="text-xs font-semibold text-gray-500 uppercase">Current Token Owner</label>
                            <p class="text-sm font-semibold mt-1 ${inv.bank_id ? 'text-blue-600' : 'text-green-600'}">
                                ${inv.bank_id ? '🏦 Bank (Financed)' : '🏭 SME (Original Owner)'}
                            </p>
                            ${inv.bank_id ? `<p class="text-xs text-gray-500 mt-1">Token transferred to bank after financing</p>` : `<p class="text-xs text-gray-500 mt-1">Token still with original seller</p>`}
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
    if (!confirm('🎨 Mint Token for this invoice?\n\nThis will:\n- Create an ERC-721 token on blockchain\n- Initial owner: SME organization\n- Transfer to Bank when purchased\n\nMake sure both SME and Buyer organizations have wallet addresses configured.')) {
        return;
    }
    
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
        alert(`✅ Token Minted Successfully!\n\n` +
              `Token ID: ${result.token_id}\n` +
              `Transaction Hash: ${result.tx_hash}\n` +
              `Gas Used: ${result.gas_used}\n\n` +
              `The Token is now owned by the SME organization and will be transferred to Bank when purchased.`);
        
        loadInvoices();
        
    } catch (error) {
        console.error('Error minting Token:', error);
        alert('❌ Failed to mint Token:\n\n' + error.message);
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
            
            message += `\n💡 Mỗi organization phải có wallet riêng để mint Token!\n`;
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

// ====== DISPUTE RESOLUTION FUNCTIONS ======
let currentDisputedInvoice = null;

// Open dispute modal
async function openDisputeModal(invoiceId) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            throw new Error('Failed to load invoice');
        }
        
        const invoice = await res.json();
        currentDisputedInvoice = invoice;
        
        // Show modal
        document.getElementById('disputeResolutionModal').classList.remove('hidden');
        document.getElementById('disputeResolutionModal').classList.add('flex');
        
        // Load dispute details
        loadDisputeDetails(invoice);
        
    } catch (error) {
        console.error('Error opening dispute modal:', error);
        alert('Error loading dispute details: ' + error.message);
    }
}

// Load dispute details into modal
function loadDisputeDetails(invoice) {
    const content = document.getElementById('disputeDetailContent');
    
    // Calculate amounts
    const originalAmount = invoice.amount;
    const previousAmount = invoice.previous_amount || originalAmount;
    const disputeType = invoice.dispute_type || 'N/A';
    const caseId = invoice.dispute_case_id || 'N/A';
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };
    
    content.innerHTML = `
        <!-- Dispute Overview -->
        <div class="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-bold text-red-800 mb-4 flex items-center">
                <i class="ri-error-warning-line text-2xl mr-2"></i>
                Dispute Case: ${caseId}
            </h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-semibold text-gray-700">Dispute Type</label>
                    <p class="text-lg font-bold text-red-600">${disputeType}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-700">Disputed At</label>
                    <p class="text-gray-800">${invoice.disputed_at ? new Date(invoice.disputed_at).toLocaleString() : 'N/A'}</p>
                </div>
            </div>
        </div>
        
        <!-- Editable Invoice Details Form -->
        <div class="bg-white border-2 border-orange-300 rounded-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-orange-800 flex items-center">
                    <i class="ri-edit-box-line text-2xl mr-2"></i>
                    Edit Invoice Details (Review & Update)
                </h3>
                <button id="toggleEditBtn" onclick="toggleDisputeEdit()" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold">
                    <i class="ri-pencil-line mr-1"></i>Enable Edit
                </button>
            </div>
            
            <form id="disputeInvoiceForm" class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-semibold text-gray-700">Invoice Number *</label>
                    <input type="text" id="dispute_invoice_number" value="${invoice.invoice_number || ''}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 bg-gray-50" disabled>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-700">Serial Number</label>
                    <input type="text" id="dispute_serial_no" value="${invoice.serial_no || ''}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 bg-gray-50" disabled>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-700">Amount (VND) *</label>
                    <input type="number" id="dispute_amount" value="${invoice.amount}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 bg-gray-50 font-bold text-lg text-green-700" disabled>
                    <p class="text-xs text-gray-500 mt-1">Previous: ${formatCurrency(previousAmount)}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-700">Issue Date</label>
                    <input type="date" id="dispute_issue_date" value="${invoice.issue_date || ''}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 bg-gray-50" disabled>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-700">SME (Seller)</label>
                    <input type="text" value="${invoice.seller_name || 'N/A'}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 bg-gray-100" disabled readonly>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-700">Buyer</label>
                    <input type="text" value="${invoice.buyer_name || 'N/A'}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 bg-gray-100" disabled readonly>
                </div>
                <div class="col-span-2">
                    <label class="text-sm font-semibold text-gray-700">Lookup Code</label>
                    <input type="text" id="dispute_lookup_code" value="${invoice.lookup_code || ''}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 bg-gray-50" disabled>
                </div>
                <div class="col-span-2">
                    <label class="text-sm font-semibold text-gray-700">Funding Purpose</label>
                    <textarea id="dispute_funding_purpose" rows="2" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 bg-gray-50" disabled>${invoice.funding_purpose || ''}</textarea>
                </div>
            </form>
            
            <div class="mt-4 flex items-center space-x-3">
                <button id="saveDisputeEditBtn" onclick="saveDisputeInvoiceEdit()" 
                        class="hidden px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                    <i class="ri-save-line mr-2"></i>Save Changes
                </button>
                <button id="cancelDisputeEditBtn" onclick="cancelDisputeEdit()" 
                        class="hidden px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    <i class="ri-close-line mr-2"></i>Cancel
                </button>
                <span id="editWarning" class="hidden text-sm text-orange-700 font-semibold">
                    <i class="ri-alert-line mr-1"></i>Editing enabled - Review changes before deciding
                </span>
            </div>
        </div>
        
        <!-- Amount Comparison (Dynamic) -->
        <div id="amountComparisonSection" class="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-bold text-orange-800 mb-4 flex items-center">
                <i class="ri-money-dollar-circle-line text-2xl mr-2"></i>
                Amount Change Analysis
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <label class="text-sm font-semibold text-gray-600">Previous Financed Amount</label>
                    <p class="text-2xl font-bold text-gray-700">${formatCurrency(previousAmount)}</p>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <label class="text-sm font-semibold text-gray-600">New Disputed Amount</label>
                    <p id="newAmountDisplay" class="text-2xl font-bold text-green-600">${formatCurrency(originalAmount)}</p>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm border-2 border-red-300">
                    <label class="text-sm font-semibold text-red-600">Additional Financing Needed</label>
                    <p id="additionalAmountDisplay" class="text-2xl font-bold text-red-600">${formatCurrency(originalAmount - previousAmount)}</p>
                    <p class="text-xs text-gray-600 mt-1">Bank must disburse if accepted</p>
                </div>
            </div>
        </div>
        
        <!-- Dispute Description -->
        ${invoice.dispute_description ? `
        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-bold text-gray-800 mb-3">Dispute Description</h3>
            <div class="bg-gray-50 rounded p-4">
                <p class="text-gray-700 whitespace-pre-wrap">${invoice.dispute_description}</p>
            </div>
            ${invoice.dispute_reason ? `
                <div class="mt-3">
                    <span class="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        Reason: ${invoice.dispute_reason}
                    </span>
                </div>
            ` : ''}
        </div>
        ` : ''}
        
        <!-- Decision Instructions -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 class="text-lg font-bold text-blue-800 mb-3 flex items-center">
                <i class="ri-information-line text-xl mr-2"></i>
                Bank Decision Required
            </h3>
            <div class="space-y-3 text-sm text-gray-700">
                <div class="flex items-start">
                    <i class="ri-checkbox-circle-line text-green-600 text-xl mr-2 mt-0.5"></i>
                    <div>
                        <p class="font-semibold text-green-700">Accept Increased Amount:</p>
                        <p>Invoice status → FINANCING. Bank will disburse additional amount to SME. Then normal workflow continues.</p>
                    </div>
                </div>
                <div class="flex items-start">
                    <i class="ri-close-circle-line text-red-600 text-xl mr-2 mt-0.5"></i>
                    <div>
                        <p class="font-semibold text-red-700">Reject Increased Amount:</p>
                        <p>Invoice status → SUBMITTED. SME/Buyer must create new invoice linked to this one for resubmission.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Toggle edit mode for dispute invoice
function toggleDisputeEdit() {
    const inputs = document.querySelectorAll('#disputeInvoiceForm input:not([readonly]), #disputeInvoiceForm textarea');
    const toggleBtn = document.getElementById('toggleEditBtn');
    const saveBtn = document.getElementById('saveDisputeEditBtn');
    const cancelBtn = document.getElementById('cancelDisputeEditBtn');
    const warning = document.getElementById('editWarning');
    
    const isDisabled = inputs[0].disabled;
    
    inputs.forEach(input => {
        input.disabled = !isDisabled;
        if (!isDisabled) {
            input.classList.remove('bg-white', 'border-orange-300');
            input.classList.add('bg-gray-50');
        } else {
            input.classList.remove('bg-gray-50');
            input.classList.add('bg-white', 'border-orange-300');
        }
    });
    
    if (isDisabled) {
        toggleBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        cancelBtn.classList.remove('hidden');
        warning.classList.remove('hidden');
    } else {
        toggleBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
        warning.classList.add('hidden');
    }
}

// Cancel dispute edit
function cancelDisputeEdit() {
    if (!confirm('Discard changes?')) return;
    loadDisputeDetails(currentDisputedInvoice);
}

// Save dispute invoice edit
async function saveDisputeInvoiceEdit() {
    if (!currentDisputedInvoice) return;
    
    const updatedData = {
        invoice_number: document.getElementById('dispute_invoice_number').value,
        serial_no: document.getElementById('dispute_serial_no').value,
        amount: parseFloat(document.getElementById('dispute_amount').value),
        issue_date: document.getElementById('dispute_issue_date').value,
        lookup_code: document.getElementById('dispute_lookup_code').value,
        funding_purpose: document.getElementById('dispute_funding_purpose').value,
        edit_note: 'Updated invoice during dispute resolution'
    };
    
    if (!updatedData.amount || updatedData.amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (!confirm(`Save changes to invoice?\n\nNew amount: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(updatedData.amount)}`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/invoices/${currentDisputedInvoice.id}/admin-edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to update invoice');
        }
        
        const result = await res.json();
        
        // Reload invoice from server to get updated data
        const invoiceRes = await fetch(`${API_URL}/api/invoices/${currentDisputedInvoice.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (invoiceRes.ok) {
            currentDisputedInvoice = await invoiceRes.json();
        }
        
        alert('✅ Invoice updated successfully!');
        loadDisputeDetails(currentDisputedInvoice);
        
        // Update amount comparison dynamically
        const previousAmount = currentDisputedInvoice.previous_amount || currentDisputedInvoice.amount;
        const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        document.getElementById('newAmountDisplay').textContent = formatCurrency(currentDisputedInvoice.amount);
        document.getElementById('additionalAmountDisplay').textContent = formatCurrency(currentDisputedInvoice.amount - previousAmount);
        
    } catch (error) {
        console.error('Error updating invoice:', error);
        alert('❌ Failed to update invoice:\n\n' + error.message);
    }
}

// Resolve dispute
async function resolveDispute(action) {
    if (!currentDisputedInvoice) {
        alert('No invoice selected');
        return;
    }
    
    const comments = document.getElementById('disputeResolutionComments').value.trim();
    
    if (!comments) {
        alert('Please enter decision comments');
        return;
    }
    
    const actionText = action === 'ACCEPT_INCREASED' 
        ? 'ACCEPT the increased amount and continue financing' 
        : 'REJECT and require resubmission';
    
    if (!confirm(`⚠️ Confirm Decision?\n\nAction: ${actionText}\n\nInvoice: #${currentDisputedInvoice.invoice_number || currentDisputedInvoice.id}\n\nThis action cannot be undone. Are you sure?`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        const payload = {
            action: action,
            comments: comments
        };
        
        // Add new_amount if accepting
        if (action === 'ACCEPT_INCREASED') {
            payload.new_amount = currentDisputedInvoice.amount;
        }
        
        const res = await fetch(`${API_URL}/api/invoices/${currentDisputedInvoice.id}/dispute/resolve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to resolve dispute');
        }
        
        const result = await res.json();
        
        let successMessage = `✅ Dispute Resolved Successfully!\n\n`;
        successMessage += `Case ID: ${result.case_id}\n`;
        successMessage += `Action: ${result.action}\n`;
        successMessage += `New Status: ${result.new_status}\n\n`;
        
        if (result.action === 'ACCEPT_INCREASED') {
            successMessage += `Previous Amount: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.previous_amount)}\n`;
            successMessage += `New Amount: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.increased_amount)}\n`;
            successMessage += `Additional Financing: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.additional_financing_amount)}\n\n`;
            successMessage += `⏭️ Next: Bank must disburse the additional amount to SME.`;
        } else {
            successMessage += `📝 Next: ${result.instructions || 'SME/Buyer must create new invoice'}`;
        }
        
        alert(successMessage);
        
        closeDisputeModal();
        loadInvoices();
        loadStats();
        
    } catch (error) {
        console.error('Error resolving dispute:', error);
        alert('❌ Error resolving dispute:\n\n' + error.message);
    }
}

// Close dispute modal
function closeDisputeModal() {
    document.getElementById('disputeResolutionModal').classList.add('hidden');
    document.getElementById('disputeResolutionModal').classList.remove('flex');
    document.getElementById('disputeResolutionComments').value = '';
    currentDisputedInvoice = null;
}

// Create linked invoice for rejected disputes
async function createLinkedInvoice() {
    if (!currentDisputedInvoice) {
        alert('No disputed invoice selected');
        return;
    }
    
    if (confirm('Create new invoice linked to this dispute?\n\nThis will open a form pre-filled with current invoice data.')) {
        // Store linked invoice ID and navigate to create page
        localStorage.setItem('linked_invoice_id', currentDisputedInvoice.id);
        localStorage.setItem('linked_invoice_data', JSON.stringify({
            invoice_number: currentDisputedInvoice.invoice_number,
            serial_no: currentDisputedInvoice.serial_no,
            amount: currentDisputedInvoice.previous_amount,
            seller_id: currentDisputedInvoice.seller_id,
            buyer_id: currentDisputedInvoice.buyer_id,
            funding_purpose: currentDisputedInvoice.funding_purpose,
            issue_date: currentDisputedInvoice.issue_date
        }));
        
        alert('✅ Linked invoice data saved!\n\nPlease go to invoice creation page to submit the new invoice.\n\nNote: The form will be pre-filled with previous data.');
        
        closeDisputeModal();
    }
}

// Confirm additional disbursement after accepting increased amount
async function confirmAdditionalDisbursement(invoiceId) {
    try {
        const token = localStorage.getItem('token');
        
        // Get invoice details first
        const res = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!res.ok) throw new Error('Failed to load invoice');
        
        const invoice = await res.json();
        
        if (invoice.status !== 'FINANCING' || !invoice.additional_financing_amount) {
            alert('❌ This invoice is not pending additional disbursement.');
            return;
        }
        
        const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        
        const confirmMessage = `💰 Confirm Additional Disbursement\n\n` +
            `Invoice: #${invoice.invoice_number || invoice.id}\n` +
            `Previous Amount: ${formatCurrency(invoice.previous_amount)}\n` +
            `New Amount: ${formatCurrency(invoice.increased_amount)}\n\n` +
            `🏦 Additional to Disburse: ${formatCurrency(invoice.additional_financing_amount)}\n\n` +
            `Have you completed the disbursement to SME?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Call backend to confirm disbursement
        const confirmRes = await fetch(`${API_URL}/api/invoices/${invoiceId}/confirm-additional-disbursement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                disbursed_amount: invoice.additional_financing_amount,
                comments: 'Bank confirmed additional disbursement for increased amount'
            })
        });
        
        if (!confirmRes.ok) {
            const error = await confirmRes.json();
            throw new Error(error.detail || 'Failed to confirm disbursement');
        }
        
        const result = await confirmRes.json();
        
        alert(`✅ Additional Disbursement Confirmed!\n\n` +
              `Amount: ${formatCurrency(invoice.additional_financing_amount)}\n` +
              `Status: ${result.new_status}\n\n` +
              `The invoice has been updated to FINANCED status.`);
        
        loadInvoices();
        loadStats();
        
    } catch (error) {
        console.error('Error confirming disbursement:', error);
        alert('❌ Failed to confirm disbursement:\n\n' + error.message);
    }
}

