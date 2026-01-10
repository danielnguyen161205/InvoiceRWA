# Tổng Hợp Thay Đổi - Bank Financing Logic

## Tóm tắt

Đã implement logic mới cho phép SME gửi yêu cầu tài trợ (financing request) đến các banks sau khi invoice được Admin approve. Banks có thể xem tất cả invoices nhưng với quyền hạn khác nhau tùy thuộc vào việc họ có nhận được request hay không.

## Các File Đã Tạo Mới

### 1. Models
- **`app/models/bank_request.py`**: Model để track các financing requests từ SME đến Banks
  - Statuses: PENDING, REJECTED, FINANCING, FINANCED, CANCELLED
  - Lưu thông tin finance_amount, interest_rate, timestamps

### 2. Schemas
- **`app/schemas/bank_request.py`**: Pydantic schemas cho BankRequest
  - `BankRequestCreate`: Tạo request mới
  - `BankRequestOut`: Response data
  - `BankResponseRequest`: Bank response data

### 3. API Router
- **`app/api/bank.py`**: Tất cả endpoints liên quan đến bank financing
  - SME endpoints: send requests, view my requests, confirm receipt
  - Bank endpoints: view invoices, finance, reject, mark financed

### 4. Migrations
- **`alembic/versions/20260110_add_bank_requests.py`**: Database migration
  - Tạo bảng `bank_requests`
  - Thêm fields vào `invoices`: `bank_confirmed_financed`, `sme_confirmed_receipt`, etc.
- **`alembic.ini`**: Alembic configuration file
- **`alembic/script.py.mako`**: Template cho migrations

### 5. Documentation
- **`README_BANK_FINANCING.md`**: Giải thích chi tiết về flow
- **`README_BANK_API_TESTING.md`**: Hướng dẫn test APIs với examples
- **`test_bank_financing.ps1`**: Script test nhanh

## Các File Đã Chỉnh Sửa

### 1. `app/models/invoice.py`
- Thêm status mới: `FINANCING`, `FINANCED`
- Thêm fields: 
  - `bank_confirmed_financed` (Boolean)
  - `sme_confirmed_receipt` (Boolean)
  - `bank_financed_at` (DateTime)
  - `sme_confirmed_at` (DateTime)

### 2. `app/main.py`
- Import và register `bank` router
- Thêm dòng: `app.include_router(bank.router, prefix="/api")`

### 3. `alembic/env.py`
- Import tất cả models để Alembic có thể detect
- Thêm import `BankRequest`

## API Endpoints Mới

### SME Endpoints
```
POST   /api/bank/requests                          - Gửi request đến banks
GET    /api/bank/my-requests                       - Xem tất cả requests đã gửi
POST   /api/bank/invoices/{id}/confirm-receipt     - Xác nhận đã nhận tiền
```

### Bank Endpoints
```
GET    /api/bank/invoices                          - Xem invoices (có phân quyền)
POST   /api/bank/requests/{id}/finance             - Chấp nhận và financing
POST   /api/bank/requests/{id}/financed            - Đánh dấu đã chuyển tiền
POST   /api/bank/requests/{id}/reject              - Từ chối request
```

## Luồng Hoạt Động

### 1. Admin Approve Invoice
- Invoice status: `APPROVED`
- Hiển thị trên dashboard của TẤT CẢ banks

### 2. SME Gửi Request
- SME chọn invoice và gửi request đến 1 hoặc nhiều banks
- Tạo BankRequest với status `PENDING`

### 3. Bank Xem Invoices
- **Có request**: Xem FULL thông tin + có nút Reject/Finance
- **Không có request**: Chỉ xem thông tin CƠ BẢN (invoice_number, amount, buyer_name, status)

### 4. Bank Quyết Định

#### Option A: Finance
- Bank clicks "Finance"
- Request status: `PENDING` → `FINANCING`
- Invoice status: `APPROVED` → `FINANCING`
- Invoice.bank_id được set

#### Option B: Reject
- Bank clicks "Reject"
- Request status: `PENDING` → `REJECTED`
- Invoice status: VẪN LÀ `APPROVED`
- SME có thể gửi request cho bank khác

### 5. Xác Nhận Hoàn Tất (2-way confirmation)

#### Bank Confirmation:
- Bank clicks "Financed" (đã chuyển tiền)
- Set `invoice.bank_confirmed_financed = True`

#### SME Confirmation:
- SME clicks "Confirm Receipt" (đã nhận tiền)
- Set `invoice.sme_confirmed_receipt = True`

#### Final Status:
- Khi CẢ 2 đều confirm → Invoice status: `FINANCING` → `FINANCED`
- Request status: `FINANCING` → `FINANCED`

## Database Schema Changes

### Bảng Mới: `bank_requests`
```sql
CREATE TABLE bank_requests (
    id INTEGER PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    bank_id INTEGER NOT NULL,
    sme_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    requested_at DATETIME,
    bank_responded_at DATETIME,
    rejection_reason TEXT,
    financing_started_at DATETIME,
    bank_financed_at DATETIME,
    sme_confirmed_receipt_at DATETIME,
    financed_at DATETIME,
    finance_amount INTEGER,
    interest_rate INTEGER,
    notes TEXT,
    FOREIGN KEY(invoice_id) REFERENCES invoices(id),
    FOREIGN KEY(bank_id) REFERENCES users(id),
    FOREIGN KEY(sme_id) REFERENCES users(id)
);
```

### Bảng `invoices` - Fields Mới:
```sql
ALTER TABLE invoices ADD COLUMN bank_confirmed_financed BOOLEAN DEFAULT 0;
ALTER TABLE invoices ADD COLUMN sme_confirmed_receipt BOOLEAN DEFAULT 0;
ALTER TABLE invoices ADD COLUMN bank_financed_at DATETIME;
ALTER TABLE invoices ADD COLUMN sme_confirmed_at DATETIME;
```

## Cách Chạy Migration

```bash
cd Backend
python -m alembic upgrade head
```

Hoặc nếu database đã có schema:
```bash
python -m alembic stamp head
```

## Testing

Xem chi tiết trong:
- `README_BANK_API_TESTING.md` - Postman/curl examples
- `test_bank_financing.ps1` - PowerShell test script

### Quick Test Flow:
1. Tạo invoice (SME)
2. Buyer accept → Admin approve
3. SME gửi request đến Bank A, B, C
4. Bank A login → xem full info
5. Bank D login → xem basic info only
6. Bank B reject → invoice vẫn APPROVED
7. Bank A finance → status = FINANCING
8. Bank A financed → bank confirmed
9. SME confirm receipt → status = FINANCED ✓

## Notes

### TODO (Future enhancements):
- [ ] Implement notification system khi bank reject
- [ ] Add email notification cho SME
- [ ] Add dashboard cho bank để xem tất cả requests
- [ ] Add filters cho bank invoices (by status, amount, etc.)
- [ ] Add ability cho SME cancel request
- [ ] Add expiry time cho pending requests

### Security:
- Tất cả endpoints đều require authentication
- Role-based access control (SME, BANK)
- Bank chỉ có thể tương tác với requests được gửi đến họ
- SME chỉ có thể tương tác với invoices của mình

## Status Definitions

| Status | Description | Allowed Actions |
|--------|-------------|----------------|
| APPROVED | Admin approved, ready for financing | SME: send requests |
| FINANCING | Bank đang financing | Bank: mark financed; SME: confirm receipt |
| FINANCED | Both confirmed, complete | Move to SETTLED (buyer pays) |
| REJECTED | Bank rejected | N/A (stays APPROVED for invoice) |

## Invoice Status Flow

```
DRAFT → EDITING → SUBMITTED → APPROVED
                                  ↓
                        (SME sends requests)
                                  ↓
                    (Bank finances) → FINANCING
                                         ↓
            (Both bank & SME confirm) → FINANCED
                                         ↓
                                     SETTLED
                                         ↓
                                      CLOSED
```
