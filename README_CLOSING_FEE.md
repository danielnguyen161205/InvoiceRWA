# Tính Năng Phí Đóng Hóa Đơn (Invoice Closing Fee)

## Tổng Quan

Tính năng phí đóng hóa đơn cho phép SME đóng hóa đơn sau khi bank đã hoàn tất tài trợ (financing). Một khoản phí 0.1% giá trị hóa đơn cuối cùng sẽ được áp dụng.

## Luồng Hoạt Động

1. **Bank Financing Completed**: Sau khi bank chuyển tiền và SME xác nhận đã nhận, hóa đơn chuyển sang trạng thái `FINANCED`

2. **SME Close Invoice**: SME nhấn nút "Đóng hóa đơn" trên dashboard
   - Hệ thống tính phí đóng = 0.1% × giá trị hóa đơn
   - Hóa đơn được đánh dấu là đã đóng (`invoice_closed_by_sme = true`)
   - Phí chưa được thanh toán (`closing_fee_paid = false`)

3. **SME Pay Closing Fee**: SME thanh toán phí đóng
   - Nhấn nút "Trả phí" để đánh dấu phí đã được thanh toán
   - Nếu không thanh toán, phí sẽ được trích từ phần chưa chiết khấu mà bank trả

## Cài Đặt

### 1. Chạy Migration Database

```powershell
# Chạy script migration để thêm các trường mới
.\run_closing_fee_migration.ps1
```

Hoặc chạy trực tiếp SQL:

```sql
-- Backend/db/sql/add_closing_fee.sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS closing_fee FLOAT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS closing_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_closed_by_sme BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_closed_at TIMESTAMP;
```

### 2. Khởi Động Lại Backend

```powershell
cd Backend
uvicorn app.main:app --reload --port 8000
```

### 3. Refresh Frontend

Mở trình duyệt và reload trang SME Dashboard

## API Endpoints

### 1. Close Invoice with Fee

**Endpoint**: `POST /api/bank/invoices/{invoice_id}/close-invoice`

**Mô tả**: SME đóng hóa đơn và tính phí 0.1%

**Authorization**: Bearer Token (SME role required)

**Request**: Không cần body

**Response**:
```json
{
  "message": "Invoice closed successfully",
  "invoice_id": 123,
  "closing_fee": 1000000,
  "closing_fee_percentage": "0.1%",
  "invoice_amount": 1000000000,
  "closed_at": "2026-01-11T10:30:00",
  "note": "Closing fee must be paid. If not paid, it will be deducted from the undiscounted portion."
}
```

**Error Responses**:
- `403`: Only SME can close invoice
- `404`: Invoice not found or access denied
- `400`: Invoice must be FINANCED before closing
- `400`: Invoice already closed

### 2. Pay Closing Fee

**Endpoint**: `POST /api/bank/invoices/{invoice_id}/pay-closing-fee`

**Mô tả**: SME đánh dấu phí đóng hóa đơn đã được thanh toán

**Authorization**: Bearer Token (SME role required)

**Request**: Không cần body

**Response**:
```json
{
  "message": "Closing fee paid successfully",
  "invoice_id": 123,
  "closing_fee": 1000000,
  "paid": true
}
```

**Error Responses**:
- `403`: Only SME can pay closing fee
- `404`: Invoice not found or access denied
- `400`: Invoice must be closed first
- `400`: Closing fee already paid

## Database Schema

### Bảng `invoices` - Các Trường Mới

| Trường                    | Kiểu        | Mô Tả                                              |
|---------------------------|-------------|----------------------------------------------------|
| `closing_fee`             | FLOAT       | Số tiền phí đóng hóa đơn (0.1% giá trị hóa đơn)  |
| `closing_fee_paid`        | BOOLEAN     | Phí đã được thanh toán hay chưa                   |
| `invoice_closed_by_sme`   | BOOLEAN     | SME đã đóng hóa đơn hay chưa                      |
| `invoice_closed_at`       | TIMESTAMP   | Thời điểm SME đóng hóa đơn                        |

## Frontend - SME Dashboard

### Nút "Đóng Hóa Đơn"

Nút này hiển thị trong cột Action của bảng invoice khi:
- User có role SME
- Invoice có status = `FINANCED`
- `invoice_closed_by_sme` = false

### Hiển Thị Trạng Thái Phí

Sau khi đóng hóa đơn, sẽ hiển thị:
- ✓ **Phí đã trả** (màu xanh) - nếu `closing_fee_paid = true`
- ⚠ **Chưa trả phí** (màu cam) + nút "Trả phí" - nếu `closing_fee_paid = false`

## Tính Toán Phí

```
Phí đóng hóa đơn = Giá trị hóa đơn × 0.1%
                 = Giá trị hóa đơn × 0.001
```

### Ví Dụ:

| Giá Trị Hóa Đơn  | Phí Đóng (0.1%)  |
|------------------|------------------|
| 10,000,000 VND   | 10,000 VND       |
| 100,000,000 VND  | 100,000 VND      |
| 1,000,000,000 VND| 1,000,000 VND    |

## Testing

### Test Case 1: Close Invoice Successfully

1. Đăng nhập với tài khoản SME
2. Tìm hóa đơn có status = `FINANCED`
3. Nhấn nút "Đóng hóa đơn"
4. Xác nhận trong popup
5. **Kết quả mong đợi**: 
   - Alert hiển thị phí đóng
   - Hóa đơn được đánh dấu đã đóng
   - Hiển thị trạng thái "Chưa trả phí"

### Test Case 2: Pay Closing Fee

1. Đóng hóa đơn (như Test Case 1)
2. Nhấn nút "Trả phí"
3. Xác nhận trong popup
4. **Kết quả mong đợi**:
   - Alert xác nhận thanh toán
   - Trạng thái đổi thành "Phí đã trả"
   - Nút "Trả phí" biến mất

### Test Case 3: Error Handling

**Test khi invoice chưa FINANCED**:
1. Tìm invoice có status khác `FINANCED`
2. Gọi API close invoice
3. **Kết quả mong đợi**: Error 400 - "Invoice must be FINANCED"

**Test khi đã đóng rồi**:
1. Đóng hóa đơn lần 1
2. Thử đóng lại lần 2
3. **Kết quả mong đợi**: Error 400 - "Invoice already closed"

## Logic Xử Lý Phí

### Trường Hợp 1: SME Trả Phí
SME thanh toán phí đóng hóa đơn thông qua nút "Trả phí" trên dashboard.

### Trường Hợp 2: Trích Từ Phần Chưa Chiết Khấu
Nếu SME không trả phí, số tiền sẽ được trích từ phần chưa chiết khấu (reserve) mà bank giữ lại.

**Công thức**:
```
Phần chưa chiết khấu = Giá trị hóa đơn × (1 - LTV%)
Phần còn lại sau trích phí = Phần chưa chiết khấu - Phí đóng
```

## Troubleshooting

### Lỗi: "Invoice not found"
- Kiểm tra invoice_id có đúng không
- Kiểm tra user có quyền truy cập invoice không

### Lỗi: "Invoice must be FINANCED"
- Đảm bảo bank đã confirm financed
- Đảm bảo SME đã confirm receipt
- Kiểm tra status = `FINANCED`

### Nút "Đóng hóa đơn" không hiển thị
- Kiểm tra user đã đăng nhập với role SME
- Kiểm tra invoice status = `FINANCED`
- Clear browser cache và reload

## Changelog

### Version 1.0.0 - January 11, 2026
- ✨ Thêm tính năng phí đóng hóa đơn 0.1%
- ✨ Thêm nút "Đóng hóa đơn" cho SME dashboard
- ✨ Thêm nút "Trả phí" để thanh toán phí đóng
- ✨ Hiển thị trạng thái phí đã trả/chưa trả
- 📝 Thêm 2 API endpoints mới
- 🗄️ Migration database với 4 trường mới

## Liên Hệ & Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi về tính năng này, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.
