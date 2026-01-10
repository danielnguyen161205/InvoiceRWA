# Bank Role - Invoice Marketplace Feature

## Tổng quan
Tính năng mới cho phép các ngân hàng và tổ chức tài chính (Bank) tham gia vào hệ thống để mua các invoice đã được phê duyệt.

## Các thành phần đã thêm

### 1. Backend Changes

#### Models (`app/models/invoice.py`)
Đã thêm các trường mới vào `Invoice` model:
- `bank_id`: ID của ngân hàng đã mua invoice
- `purchased_at`: Thời gian mua invoice
- `purchase_price`: Giá mua thực tế

#### API Endpoints (`app/api/invoices.py`)
Các endpoint mới cho Bank:

**GET `/invoices/bank/approved`**
- Xem danh sách invoice đã được APPROVED và chưa được mua
- Chỉ Bank role mới truy cập được

**GET `/invoices/bank/purchased`**
- Xem danh sách invoice mà Bank đã mua
- Chỉ hiển thị invoice của Bank user hiện tại

**POST `/invoices/{invoice_id}/purchase`**
- Mua một invoice đã được APPROVED
- Request body: `{ "purchase_price": <số tiền> }`
- Chỉ Bank role mới được phép

#### Schemas (`app/schemas/invoice.py`)
`InvoiceOut` schema đã được cập nhật để bao gồm:
- `bank_id`
- `purchased_at`
- `purchase_price`

### 2. Frontend Changes

#### Bank Dashboard (`Frontend/assets/pages/bank-dashboard.html`)
Giao diện mới dành riêng cho Bank với 2 tabs:

**Available Invoices Tab:**
- Hiển thị tất cả invoice đã APPROVED và có thể mua
- Thông tin: Invoice Number, Buyer Name, Amount, Issue Date, Payment Term, Discount Rate
- Nút "Purchase" để mua invoice

**My Portfolio Tab:**
- Hiển thị invoice đã mua
- Thông tin: Original Amount, Purchase Price, Purchased Date
- Tính toán lợi nhuận tiềm năng

**Purchase Modal:**
- Form nhập giá mua
- Hiển thị thông tin invoice
- Gợi ý giá dựa trên discount rate

#### Registration Flow (`Frontend/assets/pages/register.html`)
- Thêm dropdown chọn role: SME, BUYER, hoặc BANK
- Thông báo KYB cho Bank users

#### Authentication (`Frontend/assets/js/auth.js`)
- Bank users được redirect đến `/bank-dashboard.html` sau khi login
- KYB (Know Your Business) verification cho Bank users
- Kiểm tra org_status trước khi cho phép truy cập

### 3. Database Migration

**File:** `Backend/add_bank_fields_migration.py`

Chạy migration để thêm các trường mới:
```bash
cd Backend
python add_bank_fields_migration.py
```

Migration sẽ thêm:
- `bank_id` column với foreign key đến users table
- `purchased_at` column (TIMESTAMP)
- `purchase_price` column (FLOAT)

## Quy trình sử dụng

### 1. Đăng ký tài khoản Bank
1. Truy cập trang register
2. Chọn role "Bank (Financial Institution)"
3. Điền thông tin và đăng ký
4. Sau khi đăng ký thành công, login

### 2. Hoàn tất KYB (Know Your Business)
1. Sau khi login, hệ thống sẽ yêu cầu hoàn tất KYB
2. Điền thông tin tổ chức tài chính
3. Upload giấy tờ cần thiết
4. Chờ admin phê duyệt

### 3. Truy cập Invoice Marketplace
1. Sau khi KYB được approve, login lại
2. Tự động redirect đến Bank Dashboard
3. Tab "Available Invoices" hiển thị invoice có thể mua

### 4. Mua Invoice
1. Browse danh sách invoice đã APPROVED
2. Click nút "Purchase" trên invoice muốn mua
3. Nhập giá mua (hệ thống gợi ý giá dựa trên discount rate)
4. Confirm purchase
5. Invoice được chuyển sang tab "My Portfolio"

### 5. Quản lý Portfolio
1. Tab "My Portfolio" hiển thị tất cả invoice đã mua
2. Xem chi tiết từng invoice
3. Theo dõi payment term và lợi nhuận

## API Flow

```
1. Bank User Login
   POST /api/auth/login
   → Returns JWT with role=BANK

2. Get Available Invoices
   GET /invoices/bank/approved
   Authorization: Bearer <token>
   → Returns list of APPROVED invoices (bank_id = null)

3. Purchase Invoice
   POST /invoices/{invoice_id}/purchase
   Authorization: Bearer <token>
   Body: { "purchase_price": 95000000 }
   → Updates invoice with bank_id, purchased_at, purchase_price

4. View Purchased Invoices
   GET /invoices/bank/purchased
   Authorization: Bearer <token>
   → Returns list of invoices where bank_id = current user
```

## Security

- Chỉ users với role="BANK" mới truy cập được bank endpoints
- JWT token bắt buộc cho tất cả requests
- Bank chỉ có thể mua invoice đã APPROVED
- Bank chỉ có thể xem invoice của chính mình trong portfolio
- Không thể mua invoice đã được mua bởi bank khác

## Invoice Workflow với Bank

```
SME creates → DRAFT
↓
Buyer reviews → EDITING/SUBMITTED
↓
System verifies → APPROVED (available for banks)
↓
Bank purchases → APPROVED (bank_id set)
↓
Payment processing → COMPLETED (future feature)
```

## Notes

- Invoice status vẫn là "APPROVED" sau khi Bank mua (để tracking)
- Bank có thể mua nhiều invoice
- Mỗi invoice chỉ có thể được mua bởi 1 bank
- Purchase price có thể khác với invoice amount (do discount)
- KYB process giống KYC nhưng cho tổ chức thay vì cá nhân

## Testing

### Tạo Bank User
```bash
cd Backend
# Trong Python console hoặc script
from app.core.security import get_password_hash
from app.models.user import User
from app.db.session import SessionLocal

db = SessionLocal()
bank_user = User(
    email="bank@example.com",
    hashed_password=get_password_hash("password123"),
    role=["BANK"],
    kyc_verified=True  # Skip KYB for testing
)
db.add(bank_user)
db.commit()
```

### Test Purchase Flow
1. Login as Bank user
2. Navigate to bank-dashboard.html
3. Ensure có invoice với status=APPROVED
4. Click Purchase
5. Enter price và confirm
6. Check tab "My Portfolio"

## Future Enhancements

- [ ] Separate KYB form với fields riêng cho tổ chức
- [ ] Invoice bidding system (nhiều bank bid cho 1 invoice)
- [ ] Payment processing integration
- [ ] Analytics dashboard cho Bank
- [ ] Risk scoring cho invoices
- [ ] Secondary market (Bank bán lại invoice)
- [ ] Automatic matching algorithm
- [ ] Notification system cho invoice mới
