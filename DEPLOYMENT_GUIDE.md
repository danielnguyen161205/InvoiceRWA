# 📖 Hướng Dẫn Triển Khai InvoiceRWA - Từ Đầu Đến Cuối

> **Hướng dẫn chi tiết cho máy tính chưa cài đặt gì**  
> Dành cho Windows, macOS và Linux

---

## 📋 Mục Lục

1. [Giới Thiệu Dự Án](#giới-thiệu-dự-án)
2. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
3. [Bước 1: Cài Đặt Công Cụ Cơ Bản](#bước-1-cài-đặt-công-cụ-cơ-bản)
4. [Bước 2: Cài Đặt Database](#bước-2-cài-đặt-database)
5. [Bước 3: Clone và Cấu Hình Dự Án](#bước-3-clone-và-cấu-hình-dự-án)
6. [Bước 4: Cài Đặt Backend](#bước-4-cài-đặt-backend)
7. [Bước 5: Cài Đặt Smart Contracts](#bước-5-cài-đặt-smart-contracts)
8. [Bước 6: Cài Đặt Frontend](#bước-6-cài-đặt-frontend)
9. [Bước 7: Khởi Chạy Hệ Thống](#bước-7-khởi-chạy-hệ-thống)
10. [Xử Lý Sự Cố](#xử-lý-sự-cố)
11. [Tài Khoản Mặc Định](#tài-khoản-mặc-định)

---

## 🎯 Giới Thiệu Dự Án

**InvoiceRWA** là nền tảng tokenization hóa đơn với blockchain, cho phép:

- ✅ **KYC/KYB Verification**: Xác minh danh tính cá nhân và doanh nghiệp
- ✅ **UBO Management**: Quản lý cổ đông và người thụ hưởng cuối cùng
- ✅ **Invoice Tokenization**: Token hóa hóa đơn lên blockchain (ERC-721 NFT)
- ✅ **Web3 Integration**: Kết nối MetaMask và Ethereum
- ✅ **Role-Based Access**: Phân quyền Admin, Bank, SME, Buyer
- ✅ **Document Scanner**: Quét CCCD/CMND/Passport tự động

### 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│              (HTML/CSS/JavaScript)                          │
│                                                             │
│  - Login/Register          - Dashboard (SME/Bank/Admin)    │
│  - KYC Forms              - Invoice Management             │
│  - Document Upload        - Web3 Integration               │
└──────────────────┬──────────────────────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────────────────────┐
│                    Backend (FastAPI)                        │
│                                                             │
│  - Authentication (JWT)    - KYC/KYB Processing            │
│  - Invoice API            - Blockchain Integration         │
│  - Role Management        - Document Storage (S3)          │
└──────────────┬─────────────────────┬────────────────────────┘
               │                     │
               │ MySQL               │ Web3.py
               │                     │
┌──────────────▼─────────┐  ┌────────▼─────────────────────────┐
│    MySQL Database      │  │   Ethereum Blockchain            │
│                        │  │                                  │
│  - Users               │  │  - Smart Contracts (Solidity)    │
│  - Organizations       │  │  - Invoice NFTs (ERC-721)        │
│  - Invoices            │  │  - Hardhat Development           │
│  - KYC Records         │  │                                  │
└────────────────────────┘  └──────────────────────────────────┘
```

---

## 💻 Yêu Cầu Hệ Thống

### Phần Cứng

- **CPU**: 2 cores trở lên
- **RAM**: 4GB trở lên (khuyến nghị 8GB)
- **Disk**: 10GB trống

### Hệ Điều Hành

- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Ubuntu 20.04+ / Debian 11+

---

## 🔧 Bước 1: Cài Đặt Công Cụ Cơ Bản

### 1.1. Cài Đặt Git

#### Windows:
```powershell
# Tải Git từ: https://git-scm.com/download/win
# Hoặc dùng winget:
winget install Git.Git

# Kiểm tra cài đặt:
git --version
```

#### macOS:
```bash
# Dùng Homebrew:
brew install git

# Kiểm tra:
git --version
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install git -y
git --version
```

---

### 1.2. Cài Đặt Python 3.11+

#### Windows:
```powershell
# Tải Python từ: https://www.python.org/downloads/
# Hoặc dùng winget:
winget install Python.Python.3.11

# Kiểm tra:
python --version
# Nếu không chạy, thử:
python3 --version

# Cài pip (nếu chưa có):
python -m ensurepip --upgrade
```

#### macOS:
```bash
# Dùng Homebrew:
brew install python@3.11

# Kiểm tra:
python3 --version
pip3 --version
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip -y
python3.11 --version
pip3 --version
```

---

### 1.3. Cài Đặt Node.js và npm

#### Windows:
```powershell
# Tải từ: https://nodejs.org/ (LTS version)
# Hoặc dùng winget:
winget install OpenJS.NodeJS.LTS

# Kiểm tra:
node --version
npm --version
```

#### macOS:
```bash
# Dùng Homebrew:
brew install node

# Kiểm tra:
node --version
npm --version
```

#### Linux (Ubuntu/Debian):
```bash
# Cài Node.js 20.x LTS:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Kiểm tra:
node --version
npm --version
```

---

### 1.4. Cài Đặt Visual Studio Code (Tùy Chọn)

```powershell
# Windows:
winget install Microsoft.VisualStudioCode

# macOS:
brew install --cask visual-studio-code

# Linux:
sudo snap install code --classic
```

**Extensions Khuyến Nghị:**
- Python (Microsoft)
- Pylance
- JavaScript (ES6)
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client (test API)

---

## 🗄️ Bước 2: Cài Đặt Database

### Option A: MySQL (Khuyến Nghị - Dự án đang dùng)

#### Windows:

```powershell
# Tải MySQL Installer: https://dev.mysql.com/downloads/installer/
# Chọn MySQL Community Server 8.0

# Hoặc dùng Chocolatey:
choco install mysql

# Khởi động MySQL service:
net start MySQL80
```

#### macOS:

```bash
# Dùng Homebrew:
brew install mysql

# Khởi động MySQL:
brew services start mysql

# Bảo mật MySQL:
mysql_secure_installation
```

#### Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install mysql-server -y

# Khởi động MySQL:
sudo systemctl start mysql
sudo systemctl enable mysql

# Bảo mật:
sudo mysql_secure_installation
```

### Tạo Database và User

```sql
# Đăng nhập MySQL:
mysql -u root -p

# Tạo database:
CREATE DATABASE invoicedb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Tạo user (nếu chưa có):
CREATE USER 'invoicerwa_user'@'localhost' IDENTIFIED BY 'your_strong_password';

# Cấp quyền:
GRANT ALL PRIVILEGES ON invoicedb.* TO 'invoicerwa_user'@'localhost';
FLUSH PRIVILEGES;

# Thoát:
EXIT;
```

**⚠️ LƯU Ý**: Nếu dự án đã có database trên cloud (như Aiven), bạn có thể bỏ qua bước này.

---

### Option B: MySQL Cloud (Aiven) - Đang Sử Dụng

Dự án hiện đang kết nối với MySQL trên **Aiven Cloud**. Thông tin kết nối trong `Backend/db/db.py`:

```python
HOST = "mysql-bfd5202-nguyenthai161205-25d3.l.aivencloud.com"
PORT = 22740
USER = "avnadmin"
PASSWORD = "AVNS_Ulfgj5QiKBfkQbkOBDM"
DB = "invoicedb"
```

✅ **Không cần cài đặt MySQL local** nếu dùng cloud database.

---

## 📦 Bước 3: Clone và Cấu Hình Dự Án

### 3.1. Clone Repository

```powershell
# Clone dự án:
git clone https://github.com/danielnguyen161205/InvoiceRWA.git

# Di chuyển vào thư mục:
cd InvoiceRWA

# Kiểm tra cấu trúc:
ls
```

Bạn sẽ thấy:
```
InvoiceRWA/
├── Backend/              # FastAPI Backend + Smart Contracts
├── Frontend/             # HTML/CSS/JS Frontend
├── README.md
└── .gitignore
```

---

## 🐍 Bước 4: Cài Đặt Backend

### 4.1. Tạo Virtual Environment

```powershell
# Di chuyển vào thư mục Backend:
cd Backend

# Tạo virtual environment:
python -m venv venv

# Kích hoạt (Windows PowerShell):
.\venv\Scripts\Activate.ps1

# Kích hoạt (Windows CMD):
venv\Scripts\activate.bat

# Kích hoạt (macOS/Linux):
source venv/bin/activate
```

Bạn sẽ thấy `(venv)` xuất hiện trước dấu nhắc lệnh.

### 4.2. Cài Đặt Dependencies

```powershell
# Upgrade pip:
python -m pip install --upgrade pip

# Cài đặt packages:
pip install -r requirements.txt
```

**Packages chính được cài:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pymysql` - MySQL connector
- `sqlalchemy` - ORM
- `passlib[bcrypt]` - Password hashing
- `python-jose` - JWT tokens
- `web3` - Ethereum integration
- `boto3` - AWS S3 (document storage)

### 4.3. Cấu Hình Database

File `Backend/db/db.py` đã được cấu hình với cloud database. Nếu bạn muốn dùng local MySQL:

```python
# Sửa file Backend/db/db.py:
USER = "invoicerwa_user"
PASSWORD = "your_strong_password"
HOST = "localhost"
PORT = 3306
DB = "invoicedb"
```

### 4.4. Tạo Tables

```powershell
# Chạy script tạo bảng (nếu có):
python -c "from db.db import get_connection; conn = get_connection(); cursor = conn.cursor(); cursor.execute(open('db/create_table.sql').read()); conn.commit()"

# Hoặc chạy migration với Alembic:
alembic upgrade head
```

### 4.5. Kiểm Tra Backend

```powershell
# Chạy server:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Server sẽ chạy tại:
# http://localhost:8000
# API Docs: http://localhost:8000/docs
```

Mở trình duyệt và truy cập `http://localhost:8000/docs` để xem API documentation.

---

## ⚡ Bước 5: Cài Đặt Smart Contracts

### 5.1. Cài Đặt Dependencies

```powershell
# Di chuyển vào thư mục contracts (mở terminal mới):
cd Backend/contracts

# Cài đặt packages:
npm install
```

**Packages chính:**
- `hardhat` - Ethereum development environment
- `@openzeppelin/contracts` - Smart contract library
- `@nomicfoundation/hardhat-toolbox` - Hardhat plugins

### 5.2. Compile Smart Contracts

```powershell
# Compile contracts:
npx hardhat compile
```

Bạn sẽ thấy thư mục `artifacts/` và `cache/` được tạo.

### 5.3. Chạy Local Blockchain (Hardhat Node)

```powershell
# Chạy local blockchain (terminal riêng):
npx hardhat node
```

Hardhat node sẽ chạy tại `http://127.0.0.1:8545` và tạo 20 test accounts với 10000 ETH mỗi account.

**💡 Lưu private key của account đầu tiên để import vào MetaMask!**

### 5.4. Deploy Smart Contracts

```powershell
# Mở terminal mới, deploy contracts:
cd Backend/contracts
npx hardhat run scripts/deploy.js --network localhost
```

Bạn sẽ nhận được địa chỉ contract, ví dụ:
```
InvoiceNFT deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**📝 Lưu địa chỉ này** để cấu hình trong backend/frontend.

---

## 🌐 Bước 6: Cài Đặt Frontend

### 6.1. Cài Đặt Dependencies

```powershell
# Di chuyển vào thư mục Frontend (terminal mới):
cd Frontend

# Cài đặt packages:
npm install
```

**Packages chính:**
- `sass` - CSS preprocessor
- `tailwindcss` - Utility CSS framework
- `live-server` - Development server

### 6.2. Build CSS

```powershell
# Build Sass và Tailwind CSS:
npm run build:css
```

### 6.3. Kiểm Tra Frontend

```powershell
# Chạy development server:
npm start
```

Frontend sẽ mở tại `http://localhost:5500` với trang login.

---

## 🚀 Bước 7: Khởi Chạy Hệ Thống

### 7.1. Tổng Quan

Bạn cần chạy **4 processes** đồng thời:

1. **Backend API** - Port 8000
2. **Hardhat Node** - Port 8545
3. **Frontend Server** - Port 5500
4. **Database** - MySQL (đã chạy sẵn)

### 7.2. Khởi Chạy Đầy Đủ

#### Terminal 1 - Backend:
```powershell
cd Backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2 - Blockchain:
```powershell
cd Backend/contracts
npx hardhat node
```

#### Terminal 3 - Frontend:
```powershell
cd Frontend
npm start
```

### 7.3. Tạo Tài Khoản Admin (Lần Đầu)

```powershell
# Terminal Backend (khi server đang chạy):
cd Backend
python -c "
from passlib.context import CryptContext
from db.db import get_connection

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
hashed_password = pwd_context.hash('Admin123!')

conn = get_connection()
cursor = conn.cursor()
cursor.execute('''
    INSERT INTO users (email, hashed_password, role, roles, organization_id)
    VALUES (%s, %s, %s, %s, %s)
''', ('admin@invoicerwa.com', hashed_password, 'ADMIN', 'ADMIN', None))
conn.commit()
print('✅ Admin account created: admin@invoicerwa.com / Admin123!')
"
```

### 7.4. Truy Cập Hệ Thống

1. Mở trình duyệt: `http://localhost:5500`
2. Đăng nhập với:
   - Email: `admin@invoicerwa.com`
   - Password: `Admin123!`

---

## 🔌 Bước 8: Cấu Hình MetaMask

### 8.1. Cài Đặt MetaMask

- Chrome: https://metamask.io/download/
- Firefox/Edge: Tìm trong extension store

### 8.2. Kết Nối Hardhat Network

1. Mở MetaMask
2. Click network dropdown → **Add Network**
3. Nhập thông tin:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

### 8.3. Import Test Account

1. Click account icon → **Import Account**
2. Dán private key từ Hardhat node
3. Account sẽ có 10000 ETH để test

---

## 🔍 Xử Lý Sự Cố

### Lỗi 1: `Module not found: pymysql`

```powershell
# Giải pháp:
pip install pymysql dbutils
```

### Lỗi 2: `Access denied for user`

```powershell
# Kiểm tra MySQL đang chạy:
# Windows:
net start MySQL80

# macOS/Linux:
sudo systemctl status mysql

# Kiểm tra password trong Backend/db/db.py
```

### Lỗi 3: `Port 8000 already in use`

```powershell
# Windows - Kill process trên port 8000:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

### Lỗi 4: `npm ERR! EACCES: permission denied`

```bash
# macOS/Linux - Fix npm permissions:
sudo chown -R $(whoami) ~/.npm
```

### Lỗi 5: `Cannot connect to blockchain`

```powershell
# Kiểm tra Hardhat node đang chạy:
# Terminal riêng:
cd Backend/contracts
npx hardhat node

# Kiểm tra RPC URL trong code: http://127.0.0.1:8545
```

### Lỗi 6: Frontend không load CSS

```powershell
# Build lại CSS:
cd Frontend
npm run build:css

# Clear browser cache: Ctrl + Shift + R (Windows)
# Hoặc Cmd + Shift + R (macOS)
```

### Lỗi 7: `Table doesn't exist`

```sql
-- Chạy lại script tạo bảng:
mysql -u root -p invoicedb < Backend/db/create_table.sql

-- Hoặc chạy factoring tables:
mysql -u root -p invoicedb < Backend/db/create_factoring_tables.sql
```

### Lỗi 8: CORS Error

```python
# Kiểm tra Backend/app/main.py đã có:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 👤 Tài Khoản Mặc Định

### Admin Account
- **Email**: `admin@invoicerwa.com`
- **Password**: `Admin123!`
- **Role**: ADMIN (Full access)

### Test SME Account (Tạo sau khi đăng ký)
- **Email**: `sme@test.com`
- **Password**: `Test123!`
- **Role**: SME (Supplier)

### Test Bank Account
- **Email**: `bank@test.com`
- **Password**: `Test123!`
- **Role**: BANK (Financial institution)

---

## 📚 Tài Liệu Tham Khảo

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Smart Contracts
- Hardhat Docs: https://hardhat.org/docs
- OpenZeppelin: https://docs.openzeppelin.com/contracts/
- Solidity: https://docs.soliditylang.org/

### Frontend
- Tailwind CSS: https://tailwindcss.com/docs
- Web3.js: https://web3js.readthedocs.io/

---

## 🔄 Quy Trình Phát Triển

### 1. Git Workflow

```powershell
# Tạo branch mới:
git checkout -b feature/ten-tinh-nang

# Commit changes:
git add .
git commit -m "feat: thêm tính năng X"

# Push lên remote:
git push origin feature/ten-tinh-nang

# Tạo Pull Request trên GitHub
```

### 2. Test Before Commit

```powershell
# Backend tests:
cd Backend
pytest

# Smart contract tests:
cd Backend/contracts
npx hardhat test

# Frontend linting:
cd Frontend
npm run lint
```

---

## 🛡️ Best Practices

### Security
- ✅ Không commit `.env` files
- ✅ Không commit private keys
- ✅ Thay đổi password mặc định trong production
- ✅ Sử dụng HTTPS trong production
- ✅ Enable rate limiting cho API

### Development
- ✅ Luôn tạo branch mới cho feature
- ✅ Write meaningful commit messages
- ✅ Test trước khi push
- ✅ Update documentation khi thay đổi API
- ✅ Review code trước khi merge

### Database
- ✅ Backup database định kỳ
- ✅ Sử dụng migrations (Alembic)
- ✅ Index các trường hay query
- ✅ Validate input trước khi insert

---

## 🆘 Hỗ Trợ

### Liên Hệ
- **GitHub Issues**: https://github.com/danielnguyen161205/InvoiceRWA/issues
- **Email**: danielnguyen161205@gmail.com

### Contribution
Xem file [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết về cách đóng góp.

---

## 📝 Checklist Triển Khai

- [ ] Cài đặt Git
- [ ] Cài đặt Python 3.11+
- [ ] Cài đặt Node.js 20+
- [ ] Cài đặt MySQL (hoặc sử dụng cloud)
- [ ] Clone repository
- [ ] Setup Backend virtual environment
- [ ] Cài đặt Backend dependencies
- [ ] Tạo database và tables
- [ ] Chạy Backend server
- [ ] Cài đặt Smart Contracts dependencies
- [ ] Compile và deploy contracts
- [ ] Chạy Hardhat node
- [ ] Cài đặt Frontend dependencies
- [ ] Build Frontend CSS
- [ ] Chạy Frontend server
- [ ] Tạo admin account
- [ ] Cấu hình MetaMask
- [ ] Test đăng nhập
- [ ] Test upload invoice
- [ ] Test tokenization

---

## ✅ Kết Luận

Chúc mừng! 🎉 Bạn đã hoàn thành việc triển khai **InvoiceRWA Platform**.

**Các bước tiếp theo:**
1. Tạo organization (SME/Bank)
2. Upload invoice
3. Thực hiện KYC/KYB
4. Tokenize invoice lên blockchain
5. Test workflow đầy đủ

**Happy coding!** 🚀

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: January 11, 2026  
**Tác giả**: Thai Nguyen
