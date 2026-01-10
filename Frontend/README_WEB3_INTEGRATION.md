# Frontend Web3 Integration Guide

## Hướng dẫn tích hợp Web3 vào Frontend

### 📦 Bước 1: Thêm thư viện Web3

Thêm vào HTML (trước thẻ `</body>`):

```html
<!-- Option 1: Web3.js -->
<script src="https://cdn.jsdelivr.net/npm/web3@1.9.0/dist/web3.min.js"></script>

<!-- Option 2: Ethers.js (recommended - nhẹ hơn) -->
<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>

<!-- Web3 Manager -->
<script src="../js/web3.js"></script>

<!-- Blockchain Status Display -->
<script src="../js/blockchain-status.js"></script>
```

### 🔧 Bước 2: Thêm Wallet Connection Button

Thêm vào profile.html hoặc dashboard:

```html
<!-- Wallet Connection Section -->
<div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200 mb-6">
    <div class="flex items-center justify-between mb-4">
        <div>
            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                🔗 Blockchain Wallet
            </h3>
            <p class="text-sm text-gray-600 mt-1">
                Kết nối ví để token hóa hóa đơn lên blockchain
            </p>
        </div>
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
             alt="MetaMask" class="h-12">
    </div>
    
    <div id="wallet-section">
        <!-- Not connected state -->
        <div id="wallet-not-connected" class="hidden">
            <button onclick="connectWallet()" 
                    class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
                <span>Connect MetaMask Wallet</span>
            </button>
            <p class="text-xs text-gray-500 mt-2 text-center">
                Cần cài đặt <a href="https://metamask.io" target="_blank" class="text-purple-600 hover:underline">MetaMask extension</a>
            </p>
        </div>
        
        <!-- Connected state -->
        <div id="wallet-connected" class="hidden">
            <div class="bg-white p-4 rounded-lg border border-gray-200 mb-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-500">Wallet Address</span>
                    <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        ✓ Connected
                    </span>
                </div>
                <div class="font-mono text-sm font-semibold" id="wallet-address">
                    0x0000...0000
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div class="bg-white p-3 rounded-lg border border-gray-200">
                    <div class="text-xs text-gray-500 mb-1">Network</div>
                    <div class="font-semibold text-sm" id="wallet-network">-</div>
                </div>
                <div class="bg-white p-3 rounded-lg border border-gray-200">
                    <div class="text-xs text-gray-500 mb-1">Balance</div>
                    <div class="font-semibold text-sm" id="wallet-balance">0 ETH</div>
                </div>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="saveWalletToOrg()" 
                        class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold">
                    💾 Save to Organization
                </button>
                <button onclick="disconnectWallet()" 
                        class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-semibold">
                    Disconnect
                </button>
            </div>
        </div>
    </div>
</div>

<script>
// Global Web3 Manager instance
const web3Manager = new Web3Manager();

// Check if already connected on page load
window.addEventListener('load', async () => {
    const account = await web3Manager.getCurrentAccount();
    if (account) {
        web3Manager.account = account;
        updateWalletUI(account);
    } else {
        document.getElementById('wallet-not-connected').classList.remove('hidden');
    }
});

// Connect wallet
async function connectWallet() {
    const account = await web3Manager.connectWallet();
    if (account) {
        updateWalletUI(account);
    }
}

// Disconnect wallet
function disconnectWallet() {
    web3Manager.disconnectWallet();
    document.getElementById('wallet-connected').classList.add('hidden');
    document.getElementById('wallet-not-connected').classList.remove('hidden');
}

// Update UI with wallet info
async function updateWalletUI(account) {
    if (!account) return;
    
    // Hide not connected, show connected
    document.getElementById('wallet-not-connected').classList.add('hidden');
    document.getElementById('wallet-connected').classList.remove('hidden');
    
    // Update address
    document.getElementById('wallet-address').textContent = account;
    
    // Update network
    const networkName = web3Manager.getNetworkName(web3Manager.chainId);
    document.getElementById('wallet-network').textContent = networkName;
    
    // Update balance
    const balance = await web3Manager.getBalance(account);
    document.getElementById('wallet-balance').textContent = 
        parseFloat(balance).toFixed(4) + ' ETH';
}

// Make it global for web3Manager callback
window.updateWalletUI = updateWalletUI;

// Save wallet to organization
async function saveWalletToOrg() {
    const success = await web3Manager.saveWalletAddress();
    if (success) {
        // Show success message or update UI
        console.log('Wallet saved successfully');
    }
}
</script>
```

### 📋 Bước 3: Thêm NFT Status vào Invoice Cards

Trong trang hiển thị danh sách invoice (sme-dashboard.html), thêm data attribute:

```html
<!-- Invoice Card -->
<div class="invoice-card" data-invoice-id="1">
    <div class="flex justify-between items-start mb-2">
        <h4 class="font-semibold">INV-001</h4>
        
        <!-- NFT badge sẽ được thêm tự động ở đây -->
        
        <span class="invoice-status px-2 py-1 rounded text-xs">
            Pending
        </span>
    </div>
    
    <div class="text-sm text-gray-600">
        Amount: 1,000,000 VND
    </div>
    
    <!-- Actions -->
    <div class="mt-3 flex space-x-2">
        <button onclick="viewInvoiceDetails(1)" 
                class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm">
            View Details
        </button>
        
        <!-- Token hóa button (chỉ hiện khi chưa mint) -->
        <button onclick="mintInvoiceNFT(1)" 
                class="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm nft-mint-btn">
            🔗 Token hóa
        </button>
    </div>
</div>
```

Script sẽ tự động:
- Kiểm tra invoice nào đã tokenized
- Thêm badge NFT vào card
- Ẩn button "Token hóa" nếu đã mint

### 🎯 Bước 4: Test Integration

1. **Mở Developer Console** (F12)
2. **Connect wallet:**
   ```javascript
   await web3Manager.connectWallet()
   ```

3. **Check blockchain status:**
   ```javascript
   fetch('http://localhost:8000/api/blockchain/status')
     .then(r => r.json())
     .then(console.log)
   ```

4. **Mint NFT:**
   ```javascript
   mintInvoiceNFT(1)  // Invoice ID 1
   ```

### 📱 Bước 5: Mobile Wallet Integration

Để support mobile browsers với MetaMask app:

```javascript
// Detect mobile and open MetaMask app
function connectMobileWallet() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && !window.ethereum) {
        // Redirect to MetaMask mobile app
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
        return;
    }
    
    // Desktop flow
    connectWallet();
}
```

### 🔔 Bước 6: Transaction Notifications

Thêm vào sau khi mint thành công:

```javascript
function showTransactionNotification(txHash, explorerUrl) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50 animate-slide-up';
    notification.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <div class="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
            </div>
            <div class="flex-1">
                <p class="font-semibold text-gray-900">Transaction Confirmed!</p>
                <p class="text-sm text-gray-600 mt-1">Invoice has been tokenized</p>
                <a href="${explorerUrl}" target="_blank" 
                   class="text-xs text-blue-600 hover:underline mt-2 inline-block">
                    View on Explorer →
                </a>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="text-gray-400 hover:text-gray-600">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        notification.remove();
    }, 10000);
}
```

### ⚠️ Error Handling

```javascript
// Handle common errors
async function handleWeb3Error(error) {
    if (error.code === 4001) {
        // User rejected transaction
        alert('Bạn đã từ chối giao dịch');
    } else if (error.code === -32002) {
        // Request already pending
        alert('Vui lòng kiểm tra MetaMask. Có yêu cầu đang chờ xác nhận.');
    } else if (error.message.includes('insufficient funds')) {
        alert('Không đủ ETH để thanh toán phí gas');
    } else {
        alert('Lỗi: ' + error.message);
    }
}
```

### 🎨 CSS for Animations

Thêm vào style.css:

```css
/* NFT Badge Animation */
@keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
}

.nft-badge {
    background: linear-gradient(90deg, #8B5CF6 0%, #EC4899 50%, #8B5CF6 100%);
    background-size: 200% auto;
    animation: shimmer 3s linear infinite;
}

/* Slide up animation */
@keyframes slide-up {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-slide-up {
    animation: slide-up 0.3s ease-out;
}
```

### 🔍 Debugging Tips

1. **Check if MetaMask installed:**
   ```javascript
   console.log('MetaMask:', typeof window.ethereum !== 'undefined');
   ```

2. **Check account:**
   ```javascript
   console.log('Account:', web3Manager.account);
   ```

3. **Check network:**
   ```javascript
   console.log('Chain ID:', web3Manager.chainId);
   ```

4. **Monitor events:**
   ```javascript
   window.ethereum.on('accountsChanged', console.log);
   window.ethereum.on('chainChanged', console.log);
   ```

### 📚 Full Integration Example

Xem file demo: `Frontend/assets/pages/blockchain-demo.html`

### 🚀 Production Checklist

- [ ] Test trên Localhost
- [ ] Test trên Sepolia Testnet
- [ ] Verify smart contract on Etherscan
- [ ] Update RPC URLs to production
- [ ] Add error monitoring (Sentry)
- [ ] Add analytics tracking
- [ ] Test mobile wallet flow
- [ ] Security audit
- [ ] Gas optimization
- [ ] User documentation
