// Dispute Management Functions

let currentDisputeInvoice = null;

// Open Dispute Modal
function openDisputeModal() {
    const invoice = currentDisputeInvoice || getCurrentInvoiceFromDetail();
    if (!invoice) {
        alert('❌ Unable to load invoice information');
        return;
    }

    // Check if user is buyer
    const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload.roles || (payload.role ? [payload.role] : []);

    if (!roles.includes('BUYER')) {
        alert('❌ Only buyers can dispute invoices');
        return;
    }

    // Check if invoice status allows dispute
    if (!['APPROVED', 'FINANCED'].includes(invoice.status)) {
        alert('❌ Can only dispute invoices with status APPROVED or FINANCED');
        return;
    }

    // Store invoice for later use
    currentDisputeInvoice = invoice;

    // Update modal content based on status
    const modal = document.getElementById('disputeModal');
    const invoiceNumber = document.getElementById('disputeInvoiceNumber');
    const currentStatus = document.getElementById('disputeCurrentStatus');
    const amount = document.getElementById('disputeAmount');
    const evidenceSection = document.getElementById('evidenceUploadSection');
    const warningTitle = document.getElementById('disputeWarningTitle');
    const warningMessage = document.getElementById('disputeWarningMessage');
    const impactList = document.getElementById('disputeImpactList');

    // Set basic info
    invoiceNumber.textContent = `Invoice: ${invoice.invoice_no} | Serial: ${invoice.serial_no}`;
    currentStatus.textContent = invoice.status;
    currentStatus.className = `ml-2 font-semibold px-2 py-1 rounded ${getStatusClass(invoice.status)}`;
    amount.textContent = `${parseFloat(invoice.invoice_value).toLocaleString()} ${invoice.currency}`;

    // Configure based on status
    if (invoice.status === 'APPROVED') {
        // Case A: Not yet financed
        warningTitle.textContent = '⚠️ Pre-Finance Dispute';
        warningMessage.textContent = 'This will immediately block financing for this invoice.';
        evidenceSection.style.display = 'none';
        evidenceSection.querySelector('input').required = false;

        impactList.innerHTML = `
            <li>Invoice status will change to <strong>DISPUTED</strong></li>
            <li>Financing will be <strong>blocked immediately</strong></li>
            <li>Supplier will be notified</li>
            <li>Bank will be notified to hold processing</li>
        `;
    } else if (invoice.status === 'FINANCED') {
        // Case B: Already financed - more serious
        warningTitle.textContent = '🚨 Post-Finance Dispute (Critical)';
        warningMessage.textContent = 'Bank has already disbursed funds. Evidence is REQUIRED.';
        evidenceSection.style.display = 'block';
        evidenceSection.querySelector('input').required = true;

        impactList.innerHTML = `
            <li>Invoice status will change to <strong>DISPUTED</strong></li>
            <li><strong>Case management</strong> will be initiated immediately</li>
            <li>All parties (Supplier, Bank, Admin) will be notified</li>
            <li>Further changes will be <strong>frozen</strong></li>
            <li><strong>Evidence upload is mandatory</strong></li>
        `;
    }

    // Reset form
    document.getElementById('disputeReasonCode').value = '';
    document.getElementById('disputeDescription').value = '';
    document.getElementById('disputeEvidenceFiles').value = '';
    document.getElementById('evidenceFilesList').innerHTML = '';

    // Show modal
    modal.style.display = 'flex';
}

// Close Dispute Modal
function closeDisputeModal() {
    const modal = document.getElementById('disputeModal');
    modal.style.display = 'none';
    currentDisputeInvoice = null;
}

// Handle file selection display
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('disputeEvidenceFiles');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const filesList = document.getElementById('evidenceFilesList');
            filesList.innerHTML = '';

            if (e.target.files.length > 0) {
                Array.from(e.target.files).forEach((file, index) => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'flex items-center justify-between bg-white p-2 rounded border border-amber-300';
                    fileItem.innerHTML = `
                        <span class="text-sm text-gray-700">
                            <svg class="inline h-4 w-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                            ${file.name}
                        </span>
                        <span class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</span>
                    `;
                    filesList.appendChild(fileItem);
                });
            }
        });
    }
});

// Submit Dispute
async function submitDispute() {
    const invoice = currentDisputeInvoice;
    if (!invoice) {
        alert('❌ No invoice selected');
        return;
    }

    // Validate inputs
    const reasonCode = document.getElementById('disputeReasonCode').value;
    const description = document.getElementById('disputeDescription').value;
    const evidenceFiles = document.getElementById('disputeEvidenceFiles').files;

    if (!reasonCode) {
        alert('❌ Please select a dispute reason');
        return;
    }

    if (!description || description.trim().length < 20) {
        alert('❌ Please provide a detailed description (minimum 20 characters)');
        return;
    }

    // Check evidence requirement for FINANCED invoices
    if (invoice.status === 'FINANCED' && evidenceFiles.length === 0) {
        alert('❌ Evidence upload is required for financed invoices');
        return;
    }

    // Confirm action
    const confirmMessage = invoice.status === 'FINANCED'
        ? '🚨 WARNING: This invoice has already been financed.\n\nSubmitting this dispute will:\n- Initiate case management\n- Notify all parties\n- Freeze further changes\n\nAre you sure you want to proceed?'
        : '⚠️ This will block financing and notify all parties.\n\nAre you sure you want to dispute this invoice?';

    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));

        // Define API_URL if not already defined
        const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'http://127.0.0.1:8000';

        console.log('🔍 Submitting dispute for invoice:', invoice.id);
        console.log('🔍 API URL:', apiUrl);

        // Prepare dispute data
        const disputeData = {
            reason_code: reasonCode,
            description: description.trim(),
            invoice_status: invoice.status
        };

        console.log('📤 Dispute data:', disputeData);

        // Step 1: Submit dispute to backend
        const response = await fetch(`${apiUrl}/api/invoices/${invoice.id}/dispute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(disputeData),
            mode: 'cors',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to submit dispute');
        }

        const result = await response.json();

        // Step 2: Upload evidence files if any
        if (evidenceFiles.length > 0) {
            const formData = new FormData();
            Array.from(evidenceFiles).forEach(file => {
                formData.append('files', file);
            });

            const uploadResponse = await fetch(`${apiUrl}/api/invoices/${invoice.id}/dispute/evidence`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                mode: 'cors',
                credentials: 'include'
            });

            if (!uploadResponse.ok) {
                console.warn('Evidence upload failed, but dispute was submitted');
            }
        }

        // Success
        alert(`✅ Dispute submitted successfully!\n\nInvoice status: DISPUTED\nCase ID: ${result.case_id || 'Pending'}\n\nAll parties have been notified.`);

        // Close modal and refresh
        closeDisputeModal();
        closeInvoiceDetailModal();

        // Refresh invoice list
        if (typeof loadInvoices === 'function') {
            loadInvoices();
        }

    } catch (error) {
        console.error('Dispute submission error:', error);
        alert(`❌ Failed to submit dispute:\n\n${error.message}`);
    }
}

// Helper function to get current invoice from detail modal
function getCurrentInvoiceFromDetail() {
    // Try to get from global variable if set by detail modal
    if (window.currentInvoiceDetail) {
        return window.currentInvoiceDetail;
    }
    return null;
}

// Helper function for status badge classes
function getStatusClass(status) {
    const statusClasses = {
        'DRAFT': 'bg-gray-100 text-gray-700',
        'EDITING': 'bg-blue-100 text-blue-700',
        'SUBMITTED': 'bg-yellow-100 text-yellow-700',
        'APPROVED': 'bg-green-100 text-green-700',
        'FINANCED': 'bg-purple-100 text-purple-700',
        'SETTLED': 'bg-teal-100 text-teal-700',
        'CLOSED': 'bg-gray-100 text-gray-700',
        'DISPUTED': 'bg-red-100 text-red-700',
        'REJECTED': 'bg-red-100 text-red-700'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-700';
}
