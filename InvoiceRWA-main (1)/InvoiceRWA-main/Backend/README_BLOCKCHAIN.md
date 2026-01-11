# Invoice NFT Blockchain Deployment Guide

## Hướng dẫn triển khai Invoice tokenization lên blockchain

### 📋 Yêu cầu

1. **Node.js** (v16+) - Để chạy Hardhat
2. **Python** (3.9+) - Backend với web3.py
3. **MetaMask** - Wallet để kết nối từ frontend

### 🚀 Bước 1: Cài đặt Smart Contract Dependencies

```powershell
cd Backend/contracts
npm install
```

Dependencies sẽ bao gồm:
- Hardhat: Framework phát triển smart contract
- OpenZeppelin: Thư viện ERC-721 NFT chuẩn
- Ethers.js: Thư viện tương tác blockchain

### 🔧 Bước 2: Compile Smart Contract

```powershell
npx hardhat compile
```

Output:
- `artifacts/contracts/InvoiceNFT.sol/InvoiceNFT.json` - ABI và bytecode
- File này sẽ được backend sử dụng để tương tác với contract

### 🌐 Bước 3A: Deploy lên Local Blockchain (Hardhat)

**Terminal 1 - Start local node:**
```powershell
npx hardhat node
```

Hardhat sẽ tạo local blockchain và cung cấp 20 test accounts với mỗi account có 10,000 ETH.

**Terminal 2 - Deploy contract:**
```powershell
npx hardhat run scripts/deploy.js --network localhost
```

Lưu lại **contract address** từ output:
```
InvoiceNFT deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 🌐 Bước 3B: Deploy lên Sepolia Testnet (recommended for testing)

1. **Lấy Sepolia ETH** từ faucet:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia

2. **Cấu hình Hardhat với private key của bạn:**
   
   Sửa `hardhat.config.js`:
   ```javascript
   networks: {
     sepolia: {
       url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
       accounts: ["YOUR_PRIVATE_KEY_HERE"]
     }
   }
   ```

3. **Deploy:**
   ```powershell
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. Contract sẽ tự động verify trên Etherscan.

### ⚙️ Bước 4: Cấu hình Backend

1. **Cài đặt Python dependencies:**
   ```powershell
   cd Backend
   pip install -r requirements.txt
   ```

2. **Tạo file `.env`** từ `.env.example`:
   ```powershell
   copy .env.example .env
   ```

3. **Cập nhật `.env` với thông tin blockchain:**
   ```env
   # For localhost
   WEB3_RPC_URL=http://127.0.0.1:8545
   WEB3_CHAIN_ID=1337
   NFT_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   WEB3_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

   **Lưu ý:** Private key trên là account #0 của Hardhat test accounts. 
   Trong production, dùng wallet riêng và GIỮ BÍ MẬT!

4. **Chạy migration để thêm wallet_address column:**
   ```powershell
   python add_wallet_address_migration.py
   ```

5. **Khởi động backend:**
   ```powershell
   uvicorn app.main:app --reload
   ```

### 📊 Bước 5: Test Blockchain Integration

**Check blockchain status:**
```powershell
curl http://localhost:8000/api/blockchain/status
```

Expected response:
```json
{
  "connected": true,
  "chain_id": 1337,
  "network": "Localhost",
  "latest_block": 0,
  "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "backend_wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "backend_wallet_balance": 10000.0
}
```

### 🎯 Bước 6: Mint Invoice NFT

1. **Đăng nhập vào hệ thống** và tạo organization
2. **Set wallet address** cho organization (SME và Buyer)
3. **Tạo invoice** 
4. **Mint NFT** qua API:

```powershell
curl -X POST "http://localhost:8000/api/blockchain/mint/1" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "message": "Invoice NFT minted successfully",
  "token_id": 1,
  "tx_hash": "0x...",
  "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "gas_used": 234567
}
```

### 🔍 Bước 7: Verify NFT

**Get token information:**
```powershell
curl "http://localhost:8000/api/blockchain/token/1" `
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "tokenized": true,
  "token_id": 1,
  "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "current_owner": "0x...",
  "blockchain_data": {
    "invoice_id": 1,
    "invoice_number": "INV-001",
    "face_value": 1000000,
    "is_paid": false
  }
}
```

### 🌍 Deploy lên Production (Polygon)

Polygon mainnet có phí gas thấp (~$0.01/transaction), phù hợp cho RWA.

1. **Lấy MATIC** (Polygon token) từ exchange
2. **Cập nhật hardhat.config.js:**
   ```javascript
   polygon: {
     url: "https://polygon-rpc.com",
     accounts: ["YOUR_PRODUCTION_PRIVATE_KEY"],
     chainId: 137
   }
   ```

3. **Deploy:**
   ```powershell
   npx hardhat run scripts/deploy.js --network polygon
   ```

4. **Cập nhật .env:**
   ```env
   WEB3_RPC_URL=https://polygon-rpc.com
   WEB3_CHAIN_ID=137
   NFT_CONTRACT_ADDRESS=<deployed_address>
   ```

### 📱 Frontend Integration

Xem `README_FRONTEND_WEB3.md` để tích hợp MetaMask và hiển thị NFT status.

### 🔒 Security Best Practices

1. **NEVER commit private keys** to Git
2. Use **environment variables** for sensitive data
3. Use **hardware wallet** for production deployment
4. Enable **multi-sig** for contract ownership
5. **Audit** smart contract before mainnet deployment

### 🐛 Troubleshooting

**Problem:** Backend shows "Contract ABI not found"
**Solution:** Compile contract first: `cd contracts && npx hardhat compile`

**Problem:** Transaction fails with "insufficient funds"
**Solution:** Make sure wallet has enough ETH/MATIC for gas fees

**Problem:** "Nonce too low" error
**Solution:** Reset MetaMask account or wait for blockchain to sync

**Problem:** Contract not verified on Etherscan
**Solution:** Run manual verification:
```powershell
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### 📚 Resources

- Hardhat Documentation: https://hardhat.org/docs
- OpenZeppelin: https://docs.openzeppelin.com/
- Web3.py: https://web3py.readthedocs.io/
- Polygon: https://docs.polygon.technology/
- Sepolia Faucet: https://sepoliafaucet.com/
