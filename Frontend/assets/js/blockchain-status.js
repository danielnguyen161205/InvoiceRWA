/**
 * Invoice Blockchain Status Display
 * Hiển thị trạng thái NFT của invoice
 */

// Load config - Must be loaded after config.js in HTML
const API_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

/**
 * Check if invoice is tokenized
 */
async function checkInvoiceTokenization(invoiceId) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        const response = await fetch(`${API_URL}/api/blockchain/token/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error('Failed to check tokenization status');
            return null;
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error checking tokenization:', error);
        return null;
    }
}

/**
 * Mint NFT for invoice
 */
async function mintInvoiceNFT(invoiceId) {
    const confirmMsg = 'Bạn có chắc muốn token hóa hóa đơn này lên blockchain?\n\n' +
                      'Sau khi token hóa:\n' +
                      '- Hóa đơn sẽ được chuyển thành NFT\n' +
                      '- Quyền sở hữu được ghi nhận trên blockchain\n' +
                      '- Có thể giao dịch và chuyển nhượng\n' +
                      '- Cần phí gas để thực hiện giao dịch';
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    // Show loading
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'nft-minting-loading';
    loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loadingDiv.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-xl max-w-md">
            <div class="flex items-center space-x-4">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <div>
                    <h3 class="text-lg font-semibold">Đang token hóa...</h3>
                    <p class="text-sm text-gray-600">Vui lòng đợi giao dịch được xác nhận trên blockchain</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(loadingDiv);
    
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('Vui lòng đăng nhập!');
            return;
        }
        
        const response = await fetch(`http://localhost:8000/api/blockchain/mint/${invoiceId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        // Remove loading
        document.body.removeChild(loadingDiv);
        
        if (response.ok && result.success) {
            // Show success modal
            showNFTSuccessModal(result);
            
            // Refresh invoice list if function exists
            if (typeof loadInvoices === 'function') {
                loadInvoices();
            }
        } else {
            alert(`Lỗi: ${result.detail || 'Không thể token hóa hóa đơn'}`);
        }
        
    } catch (error) {
        // Remove loading
        if (document.getElementById('nft-minting-loading')) {
            document.body.removeChild(loadingDiv);
        }
        
        console.error('Error minting NFT:', error);
        alert('Lỗi khi token hóa hóa đơn. Vui lòng thử lại.');
    }
}

/**
 * Show NFT success modal
 */
function showNFTSuccessModal(result) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div class="text-center mb-6">
                <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">
                    🎉 Token hóa thành công!
                </h3>
                <p class="text-gray-600">
                    Hóa đơn đã được chuyển thành NFT trên blockchain
                </p>
            </div>
            
            <div class="space-y-3 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-500 mb-1">Token ID</div>
                    <div class="font-mono font-semibold text-lg">#${result.token_id}</div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-500 mb-1">Transaction Hash</div>
                    <div class="font-mono text-xs break-all">${result.tx_hash}</div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-500 mb-1">Contract Address</div>
                    <div class="font-mono text-xs break-all">${result.contract_address}</div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-500 mb-1">Gas Used</div>
                    <div class="font-semibold">${result.gas_used.toLocaleString()} gas</div>
                </div>
            </div>
            
            <div class="flex space-x-3">
                <a href="${result.explorer_url}" target="_blank" 
                   class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center">
                    🔍 Xem trên Explorer
                </a>
                <button onclick="this.closest('.fixed').remove()" 
                        class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                    Đóng
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Add NFT badge to invoice card
 */
function addNFTBadgeToInvoice(invoiceElement, tokenData) {
    if (!tokenData || !tokenData.tokenized) return;
    
    // Create badge
    const badge = document.createElement('div');
    badge.className = 'inline-flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold';
    badge.innerHTML = `
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 6.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
        <span>NFT #${tokenData.token_id}</span>
    `;
    
    // Add click handler to view details
    badge.style.cursor = 'pointer';
    badge.onclick = () => showNFTDetailsModal(tokenData);
    
    // Find status element and insert badge
    const statusElement = invoiceElement.querySelector('.invoice-status');
    if (statusElement) {
        statusElement.parentNode.insertBefore(badge, statusElement);
    }
}

/**
 * Show NFT details modal
 */
function showNFTDetailsModal(tokenData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const blockchainData = tokenData.blockchain_data || {};
    
    modal.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start mb-6">
                <h3 class="text-2xl font-bold">🔗 Blockchain NFT Details</h3>
                <button onclick="this.closest('.fixed').remove()" 
                        class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 mb-1">Token ID</div>
                    <div class="text-3xl font-bold text-purple-600">#${tokenData.token_id}</div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-500 mb-1">Contract</div>
                    <div class="font-mono text-xs break-all">${tokenData.contract_address}</div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-500 mb-1">Standard</div>
                    <div class="font-semibold">${tokenData.token_standard}</div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg col-span-2">
                    <div class="text-sm text-gray-500 mb-1">Current Owner</div>
                    <div class="font-mono text-sm break-all">${tokenData.current_owner || 'N/A'}</div>
                </div>
            </div>
            
            ${blockchainData.invoice_number ? `
                <div class="border-t pt-4 mb-6">
                    <h4 class="font-semibold mb-3 text-gray-700">📄 Invoice Data on Blockchain</h4>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span class="text-gray-500">Invoice Number:</span>
                            <span class="font-semibold ml-2">${blockchainData.invoice_number}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Serial No:</span>
                            <span class="font-semibold ml-2">${blockchainData.serial_no || 'N/A'}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Face Value:</span>
                            <span class="font-semibold ml-2">${(blockchainData.face_value || 0).toLocaleString()} VND</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Funding Request:</span>
                            <span class="font-semibold ml-2">${(blockchainData.funding_request || 0).toLocaleString()} VND</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Payment Status:</span>
                            <span class="font-semibold ml-2">${blockchainData.is_paid ? '✅ Paid' : '⏳ Unpaid'}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Closed:</span>
                            <span class="font-semibold ml-2">${blockchainData.is_closed ? '✅ Yes' : '❌ No'}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="flex space-x-3">
                <a href="${tokenData.explorer_url}" target="_blank"
                   class="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 text-center font-semibold">
                    🔍 View on Blockchain Explorer
                </a>
                <button onclick="this.closest('.fixed').remove()" 
                        class="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Initialize NFT status for all invoices on page
 */
async function initializeNFTStatus() {
    const invoiceCards = document.querySelectorAll('[data-invoice-id]');
    
    for (const card of invoiceCards) {
        const invoiceId = card.dataset.invoiceId;
        if (!invoiceId) continue;
        
        const tokenData = await checkInvoiceTokenization(invoiceId);
        if (tokenData && tokenData.tokenized) {
            addNFTBadgeToInvoice(card, tokenData);
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNFTStatus);
} else {
    // DOM already loaded
    setTimeout(initializeNFTStatus, 500);
}
