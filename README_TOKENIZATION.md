# 🚀 Invoice RWA - Blockchain Tokenization Complete Guide

## Tổng quan hệ thống Token hóa Hóa đơn

Hệ thống Invoice RWA cho phép chuyển đổi hóa đơn thành NFT (Non-Fungible Token) trên blockchain, tạo ra Real World Assets (RWA) có thể giao dịch, chuyển nhượng và theo dõi một cách minh bạch.

### 📊 Kiến trúc hệ thống

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │──────│    Backend       │──────│   Blockchain    │
│                 │      │                  │      │                 │
│ • MetaMask      │      │ • FastAPI        │      │ • Smart         │
│ • Web3.js       │◄─────│ • Web3.py        │◄─────│   Contract      │
│ • UI/UX         │      │ • MySQL          │      │ • ERC-721 NFT   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

### 🎯 Tính năng chính

1. **Token hóa Invoice**: Chuyển hóa đơn thành NFT ERC-721
2. **Quyền sở hữu minh bạch**: Theo dõi chủ sở hữu trên blockchain
3. **Metadata onchain**: Lưu thông tin hóa đơn trực tiếp trên chain
4. **Giao dịch tự động**: Smart contract quản lý mua/bán/thanh toán
5. **Audit trail**: Lịch sử giao dịch không thể thay đổi

---

## 📦 Cài đặt

### 1. Backend Setup

```powershell
cd Backend

# Install Python dependencies
pip install -r requirements.txt

# Add wallet_address column to database
python add_wallet_address_migration.py

# Configure environment
copy .env.example .env
# Edit .env with your blockchain config
```

### 2. Smart Contract Setup

```powershell
cd Backend/contracts

# Install Node.js dependencies
npm install

# Compile contract
npx hardhat compile

# Start local blockchain (Terminal 1)
npx hardhat node

# Deploy contract (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost

# Copy contract address to .env
# NFT_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. Frontend Setup

Thêm vào HTML pages:

```html
<!-- Web3 Libraries -->
<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>

<!-- Custom Scripts -->
<script src="../js/web3.js"></script>
<script src="../js/blockchain-status.js"></script>
```

---

## 🔧 Cấu hình

### Backend .env

```env
# Blockchain Configuration
WEB3_RPC_URL=http://127.0.0.1:8545
WEB3_CHAIN_ID=1337
NFT_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
WEB3_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Smart Contract Networks

**Localhost (Development)**
- RPC: http://127.0.0.1:8545
- Chain ID: 1337
- Free ETH for testing

**Sepolia Testnet (Staging)**
- RPC: https://sepolia.infura.io/v3/YOUR_KEY
- Chain ID: 11155111
- Get test ETH: https://sepoliafaucet.com

**Polygon Mainnet (Production)**
- RPC: https://polygon-rpc.com
- Chain ID: 137
- Low gas fees (~$0.01/tx)

---

## 🎬 Workflow

### 1. Người dùng kết nối ví

```javascript
// User clicks "Connect Wallet"
const account = await web3Manager.connectWallet();

// Save wallet to organization
await web3Manager.saveWalletAddress();
```

Backend lưu wallet address vào bảng `organizations`.

### 2. SME tạo hóa đơn

```python
# Create invoice in database
invoice = FactoringContract(
    invoice_number="INV-001",
    seller_org_id=1,
    buyer_org_id=2,
    face_value=1000000,
    funding_request=850000,
    discount_rate=12.5,
    maturity_date=datetime(2024, 12, 31)
)
db.add(invoice)
db.commit()
```

### 3. Token hóa lên blockchain

**Option A: Auto mint khi tạo invoice**

```python
# In invoice creation endpoint
result = web3_service.mint_invoice_nft(
    invoice_id=invoice.id,
    seller_address=seller_org.wallet_address,
    buyer_address=buyer_org.wallet_address,
    # ... other params
)

invoice.token_id = result['token_id']
invoice.nft_contract_address = contract_address
db.commit()
```

**Option B: Manual mint qua button**

```javascript
// Frontend button click
async function mintInvoiceNFT(invoiceId) {
    const response = await fetch(`/api/blockchain/mint/${invoiceId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const result = await response.json();
    if (result.success) {
        showSuccessModal(result);
    }
}
```

### 4. Bank mua hóa đơn

Smart contract tự động:
- Chuyển NFT từ SME → Bank
- Chuyển tiền từ Bank → SME
- Cập nhật owner onchain

```solidity
function purchaseInvoice(uint256 tokenId) 
    public 
    payable 
{
    // Check payment amount
    require(msg.value >= invoice.fundingRequest);
    
    // Transfer NFT
    _transfer(ownerOf(tokenId), msg.sender, tokenId);
    
    // Update data
    invoice.bankPurchaser = msg.sender;
    
    // Pay seller
    payable(invoice.sellerOrg).transfer(msg.value);
}
```

### 5. Buyer thanh toán

```solidity
function payInvoice(uint256 tokenId) 
    public 
    payable 
{
    require(msg.sender == invoice.buyerOrg);
    require(msg.value >= invoice.faceValue);
    
    // Pay bank
    payable(invoice.bankPurchaser).transfer(msg.value);
    
    // Mark as paid
    invoice.isPaid = true;
}
```

---

## 📡 API Endpoints

### GET /api/blockchain/status

Kiểm tra kết nối blockchain

```json
{
  "connected": true,
  "chain_id": 1337,
  "network": "Localhost",
  "latest_block": 123,
  "contract_address": "0x5FbDB...",
  "backend_wallet": "0xf39Fd...",
  "backend_wallet_balance": 9999.5
}
```

### POST /api/blockchain/mint/{invoice_id}

Token hóa hóa đơn

**Request:**
```http
POST /api/blockchain/mint/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice NFT minted successfully",
  "token_id": 1,
  "tx_hash": "0xabc123...",
  "contract_address": "0x5FbDB...",
  "gas_used": 234567,
  "explorer_url": "https://etherscan.io/tx/0xabc123..."
}
```

### GET /api/blockchain/token/{invoice_id}

Lấy thông tin NFT

**Response:**
```json
{
  "tokenized": true,
  "token_id": 1,
  "contract_address": "0x5FbDB...",
  "token_standard": "ERC-721",
  "current_owner": "0xf39Fd...",
  "blockchain_data": {
    "invoice_id": 1,
    "invoice_number": "INV-001",
    "face_value": 1000000,
    "is_paid": false
  }
}
```

### POST /api/kyc/organization/wallet

Lưu địa chỉ ví

**Request:**
```json
{
  "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet address saved successfully",
  "wallet_address": "0xf39Fd...",
  "organization_id": 1
}
```

---

## 🔒 Security

### Backend

1. **Private Key Protection**
   - Store in .env, NEVER commit to Git
   - Use hardware wallet in production
   - Rotate keys regularly

2. **API Authorization**
   - JWT token required
   - Check user owns invoice before minting
   - Verify wallet ownership

3. **Smart Contract**
   - OpenZeppelin audited contracts
   - onlyOwner modifier for minting
   - Require checks for payments

### Frontend

1. **Wallet Security**
   - User signs with their own key
   - No private key handling in frontend
   - MetaMask handles security

2. **Transaction Verification**
   - Show gas estimates
   - Confirm before signing
   - Verify transaction success

---

## 🧪 Testing

### Local Testing

```powershell
# Terminal 1: Start Hardhat node
cd Backend/contracts
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start backend
cd Backend
uvicorn app.main:app --reload

# Terminal 4: Test API
curl http://localhost:8000/api/blockchain/status
```

### Test Accounts (Hardhat)

Hardhat cung cấp 20 test accounts, mỗi account 10,000 ETH:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

### Test Flow

1. **Connect wallet** (Account #0 - SME)
2. **Create organization** với wallet address
3. **Create invoice**
4. **Mint NFT** qua button hoặc API
5. **Verify** trên blockchain explorer
6. **Check ownership** với MetaMask

---

## 📊 Database Schema

### organizations table

```sql
ALTER TABLE organizations 
ADD COLUMN wallet_address VARCHAR(128) AFTER signature_specimen_doc;
```

### factoring_contracts table (already exists)

```sql
token_id VARCHAR(128)
nft_contract_address VARCHAR(128)
token_standard VARCHAR(20) DEFAULT 'ERC-721'
blockchain_tx_hash VARCHAR(128)
```

---

## 🚀 Deployment

### Testnet Deployment (Sepolia)

1. **Get Sepolia ETH**
   - https://sepoliafaucet.com
   - https://www.alchemy.com/faucets/ethereum-sepolia

2. **Update hardhat.config.js**
   ```javascript
   sepolia: {
     url: "https://sepolia.infura.io/v3/YOUR_KEY",
     accounts: ["YOUR_PRIVATE_KEY"]
   }
   ```

3. **Deploy**
   ```powershell
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Verify on Etherscan**
   ```powershell
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

### Production Deployment (Polygon)

1. **Buy MATIC** tokens for gas

2. **Update config**
   ```env
   WEB3_RPC_URL=https://polygon-rpc.com
   WEB3_CHAIN_ID=137
   ```

3. **Deploy with production key**
   ```powershell
   npx hardhat run scripts/deploy.js --network polygon
   ```

4. **Update frontend URLs**

---

## 📚 Tài liệu tham khảo

- [Backend Blockchain Guide](Backend/README_BLOCKCHAIN.md)
- [Frontend Web3 Integration](Frontend/README_WEB3_INTEGRATION.md)
- [Smart Contract Code](Backend/contracts/InvoiceNFT.sol)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Web3.py Documentation](https://web3py.readthedocs.io/)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

## ❓ Troubleshooting

### "Contract ABI not found"

```powershell
cd Backend/contracts
npx hardhat compile
```

### "Insufficient funds for gas"

Wallet không đủ ETH/MATIC. Nạp thêm từ faucet hoặc exchange.

### "Nonce too low"

Reset MetaMask: Settings → Advanced → Reset Account

### Transaction fails

Check:
- Đúng network (localhost/sepolia/polygon)?
- Đủ gas?
- Wallet address đã set chưa?
- Invoice đã mint chưa?

---

## 🎉 Kết luận

Bây giờ bạn đã có:

✅ Smart contract ERC-721 hoàn chỉnh  
✅ Backend Web3 integration  
✅ API endpoints cho tokenization  
✅ Frontend wallet connection  
✅ NFT status display  
✅ Complete deployment guide  

**Bước tiếp theo:**
1. Deploy lên Sepolia testnet
2. Test với real users
3. Security audit
4. Deploy lên Polygon mainnet
5. Launch! 🚀

---

**Liên hệ hỗ trợ:**
- GitHub Issues: [Create issue](https://github.com/your-repo/issues)
- Documentation: [Wiki](https://github.com/your-repo/wiki)
