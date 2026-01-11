/**
 * Create Invoice Modal Handler
 * Xử lý modal tạo hóa đơn và hợp đồng bao thanh toán
 */

// ===== MODAL CONTROL =====
function openCreateInvoiceModal() {
    const modal = document.getElementById('createInvoiceModal');
    
    if (!modal) {
        console.error('Modal element not found');
        return;
    }
    
    console.log('Opening modal...');
    
    // Show modal using inline style (override Tailwind hidden class)
    modal.style.display = 'block';
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    
    // Load buyer list immediately when opening modal
    loadBuyerOptions();
    setDefaultValues();
    
    // Auto-refresh is already running from page load
}

function closeCreateInvoiceModal() {
    const modal = document.getElementById('createInvoiceModal');
    
    if (!modal) {
        console.error('Modal element not found');
        return;
    }
    
    console.log('Closing modal...');
    
    // Hide modal using inline style
    modal.style.display = 'none';
    
    // Reset form
    const form = document.getElementById('createInvoiceForm');
    if (form) {
        form.reset();
    }
    
    // Re-enable body scroll
    document.body.style.overflow = '';
    
    // Auto-refresh continues running in background
}

// Close modal khi click bên ngoài
window.addEventListener('click', function(event) {
    const modal = document.getElementById('createInvoiceModal');
    if (event.target === modal) {
        closeCreateInvoiceModal();
    }
});

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    // Update tab buttons
    const allTabs = document.querySelectorAll('.tab-btn');
    allTabs.forEach(tab => {
        tab.classList.remove('border-indigo-500', 'text-indigo-600', 'bg-white');
        tab.classList.add('border-transparent', 'text-gray-500', 'hover:bg-gray-50');
    });
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.classList.remove('border-transparent', 'text-gray-500', 'hover:bg-gray-50');
    activeTab.classList.add('border-indigo-500', 'text-indigo-600', 'bg-white');
    
    // Update tab content with animation
    const allContent = document.querySelectorAll('.tab-content');
    allContent.forEach(content => content.classList.add('hidden'));
    
    const targetContent = document.getElementById(`content-${tabName}`);
    targetContent.classList.remove('hidden');
}

// ===== LOAD BUYER OPTIONS =====
let buyerRefreshInterval = null;

async function loadBuyerOptions() {
    const indicator = document.getElementById('buyerRefreshIndicator');
    
    try {
        // Show loading indicator
        if (indicator) {
            indicator.classList.remove('hidden');
        }
        
        const response = await fetch(`${API_URL}/api/kyc/organizations/buyers`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            console.warn('Buyer endpoint not available yet. You can still create invoices by entering buyer info manually.');
            // Add some dummy options for testing
            addDummyBuyerOptions();
            return;
        }
        
        const buyers = await response.json();
        const select = document.getElementById('buyerOrgId');
        
        if (!select) return;
        
        // Save current selection
        const currentValue = select.value;
        
        // Clear existing options except first
        select.innerHTML = '<option value="">-- Chọn Buyer --</option>';
        
        if (buyers.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Chưa có Buyer nào được KYC verified';
            option.disabled = true;
            select.appendChild(option);
        } else {
            buyers.forEach(buyer => {
                const option = document.createElement('option');
                option.value = buyer.id;
                
                // Display format: Legal Name (Tax ID) - Type
                const displayName = buyer.legal_name || buyer.trade_name || 'N/A';
                const taxId = buyer.tax_id || 'N/A';
                const orgType = buyer.org_type || 'BUYER';
                
                option.textContent = `${displayName} (${taxId}) - ${orgType}`;
                option.setAttribute('data-org-type', orgType);
                option.setAttribute('data-tax-id', taxId);
                
                select.appendChild(option);
            });
        }
        
        // Restore selection if still valid
        if (currentValue) {
            select.value = currentValue;
        }
        
        console.log(`✅ Loaded ${buyers.length} KYC-verified buyers (SME/BUYER)`);
        
    } catch (error) {
        console.warn('Error loading buyers. Using demo data:', error);
        addDummyBuyerOptions();
    } finally {
        // Hide loading indicator after a brief delay for better UX
        if (indicator) {
            setTimeout(() => {
                indicator.classList.add('hidden');
            }, 500);
        }
    }
}

// Auto-refresh buyer list every 30 seconds continuously
function startBuyerRefresh() {
    // Clear any existing interval
    if (buyerRefreshInterval) {
        clearInterval(buyerRefreshInterval);
    }
    
    // Refresh every 30 seconds
    buyerRefreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing buyer list...');
        loadBuyerOptions();
    }, 30000);
    
    console.log('✅ Started continuous buyer list refresh (every 30s)');
}

function stopBuyerRefresh() {
    if (buyerRefreshInterval) {
        clearInterval(buyerRefreshInterval);
        buyerRefreshInterval = null;
        console.log('⏸️ Stopped buyer list refresh');
    }
}

// Start auto-refresh on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Initializing buyer list auto-refresh...');
    loadBuyerOptions(); // Load immediately
    startBuyerRefresh(); // Then refresh every 30s
});

// Temporary function to add demo buyers until backend is ready
function addDummyBuyerOptions() {
    const select = document.getElementById('buyerOrgId');
    select.innerHTML = '<option value="">-- Chọn Buyer --</option>';
    
    // Demo buyers
    const dummyBuyers = [
        { id: 1, name: 'Tập đoàn XYZ Corporation', tax_id: '9876543210' },
        { id: 2, name: 'Công ty TNHH ABC Trading', tax_id: '0123456789' },
        { id: 3, name: 'Công ty CP Thương Mại DEF', tax_id: '5555666677' }
    ];
    
    dummyBuyers.forEach(buyer => {
        const option = document.createElement('option');
        option.value = buyer.id;
        option.textContent = `${buyer.name} (${buyer.tax_id})`;
        select.appendChild(option);
    });
}

// ===== SET DEFAULT VALUES =====
function setDefaultValues() {
    // Set today as default issue date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('issueDate').value = today;
    
    // Default values
    document.getElementById('currency').value = 'VND';
    document.getElementById('recourseType').value = '1';
    document.getElementById('disputeMethod').value = 'VIAC';
    document.getElementById('proposedLtv').value = '80';
    document.getElementById('discountRate').value = '12.5';
    document.getElementById('paymentTerm').value = '30';
}

// ===== AUTO CALCULATE SUMMARY =====
document.addEventListener('DOMContentLoaded', function() {
    // Listen to changes on financial fields
    const fieldsToWatch = ['invoiceValue', 'proposedLtv', 'discountRate', 'paymentTerm', 'issueDate'];
    
    fieldsToWatch.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', updateSummary);
            element.addEventListener('change', updateSummary);
        }
    });
});

function updateSummary() {
    const faceValue = parseFloat(document.getElementById('invoiceValue').value) || 0;
    const ltv = parseFloat(document.getElementById('proposedLtv').value) || 0;
    const discountRate = parseFloat(document.getElementById('discountRate').value) || 0;
    const paymentTerm = parseInt(document.getElementById('paymentTerm').value) || 0;
    
    // Calculations
    const fundingRequest = faceValue * (ltv / 100);
    const reserve = faceValue - fundingRequest;
    const discountFee = fundingRequest * (discountRate / 100) * (paymentTerm / 365);
    
    // Update display
    const currency = document.getElementById('currency').value;
    document.getElementById('summaryFaceValue').textContent = formatCurrency(faceValue, currency);
    document.getElementById('summaryFundingRequest').textContent = formatCurrency(fundingRequest, currency);
    document.getElementById('summaryReserve').textContent = formatCurrency(reserve, currency);
    document.getElementById('summaryDiscountFee').textContent = formatCurrency(discountFee, currency);
}

function formatCurrency(amount, currency = 'VND') {
    if (currency === 'VND') {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// ===== XML FILE UPLOAD HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const xmlFileInput = document.getElementById('xmlFile');
    if (xmlFileInput) {
        xmlFileInput.addEventListener('change', handleXMLUpload);
    }
});

async function handleXMLUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xml')) {
        alert('Vui lòng chọn file XML hợp lệ');
        event.target.value = '';
        return;
    }
    
    try {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        // Parse XML và điền vào form (tùy theo cấu trúc XML thực tế)
        // Ví dụ cơ bản:
        const invoiceNo = xmlDoc.querySelector('InvoiceNo, SoHD')?.textContent;
        const serialNo = xmlDoc.querySelector('SerialNo, KyHieu')?.textContent;
        const issueDate = xmlDoc.querySelector('IssueDate, NgayLap')?.textContent;
        const invoiceValue = xmlDoc.querySelector('Total, TongTien')?.textContent;
        
        if (invoiceNo) document.getElementById('invoiceNo').value = invoiceNo;
        if (serialNo) document.getElementById('serialNo').value = serialNo;
        if (issueDate) {
            // Convert date format if needed
            const dateMatch = issueDate.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (dateMatch) {
                document.getElementById('issueDate').value = issueDate;
            }
        }
        if (invoiceValue) {
            const cleanValue = invoiceValue.replace(/[^\d.]/g, '');
            document.getElementById('invoiceValue').value = cleanValue;
            updateSummary();
        }
        
        alert('Đã tải thông tin từ XML thành công!');
    } catch (error) {
        console.error('Error parsing XML:', error);
        alert('Không thể đọc file XML. Vui lòng kiểm tra lại định dạng.');
    }
}

// ===== FORM SUBMISSION =====
// Register form submit handler immediately
// Since script is loaded at end of body, DOM is ready
(function() {
    console.log('🔧 Registering form submit handler...');
    
    function registerFormHandler() {
        const form = document.getElementById('createInvoiceForm');
        if (form) {
            console.log('✅ Form found, attaching submit handler');
            form.addEventListener('submit', handleFormSubmit);
        } else {
            console.warn('⚠️ Form not found, retrying...');
            setTimeout(registerFormHandler, 100);
        }
    }
    
    // Try to register immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerFormHandler);
    } else {
        registerFormHandler();
    }
})();

async function handleFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🔄 Form submit triggered');
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const buttonText = submitButton?.querySelector('span');
    const originalButtonText = buttonText?.textContent || 'Tạo Hóa Đơn';
    
    // Validate form BEFORE disabling button
    if (!validateForm()) {
        console.log('❌ Form validation failed');
        alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }
    
    console.log('✅ Form validation passed');
    
    // Disable button after validation passes
    if (submitButton) {
        submitButton.disabled = true;
        if (buttonText) {
            buttonText.textContent = 'Đang xử lý...';
        }
    }
    
    try {
        
        // Gather all form data
        const formData = {
            invoice_number: document.getElementById('invoiceNo').value.trim(),
            serial_no: document.getElementById('serialNo').value.trim(),
            issue_date: document.getElementById('issueDate').value,
            lookup_code: document.getElementById('lookupCode').value?.trim() || null,
            amount: parseFloat(document.getElementById('invoiceValue').value),
            currency: document.getElementById('currency').value,
            buyer_name: document.getElementById('buyerOrgId').selectedOptions[0]?.text || 'Unknown Buyer',
            buyer_org_id: parseInt(document.getElementById('buyerOrgId').value) || null,
            funding_category: document.getElementById('fundingCategory').value || null,
            funding_purpose: document.getElementById('fundingPurpose').value?.trim() || null,
            recourse_type: parseInt(document.getElementById('recourseType').value),
            payment_term: parseInt(document.getElementById('paymentTerm').value) || 30,
            proposed_ltv: parseFloat(document.getElementById('proposedLtv').value) || 80,
            discount_rate: parseFloat(document.getElementById('discountRate').value) || 12.5,
            dispute_method: document.getElementById('disputeMethod').value || 'VIAC'
        };
        
        console.log('📋 Form data:', formData);
        console.log('🚀 Sending request to API...');
        console.log('📍 API URL:', `${API_URL}/api/invoices/`);
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(`${API_URL}/api/invoices/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            
            let errorMessage = 'Tạo hóa đơn thất bại';
            try {
                const error = JSON.parse(errorText);
                errorMessage = error.detail || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('✅ Invoice created successfully:', result);
        
        alert('✅ Tạo hóa đơn thành công!');
        closeCreateInvoiceModal();
        
        // Reload dashboard
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        } else {
            window.location.reload();
        }
        
    } catch (error) {
        console.error('❌ Error creating invoice:', error);
        
        let errorMessage = 'Lỗi không xác định';
        if (error.name === 'AbortError') {
            errorMessage = 'Request timeout - Server không phản hồi. Vui lòng kiểm tra server đang chạy.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        alert('❌ Lỗi: ' + errorMessage);
    } finally {
        // Always re-enable button
        console.log('🔧 Re-enabling submit button...');
        if (submitButton) {
            submitButton.disabled = false;
            if (buttonText) {
                buttonText.textContent = originalButtonText;
            }
        }
    }
}

function validateForm() {
    // Check required fields
    const requiredFields = [
        { id: 'buyerOrgId', name: 'Bên mua' },
        { id: 'invoiceNo', name: 'Số hóa đơn' },
        { id: 'serialNo', name: 'Ký hiệu' },
        { id: 'issueDate', name: 'Ngày lập' },
        { id: 'invoiceValue', name: 'Giá trị hóa đơn' }
    ];
    
    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element) {
            console.error(`Field ${field.id} not found`);
            continue;
        }
        
        const value = element.value;
        if (!value || value.trim() === '') {
            alert(`Vui lòng nhập ${field.name}`);
            element.focus();
            // Switch to invoice tab if necessary
            const invoiceTab = document.getElementById('content-invoice');
            if (invoiceTab && invoiceTab.classList.contains('hidden')) {
                switchTab('invoice');
            }
            return false;
        }
    }
    
    // Check invoice value > 0
    const invoiceValue = parseFloat(document.getElementById('invoiceValue').value);
    if (isNaN(invoiceValue) || invoiceValue <= 0) {
        alert('Giá trị hóa đơn phải lớn hơn 0');
        document.getElementById('invoiceValue').focus();
        switchTab('invoice');
        return false;
    }
    
    console.log('✅ All validations passed');
    return true;
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(event) {
    // ESC to close modal
    if (event.key === 'Escape') {
        const modal = document.getElementById('createInvoiceModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeCreateInvoiceModal();
        }
    }
});
