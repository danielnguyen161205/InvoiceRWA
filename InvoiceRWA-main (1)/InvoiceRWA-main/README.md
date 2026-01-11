# InvoiceRWA - Invoice Tokenization Platform

Nền tảng tokenization hóa đơn với blockchain, KYC/KYB, và tích hợp Web3.

## 🚀 Tính Năng Chính

- **KYC/KYB Verification**: Xác minh danh tính cá nhân và doanh nghiệp
- **UBO (Ultimate Beneficial Owner)**: Quản lý thông tin cổ đông và người thụ hưởng
- **Invoice Tokenization**: Token hóa hóa đơn lên blockchain
- **Web3 Integration**: Kết nối MetaMask và Ethereum
- **Role-Based Access**: Phân quyền cho Admin, Bank, SME, Buyer
- **Document Scanner**: Quét CCCD/CMND/Passport tự động

## 📁 Cấu Trúc Dự Án

```
InvoiceRWA/
├── Backend/              # FastAPI Backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic
│   ├── contracts/       # Smart contracts (Hardhat)
│   └── requirements.txt
│
└── Frontend/            # HTML/CSS/JS Frontend
    ├── assets/
    │   ├── pages/       # HTML pages
    │   ├── css/         # Stylesheets
    │   └── js/          # JavaScript
    └── package.json
```

## 🛠️ Cài Đặt và Chạy

### Backend (Python/FastAPI)

```powershell
cd Backend

# Tạo virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server
uvicorn app.main:app --reload
```

### Smart Contracts (Hardhat)

```powershell
cd Backend/contracts

# Cài đặt dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network localhost
```

### Frontend

```powershell
cd Frontend

# Cài đặt dependencies
npm install

# Chạy dev server
npm start
```

## 🔐 Biến Môi Trường

Tạo file `.env` trong thư mục `Backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost/invoicerwa
SECRET_KEY=your-secret-key-here
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...
```

## 👥 Quy Trình Làm Việc (Git Workflow)

### 1. Clone Repository

```powershell
git clone https://github.com/danielnguyen161205/InvoiceRWA.git
cd InvoiceRWA
```

### 2. Tạo Branch Mới

```powershell
# Tạo branch cho feature mới
git checkout -b feature/ten-tinh-nang

# Hoặc tạo branch để sửa bug
git checkout -b fix/sua-loi-xyz
```

### 3. Làm Việc và Commit

```powershell
# Thêm file đã thay đổi
git add .

# Commit với message rõ ràng
git commit -m "feat: Thêm tính năng ABC"
```

### 4. Push Lên GitHub

```powershell
git push origin feature/ten-tinh-nang
```

### 5. Tạo Pull Request

1. Vào GitHub: https://github.com/danielnguyen161205/InvoiceRWA
2. Click **Pull requests** → **New pull request**
3. Chọn: `base: main` ← `compare: feature/ten-tinh-nang`
4. Điền tiêu đề và mô tả chi tiết
5. Click **Create pull request**

### 6. Chờ Review và Merge

- Owner/Admin sẽ review code
- Sửa nếu có yêu cầu thay đổi
- Sau khi được approve, code sẽ được merge vào `main`

## 📝 Quy Tắc Commit Message

```
feat: Thêm tính năng mới
fix: Sửa bug
docs: Cập nhật tài liệu
style: Format code, không ảnh hưởng logic
refactor: Tái cấu trúc code
test: Thêm/sửa test
chore: Cập nhật dependencies, config
```

## 🔒 Branch Protection Rules

Branch `main` được bảo vệ:
- ✅ Yêu cầu Pull Request trước khi merge
- ✅ Yêu cầu ít nhất 1 approval
- ✅ Không cho phép force push
- ✅ Tự động xóa branch sau khi merge

## 🧪 Testing

```powershell
# Backend tests
cd Backend
pytest

# Run specific test
pytest tests/test_kyc.py
```

## 📚 API Documentation

Sau khi chạy backend, truy cập:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## 🤝 Đóng Góp

Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết chi tiết về quy trình đóng góp code.

## 📄 License

[MIT License](LICENSE)

## 📧 Liên Hệ

- GitHub: [@danielnguyen161205](https://github.com/danielnguyen161205)
- Repository: https://github.com/danielnguyen161205/InvoiceRWA

## 🔗 Links Hữu Ích

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Ethereum Development](https://ethereum.org/en/developers/)
