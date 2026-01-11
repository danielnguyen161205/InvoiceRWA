// Check authentication and KYC status on page load
requireAuth();

// Format VND currency
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Track previous invoice counts for change detection
let previousInvoiceCounts = {
  sme: 0,
  buyer: 0
};

// Track current view for proper auto-refresh
let currentView = 'sme'; // default to SME view

// Update last refresh time indicator
function updateLastRefreshTime() {
  const lastUpdatedEl = document.getElementById('lastUpdatedTime');
  if (lastUpdatedEl) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    lastUpdatedEl.textContent = timeString;
    
    // Show the indicator
    const lastUpdatedContainer = document.getElementById('lastUpdated');
    if (lastUpdatedContainer) {
      lastUpdatedContainer.classList.remove('hidden');
      lastUpdatedContainer.classList.add('flex');
    }
  }
}

// Show notification when new invoices arrive
function showNewInvoiceNotification(role, count) {
  const tabButton = document.getElementById(role === 'sme' ? 'smeTab' : 'buyerTab');
  if (tabButton && count > 0) {
    // Add a badge to indicate new invoices
    const existingBadge = tabButton.querySelector('.new-invoice-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    const badge = document.createElement('span');
    badge.className = 'new-invoice-badge ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse';
    badge.textContent = `+${count}`;
    tabButton.appendChild(badge);
    
    // Remove badge after 10 seconds
    setTimeout(() => {
      badge.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => badge.remove(), 500);
    }, 10000);
  }
}

// Manual refresh function
async function manualRefresh() {
  const btn = document.getElementById('manualRefreshBtn');
  if (btn) {
    // Add spinning animation
    btn.classList.add('animate-spin');
    btn.disabled = true;
  }
  
  await loadDashboard();
  
  if (btn) {
    // Remove spinning animation after a brief delay
    setTimeout(() => {
      btn.classList.remove('animate-spin');
      btn.disabled = false;
    }, 500);
  }
}

async function loadDashboard() {
  const invoices = await apiFetch("/api/invoices");

  // read filters
  const startVal = document.getElementById('startdate') ? document.getElementById('startdate').value : null;
  const endVal = document.getElementById('enddate') ? document.getElementById('enddate').value : null;
  const statusVal = document.getElementById('status') ? document.getElementById('status').value : null;

  // filter invoices according to UI
  const filtered = invoices.filter(inv => {
    let ok = true;
    if (statusVal && statusVal !== 'ALL') ok = ok && String(inv.status) === String(statusVal);
    if (startVal) {
      const invDate = new Date(inv.created_at);
      const startDate = new Date(startVal);
      startDate.setHours(0,0,0,0);
      ok = ok && invDate >= startDate;
    }
    if (endVal) {
      const invDate = new Date(inv.created_at);
      const endDate = new Date(endVal);
      endDate.setHours(23,59,59,999);
      ok = ok && invDate <= endDate;
    }
    return ok;
  });

  // Get current user ID from token to determine which invoices belong to SME vs Buyer view
  let currentUserId = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload.sub ? parseInt(payload.sub) : null;
    } catch (e) {
      // ignore decode errors
    }
  }

  // Split invoices: SME invoices (I'm the seller) vs Buyer invoices (I'm the buyer)
  const smeInvoices = filtered.filter(inv => inv.sme_id === currentUserId);
  const buyerInvoices = filtered.filter(inv => inv.buyer_id === currentUserId);

  // Debug logging
  console.log('📊 Dashboard Debug:', {
    totalInvoices: filtered.length,
    currentUserId: currentUserId,
    smeCount: smeInvoices.length,
    buyerCount: buyerInvoices.length,
    sampleInvoices: filtered.slice(0, 3).map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      sme_id: inv.sme_id,
      buyer_id: inv.buyer_id,
      status: inv.status
    }))
  });

  // Check for new invoices and show notifications
  if (previousInvoiceCounts.sme > 0 && smeInvoices.length > previousInvoiceCounts.sme) {
    const newCount = smeInvoices.length - previousInvoiceCounts.sme;
    showNewInvoiceNotification('sme', newCount);
  }
  if (previousInvoiceCounts.buyer > 0 && buyerInvoices.length > previousInvoiceCounts.buyer) {
    const newCount = buyerInvoices.length - previousInvoiceCounts.buyer;
    showNewInvoiceNotification('buyer', newCount);
  }

  // Update counts for next comparison
  previousInvoiceCounts.sme = smeInvoices.length;
  previousInvoiceCounts.buyer = buyerInvoices.length;

  // Render SME table
  renderInvoiceTable(smeInvoices, "sme");

  // Render Buyer table
  renderInvoiceTable(buyerInvoices, "buyer");
  
  // Update last refresh time
  updateLastRefreshTime();
}

function renderInvoiceTable(invoices, role) {
  // role = "sme" or "buyer"
  const tableId = `invoiceTable-${role}`;
  const totalId = `totalInvoices-${role}`;
  const amountId = `totalAmount-${role}`;
  const fundedId = role === "sme" ? `fundedAmount-${role}` : `paidAmount-${role}`;

  const table = document.getElementById(tableId);
  if (!table) return;

  table.innerHTML = "";

  let total = 0;
  let funded = 0;

  invoices.forEach(inv => {
    total += inv.amount;
    if (inv.status === "FUNDED" || inv.status === "PAID") {
      funded += inv.amount * (role === "sme" ? 0.9 : 1.0);
    }

    const counterparty = role === "sme" 
      ? (inv.buyer_name || inv.buyer || "-") 
      : (inv.seller_name || inv.seller || inv.sme_name || "-");

    let action = `<a href="#" onclick="showInvoiceDetail(${inv.id}, '${role}'); return false;" class="text-indigo-600 hover:underline cursor-pointer">View</a>`;
    
    // Add "Request Financing" button for SME if invoice is APPROVED
    if (role === "sme" && inv.status === "APPROVED") {
      action += ` | <a href="#" onclick="openBankRequestModal(${inv.id}, '${inv.invoice_number}'); return false;" class="text-green-600 hover:underline cursor-pointer font-semibold">Request Financing</a>`;
    }
    
    // Add "Received" button for SME if invoice has FINANCING request (bank sent money)
    if (role === "sme" && inv.bank_confirmed_financed && !inv.sme_confirmed_receipt) {
      action += ` | <a href="#" onclick="confirmReceipt(${inv.id}); return false;" class="text-blue-600 hover:underline cursor-pointer font-semibold">Received</a>`;
    }
    
    // Add "Close Invoice" button for SME if invoice is FINANCED and not yet closed
    if (role === "sme" && inv.status === "FINANCED" && !inv.invoice_closed_by_sme) {
      action += ` | <a href="#" onclick="closeInvoiceWithFee(${inv.id}); return false;" class="text-purple-600 hover:underline cursor-pointer font-semibold">Đóng hóa đơn</a>`;
    }
    
    // Show closing fee status if invoice is closed
    if (role === "sme" && inv.invoice_closed_by_sme) {
      const feeStatus = inv.closing_fee_paid 
        ? `<span class="text-green-600 text-xs">✓ Phí đã trả</span>`
        : `<span class="text-orange-600 text-xs">⚠ Chưa trả phí</span>`;
      action += ` | ${feeStatus}`;
      
      // Add "Pay Fee" button if fee not paid yet
      if (!inv.closing_fee_paid) {
        action += ` | <a href="#" onclick="payClosingFee(${inv.id}); return false;" class="text-orange-600 hover:underline cursor-pointer font-semibold text-xs">Trả phí</a>`;
      }
    }

    // NFT Status badge
    const nftStatus = inv.token_id 
      ? `<span class="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center justify-center gap-1">
           <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
             <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
           </svg>
           Tokenized
         </span>`
      : `<span class="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Not Minted</span>`;

    const row = `
      <div class="invoice-table-row bg-white flex items-center px-10 py-4 text-sm text-gray-600">
        <div class="text-left" style="width: 140px;">${inv.invoice_number || inv.id}</div>
        <div class="text-left" style="width: 200px;">${counterparty}</div>
        <div class="text-center" style="width: 140px;">${formatVND(inv.amount)}</div>
        <div class="text-center" style="width: 140px;"><span class="status ${inv.status}">${inv.status}</span></div>
        <div class="text-center" style="width: 120px;">${nftStatus}</div>
        <div class="text-center" style="width: 140px;">${new Date(inv.created_at).toLocaleDateString()}</div>
        <div class="text-center flex-1">${action}</div>
      </div>
    `;
    table.innerHTML += row;
  });

  document.getElementById(totalId).innerText = invoices.length;
  document.getElementById(amountId).innerText = formatVND(total);
  document.getElementById(fundedId).innerText = formatVND(funded);
}

// Date validation helpers — keep end date >= start date
function setupDateValidation() {
  const start = document.getElementById('startdate');
  const end = document.getElementById('enddate');
  const err = document.getElementById('dateError');
  if (!start || !end) return;

  const validate = () => {
    if (start.value) {
      end.min = start.value;
    } else {
      end.removeAttribute('min');
    }

    if (start.value && end.value && end.value < start.value) {
      err.classList.remove('hidden');
      end.classList.add('border-red-500');
      end.setAttribute('aria-invalid', 'true');
    } else {
      err.classList.add('hidden');
      end.classList.remove('border-red-500');
      end.removeAttribute('aria-invalid');
    }
  };

  start.addEventListener('change', validate);
  end.addEventListener('change', validate);
  // initial
  validate();
}

setupDateValidation();
// re-run dashboard when filters change
['startdate','enddate','status'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', () => loadDashboard());
});

loadDashboard();

// Auto-refresh invoices every 30 seconds to show new invoices in real-time
let autoRefreshInterval = setInterval(() => {
  loadDashboard();
}, 30000); // 30 seconds

// Clear interval when page is hidden/closed
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
  } else {
    // Resume auto-refresh when page becomes visible again
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
    autoRefreshInterval = setInterval(() => {
      loadDashboard();
    }, 30000);
  }
});

// Invoice detail modal functions
let currentInvoices = [];

async function showInvoiceDetail(invoiceId, role = 'sme') {
  try {
    // Fetch invoice details
    const invoices = await apiFetch("/api/invoices");
    const invoice = invoices.find(inv => inv.id === invoiceId);
    
    if (!invoice) {
      alert('Invoice not found');
      return;
    }

    // Populate modal with invoice data
    document.getElementById('invoiceDetailNumber').textContent = `Invoice #${invoice.invoice_number}`;
    document.getElementById('detailInvoiceNumber').textContent = invoice.invoice_number || '-';
   document.getElementById('detailSerialNo').textContent = invoice.serial_no || '-';
    document.getElementById('detailStatus').innerHTML = `<span class="status ${invoice.status}">${invoice.status}</span>`;
    document.getElementById('detailIssueDate').textContent = invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('vi-VN') : '-';
    document.getElementById('detailLookupCode').textContent = invoice.lookup_code || '-';
    document.getElementById('detailCurrency').textContent = invoice.currency || 'VND';
    
    // Highlight changes if in EDITING status
    if (invoice.status === 'EDITING' && invoice.original_data_snapshot) {
      highlightChanges(invoice);
    } else {
      clearHighlights();
    }
    
    // Show/hide rejection comment section
    const rejectionCommentSection = document.getElementById('rejectionCommentSection');
    if (invoice.status === 'REJECTED' && invoice.rejection_comment) {
      if (rejectionCommentSection) {
        rejectionCommentSection.style.display = 'block';
        document.getElementById('detailRejectionComment').textContent = invoice.rejection_comment;
      }
    } else {
      if (rejectionCommentSection) {
        rejectionCommentSection.style.display = 'none';
      }
    }
    
    // Populate buyer information
    document.getElementById('detailBuyer').textContent = invoice.buyer_name || '-';
    
    // Load and display buyer user information if available
    if (invoice.buyer_id) {
      loadBuyerUserInfo(invoice.buyer_id);
    } else {
      // Hide user info section if no buyer_id
      const buyerUserSection = document.getElementById('detailBuyerUser');
      if (buyerUserSection) {
        buyerUserSection.style.display = 'none';
      }
    }
    
    document.getElementById('detailAmount').textContent = `${invoice.amount.toLocaleString()} ${invoice.currency || 'VND'}`;
    document.getElementById('detailCreated').textContent = new Date(invoice.created_at).toLocaleDateString('vi-VN');
    
    // Factoring details
    const recourseText = invoice.recourse_type === 1 ? '✓ Có Truy Đòi' : invoice.recourse_type === 0 ? '✗ Không Truy Đòi' : '-';
    document.getElementById('detailRecourseType').textContent = recourseText;
    document.getElementById('detailPaymentTerm').textContent = invoice.payment_term ? `${invoice.payment_term} ngày` : '-';
    document.getElementById('detailLtv').textContent = invoice.proposed_ltv ? `${invoice.proposed_ltv}%` : '-';
    document.getElementById('detailDiscountRate').textContent = invoice.discount_rate ? `${invoice.discount_rate}%/năm` : '-';
    
    const categoryMap = {
      'working_capital': '💼 Vốn lưu động',
      'expansion': '📈 Mở rộng sản xuất kinh doanh',
      'purchase_materials': '🏭 Mua nguyên vật liệu',
      'pay_salary': '👥 Trả lương nhân viên',
      'other': '📋 Khác'
    };
    document.getElementById('detailFundingCategory').textContent = categoryMap[invoice.funding_category] || '-';
    document.getElementById('detailFundingPurpose').textContent = invoice.funding_purpose || '-';
    document.getElementById('detailDisputeMethod').textContent = invoice.dispute_method || '-';

    // Show/hide Submit button based on role and status
    const submitBtn = document.getElementById('submitInvoiceBtn');
    const buyerInfo = document.getElementById('buyerActionInfo');
    const editBtn = document.getElementById('editInvoiceBtn');
    const markAsPaidBtn = document.getElementById('markAsPaidBtn');
    
    if (submitBtn) {
      if (role === 'buyer' && (invoice.status === 'DRAFT' || invoice.status === 'EDITING')) {
        submitBtn.style.display = 'flex';
        submitBtn.onclick = () => submitInvoice(invoice.id);
        if (buyerInfo) buyerInfo.style.display = 'flex';
      } else {
        submitBtn.style.display = 'none';
        if (buyerInfo) buyerInfo.style.display = 'none';
      }
    }

    // Show Mark as Paid button for buyer if invoice is FINANCED
    if (markAsPaidBtn) {
      if (role === 'buyer' && invoice.status === 'FINANCED') {
        markAsPaidBtn.style.display = 'flex';
        markAsPaidBtn.onclick = () => markInvoiceAsPaid(invoice.id);
      } else {
        markAsPaidBtn.style.display = 'none';
      }
    }

    // Show Edit button for buyer if invoice is DRAFT or EDITING
    // Show Edit button for SME if invoice is DRAFT or EDITING
    if (editBtn) {
      if ((role === 'buyer' && ['DRAFT', 'EDITING'].includes(invoice.status)) || 
          (role === 'sme' && ['DRAFT', 'EDITING'].includes(invoice.status))) {
        editBtn.style.display = 'inline-flex';
        editBtn.onclick = () => openEditModal(invoice, role);
      } else {
        editBtn.style.display = 'none';
      }
    }

    // Show Dispute button for buyer if invoice is APPROVED or FINANCED
    const disputeBtn = document.getElementById('disputeInvoiceBtn');
    if (disputeBtn) {
      if (role === 'buyer' && ['APPROVED', 'FINANCED'].includes(invoice.status)) {
        disputeBtn.style.display = 'inline-flex';
        // Store invoice for dispute modal
        window.currentInvoiceDetail = invoice;
      } else {
        disputeBtn.style.display = 'none';
      }
    }

    // Show/Hide Mint NFT button - REMOVED: Only ADMIN can mint NFT (not SME)
    // Mint NFT button is only available in admin dashboard
    const mintNFTBtn = document.getElementById('mintNFTBtn');
    const nftInfoSection = document.getElementById('nftInfoSection');
    
    if (mintNFTBtn) {
      // Hide mint button - only admin can mint
      mintNFTBtn.style.display = 'none';
    }

    // Show NFT Info section if tokenized
    if (nftInfoSection) {
      if (invoice.token_id) {
        nftInfoSection.style.display = 'block';
        document.getElementById('detailTokenId').textContent = invoice.token_id || '-';
        document.getElementById('detailTokenStandard').textContent = invoice.token_standard || '-';
        document.getElementById('detailContractAddress').textContent = invoice.nft_contract_address || '-';
        document.getElementById('detailTxHash').textContent = invoice.blockchain_tx_hash || '-';
        document.getElementById('detailTokenizedAt').textContent = invoice.tokenized_at 
          ? new Date(invoice.tokenized_at).toLocaleString() 
          : '-';
      } else {
        nftInfoSection.style.display = 'none';
      }
    }

    // Show modal
    document.getElementById('invoiceDetailModal').style.display = 'block';
  } catch (error) {
    console.error('Error loading invoice details:', error);
    alert('Failed to load invoice details');
  }
}

// Submit invoice function for buyer
async function submitInvoice(invoiceId) {
  if (!confirm('Bạn có chắc chắn muốn chấp nhận hóa đơn này?\n\nSau khi chấp nhận, hóa đơn sẽ chuyển sang trạng thái SUBMITTED.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/invoices/${invoiceId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + getToken(),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể chấp nhận hóa đơn');
    }

    const result = await response.json();
    alert('✅ Chấp nhận hóa đơn thành công!\n\nHóa đơn đã chuyển sang trạng thái SUBMITTED.');
    
    // Close modal and reload dashboard
    closeInvoiceDetailModal();
    loadDashboard();
  } catch (error) {
    console.error('Error submitting invoice:', error);
    alert('❌ Lỗi: ' + error.message);
  }
}

// Mark invoice as paid function for buyer (FINANCED -> SETTLED)
async function markInvoiceAsPaid(invoiceId) {
  if (!confirm('Bạn có chắc chắn đã thanh toán hóa đơn này?\n\nSau khi xác nhận, hóa đơn sẽ chuyển sang trạng thái SETTLED và chờ bank xác nhận.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/invoices/${invoiceId}/mark-paid`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + getToken(),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể đánh dấu đã thanh toán');
    }

    const result = await response.json();
    alert('✅ Đã đánh dấu thanh toán thành công!\n\nHóa đơn đã chuyển sang trạng thái SETTLED.');
    
    // Close modal and reload dashboard
    closeInvoiceDetailModal();
    loadDashboard();
  } catch (error) {
    console.error('Error marking as paid:', error);
    alert('❌ Lỗi: ' + error.message);
  }
}

function closeInvoiceDetailModal() {
  document.getElementById('invoiceDetailModal').style.display = 'none';
}

// Store current editing invoice
let currentEditingInvoice = null;

// Open edit modal for buyer/SME to edit invoice
function openEditModal(invoice, role = 'buyer') {
  currentEditingInvoice = invoice;
  currentEditingInvoice.editRole = role; // Store who is editing
  
  // Populate edit form - Basic Info
  document.getElementById('editInvoiceNumber').textContent = `Invoice #${invoice.invoice_number}`;
  document.getElementById('editSerialNo').value = invoice.serial_no || '';
  document.getElementById('editIssueDate').value = invoice.issue_date || '';
  document.getElementById('editLookupCode').value = invoice.lookup_code || '';
  document.getElementById('editCurrency').value = invoice.currency || 'VND';
  document.getElementById('editBuyerName').value = invoice.buyer_name || '';
  document.getElementById('editAmount').value = invoice.amount || '';
  
  // Populate factoring terms
  document.getElementById('editRecourseType').value = invoice.recourse_type !== null ? String(invoice.recourse_type) : '1';
  document.getElementById('editPaymentTerm').value = invoice.payment_term || '';
  document.getElementById('editLtv').value = invoice.proposed_ltv || '';
  document.getElementById('editDiscountRate').value = invoice.discount_rate || '';
  document.getElementById('editFundingCategory').value = invoice.funding_category || 'working_capital';
  document.getElementById('editDisputeMethod').value = invoice.dispute_method || '';
  document.getElementById('editFundingPurpose').value = invoice.funding_purpose || '';
  
  // Clear edit note
  document.getElementById('editNote').value = '';
  
  // Close detail modal, open edit modal
  closeInvoiceDetailModal();
  document.getElementById('invoiceEditModal').style.display = 'block';
}

// Close edit modal
function closeEditModal() {
  document.getElementById('invoiceEditModal').style.display = 'none';
  currentEditingInvoice = null;
}

// Save invoice changes
async function saveInvoiceChanges() {
  if (!currentEditingInvoice) {
    alert('No invoice selected for editing');
    return;
  }

  const editNote = document.getElementById('editNote').value.trim();
  if (!editNote) {
    alert('⚠️ Vui lòng nhập ghi chú về những thay đổi bạn đã thực hiện');
    return;
  }

  const updates = {
    serial_no: document.getElementById('editSerialNo').value,
    issue_date: document.getElementById('editIssueDate').value,
    lookup_code: document.getElementById('editLookupCode').value,
    currency: document.getElementById('editCurrency').value,
    buyer_name: document.getElementById('editBuyerName').value,
    amount: parseFloat(document.getElementById('editAmount').value),
    recourse_type: parseInt(document.getElementById('editRecourseType').value),
    payment_term: parseInt(document.getElementById('editPaymentTerm').value),
    proposed_ltv: parseFloat(document.getElementById('editLtv').value),
    discount_rate: parseFloat(document.getElementById('editDiscountRate').value),
    funding_category: document.getElementById('editFundingCategory').value,
    dispute_method: document.getElementById('editDisputeMethod').value,
    funding_purpose: document.getElementById('editFundingPurpose').value,
    edit_note: editNote
  };

  // Determine which endpoint to use based on who is editing
  const editRole = currentEditingInvoice.editRole || 'buyer';
  const endpoint = editRole === 'sme' ? 'sme-edit' : 'buyer-edit';

  try {
    const response = await fetch(`${API_URL}/api/invoices/${currentEditingInvoice.id}/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + getToken(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể cập nhật hóa đơn');
    }

    const result = await response.json();
    
    const editRole = currentEditingInvoice.editRole || 'buyer';
    const message = editRole === 'sme' 
      ? '✅ Cập nhật hóa đơn thành công!\n\nTrạng thái đã chuyển sang EDITING. Buyer sẽ xem lại và phải phê duyệt thay đổi của bạn.'
      : '✅ Cập nhật hóa đơn thành công!\n\nTrạng thái đã chuyển sang EDITING. Nhà cung cấp sẽ xem lại và phải phê duyệt thay đổi của bạn.';
    alert(message);
    
    // Close edit modal and reload
    closeEditModal();
    loadDashboard();
  } catch (error) {
    console.error('Error updating invoice:', error);
    alert('❌ Lỗi: ' + error.message);
  }
}

// Mint NFT for invoice
async function mintInvoiceNFT() {
  const invoiceId = window.currentInvoiceIdForMint;
  
  if (!invoiceId) {
    alert('⚠️ No invoice selected');
    return;
  }

  if (!confirm('🎨 Mint NFT for this invoice?\n\nThis will create an ERC-721 token on the blockchain representing this invoice as a Real World Asset (RWA).\n\nMake sure both SME and Buyer organizations have wallet addresses configured.')) {
    return;
  }

  const mintBtn = document.getElementById('mintNFTBtn');
  const originalText = mintBtn.innerHTML;

  try {
    // Show loading state
    mintBtn.disabled = true;
    mintBtn.innerHTML = `
      <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Minting...
    `;

    const response = await fetch(`${API_URL}/api/blockchain/mint/${invoiceId}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + getToken(),
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || 'Failed to mint NFT');
    }

    // Success!
    alert(`✅ NFT Minted Successfully!\n\n` +
          `Token ID: ${result.token_id}\n` +
          `Contract: ${result.contract_address}\n` +
          `TX Hash: ${result.tx_hash}\n\n` +
          `Gas Used: ${result.gas_used}`);

    // Close modal and reload
    closeInvoiceDetailModal();
    loadDashboard();

  } catch (error) {
    console.error('Error minting NFT:', error);
    alert('❌ Failed to mint NFT:\n\n' + error.message);
    
    // Restore button
    if (mintBtn) {
      mintBtn.disabled = false;
      mintBtn.innerHTML = originalText;
    }
  }
}

// Load buyer user information
async function loadBuyerUserInfo(buyerId) {
  try {
    const response = await fetch(`${API_URL}/api/users/${buyerId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + getToken(),
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const userInfo = await response.json();
      
      // Display buyer user information
      const buyerUserSection = document.getElementById('detailBuyerUser');
      const buyerUserName = document.getElementById('detailBuyerUserName');
      const buyerEmail = document.getElementById('detailBuyerEmail');
      
      if (buyerUserSection && buyerUserName && buyerEmail) {
        buyerUserName.textContent = userInfo.name || userInfo.username || 'N/A';
        buyerEmail.textContent = userInfo.email || 'N/A';
        buyerUserSection.style.display = 'flex';
      }
    }
  } catch (error) {
    console.error('Error loading buyer user info:', error);
  }
}

// Close invoice with 0.1% fee
async function closeInvoiceWithFee(invoiceId) {
  if (!confirm('Bạn có chắc chắn muốn đóng hóa đơn này?\n\nPhí đóng hóa đơn 0.1% sẽ được áp dụng.')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/bank/invoices/${invoiceId}/close-invoice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to close invoice');
    }

    const result = await response.json();
    
    // Format closing fee in VND
    const formattedFee = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(result.closing_fee);
    
    alert(`✅ Hóa đơn đã được đóng thành công!\n\n` +
          `Phí đóng hóa đơn (0.1%): ${formattedFee}\n\n` +
          `${result.note}`);
    
    // Refresh dashboard to show updated status
    if (typeof loadDashboard === 'function') {
      loadDashboard();
    }
  } catch (error) {
    console.error('Error closing invoice:', error);
    alert('❌ Lỗi: ' + error.message);
  }
}

// Pay closing fee
async function payClosingFee(invoiceId) {
  if (!confirm('Xác nhận thanh toán phí đóng hóa đơn?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/bank/invoices/${invoiceId}/pay-closing-fee`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to pay closing fee');
    }

    const result = await response.json();
    
    // Format closing fee in VND
    const formattedFee = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(result.closing_fee);
    
    alert(`✅ Phí đóng hóa đơn đã được thanh toán!\n\nSố tiền: ${formattedFee}`);
    
    // Refresh dashboard
    if (typeof loadDashboard === 'function') {
      loadDashboard();
    }
  } catch (error) {
    console.error('Error paying closing fee:', error);
    alert('❌ Lỗi: ' + error.message);
  }
}

// Highlight changes in EDITING invoices
function highlightChanges(invoice) {
  try {
    const originalData = JSON.parse(invoice.original_data_snapshot);
    
    // Define field mappings
    const fieldMappings = [
      { id: 'detailSerialNo', current: invoice.serial_no, original: originalData.serial_no },
      { id: 'detailIssueDate', current: invoice.issue_date, original: originalData.issue_date },
      { id: 'detailLookupCode', current: invoice.lookup_code, original: originalData.lookup_code },
      { id: 'detailAmount', current: invoice.amount, original: originalData.amount },
      { id: 'detailCurrency', current: invoice.currency, original: originalData.currency },
      { id: 'detailBuyer', current: invoice.buyer_name, original: originalData.buyer_name },
      { id: 'detailRecourseType', current: invoice.recourse_type, original: originalData.recourse_type },
      { id: 'detailPaymentTerm', current: invoice.payment_term, original: originalData.payment_term },
      { id: 'detailLtv', current: invoice.proposed_ltv, original: originalData.proposed_ltv },
      { id: 'detailDiscountRate', current: invoice.discount_rate, original: originalData.discount_rate },
      { id: 'detailFundingCategory', current: invoice.funding_category, original: originalData.funding_category },
      { id: 'detailFundingPurpose', current: invoice.funding_purpose, original: originalData.funding_purpose },
      { id: 'detailDisputeMethod', current: invoice.dispute_method, original: originalData.dispute_method }
    ];
    
    // Highlight changed fields
    fieldMappings.forEach(field => {
      const element = document.getElementById(field.id);
      if (element) {
        const parent = element.closest('.bg-white, .p-4, .rounded-lg');
        
        // Convert to comparable format
        const currentValue = String(field.current || '');
        const originalValue = String(field.original || '');
        
        if (currentValue !== originalValue) {
          // Field has changed - add highlight
          if (parent) {
            parent.style.backgroundColor = '#fef3c7'; // yellow-100
            parent.style.borderLeft = '4px solid #f59e0b'; // yellow-500
            parent.style.transition = 'all 0.3s ease';
            
            // Add change indicator
            if (!parent.querySelector('.change-indicator')) {
              const indicator = document.createElement('div');
              indicator.className = 'change-indicator text-xs text-yellow-700 font-semibold mt-1 flex items-center gap-1';
              indicator.innerHTML = `
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
                </svg>
                <span>Đã thay đổi: ${originalValue || '(trống)'} → ${currentValue || '(trống)'}</span>
              `;
              parent.appendChild(indicator);
            }
          }
        }
      }
    });
    
    // Add summary banner at the top
    const modal = document.getElementById('invoiceDetailModal');
    if (modal && !modal.querySelector('.changes-banner')) {
      const banner = document.createElement('div');
      banner.className = 'changes-banner bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg';
      banner.innerHTML = `
        <div class="flex items-start">
          <svg class="h-6 w-6 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div class="flex-1">
            <p class="text-sm font-semibold text-yellow-800">⚠️ Hóa đơn đang được chỉnh sửa</p>
            <p class="text-xs text-yellow-700 mt-1">Các trường được tô màu vàng đã bị thay đổi so với bản gốc. Xem chi tiết bên dưới mỗi trường.</p>
          </div>
        </div>
      `;
      
      const modalBody = modal.querySelector('.mt-6.space-y-6');
      if (modalBody) {
        modalBody.insertBefore(banner, modalBody.firstChild);
      }
    }
  } catch (error) {
    console.error('Error highlighting changes:', error);
  }
}

// Clear all highlights
function clearHighlights() {
  // Remove all change indicators
  document.querySelectorAll('.change-indicator').forEach(el => el.remove());
  
  // Remove changes banner
  document.querySelectorAll('.changes-banner').forEach(el => el.remove());
  
  // Reset backgrounds
  document.querySelectorAll('[style*="background-color: rgb(254, 243, 199)"]').forEach(el => {
    el.style.backgroundColor = '';
    el.style.borderLeft = '';
  });
}
