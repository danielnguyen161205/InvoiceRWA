# Bank Financing Flow

## Tổng quan

Sau khi Admin approve hóa đơn, hóa đơn sẽ hiển thị trên dashboard của tất cả các banks với 2 mức độ quyền truy cập khác nhau:

1. **Banks KHÔNG được SME gửi request**: Chỉ xem được thông tin cơ bản
2. **Banks ĐÃ được SME gửi request**: Xem được toàn bộ thông tin và có thể tương tác

## Luồng hoạt động

### 1. SME gửi request tới Banks
- **Endpoint**: `POST /api/bank/requests`
- **Body**: 
```json
{
  "invoice_id": 123,
  "bank_ids": [1, 2, 3]
}
```
- Hóa đơn phải ở trạng thái `APPROVED`
- SME có thể gửi request tới nhiều banks cùng lúc
- Mỗi request được lưu với status `PENDING`

### 2. Bank xem danh sách hóa đơn
- **Endpoint**: `GET /api/bank/invoices`
- Trả về tất cả hóa đơn `APPROVED`, `FINANCING`, `FINANCED`
- Với mỗi hóa đơn:
  - **has_request = false**: Chỉ có thông tin cơ bản (invoice_number, amount, buyer_name, status)
  - **has_request = true**: Đầy đủ thông tin + request_id, request_status

### 3. Bank quyết định

#### Option A: Bank Finance (Chấp nhận)
- **Endpoint**: `POST /api/bank/requests/{request_id}/finance`
- **Body**:
```json
{
  "finance_amount": 950000000,
  "interest_rate": 12.5,
  "notes": "Approved with 12.5% interest rate"
}
```
- Request status: `PENDING` → `FINANCING`
- Invoice status: `APPROVED` → `FINANCING`
- Invoice.bank_id được set = bank hiện tại

#### Option B: Bank Reject (Từ chối)
- **Endpoint**: `POST /api/bank/requests/{request_id}/reject`
- **Body**: 
```json
{
  "rejection_reason": "High risk profile"
}
```
- Request status: `PENDING` → `REJECTED`
- Invoice status: VẪN LÀ `APPROVED` (SME có thể gửi cho bank khác)
- TODO: Gửi notification cho SME

### 4. Bank đã chuyển tiền
- **Endpoint**: `POST /api/bank/requests/{request_id}/financed`
- Bank đánh dấu đã chuyển tiền cho SME
- Set `invoice.bank_confirmed_financed = True`
- Set `invoice.bank_financed_at = timestamp`
- **Nếu SME chưa confirm**: Request và Invoice vẫn ở status `FINANCING`
- **Nếu SME đã confirm**: Cả 2 chuyển sang status `FINANCED`

### 5. SME xác nhận đã nhận tiền
- **Endpoint**: `POST /api/bank/invoices/{invoice_id}/confirm-receipt`
- SME xác nhận đã nhận được tiền
- Set `invoice.sme_confirmed_receipt = True`
- Set `invoice.sme_confirmed_at = timestamp`
- **Nếu Bank chưa confirm**: Request và Invoice vẫn ở status `FINANCING`
- **Nếu Bank đã confirm**: Cả 2 chuyển sang status `FINANCED`

### 6. Hoàn tất
- Khi CẢ Bank VÀ SME đều đã confirm:
  - Invoice status: `FINANCING` → `FINANCED`
  - Request status: `FINANCING` → `FINANCED`
  - `request.financed_at` được set

## Trạng thái Invoice

```
DRAFT → EDITING → SUBMITTED → APPROVED
                                  ↓
                            (SME gửi request)
                                  ↓
                    (Bank Finance) → FINANCING
                                        ↓
                    (Both confirm) → FINANCED
                                        ↓
                                    SETTLED
                                        ↓
                                    CLOSED

Nhánh phụ:
APPROVED → (Bank Reject) → vẫn APPROVED (SME gửi bank khác)
```

## API Endpoints Summary

### SME Endpoints
- `POST /api/bank/requests` - Gửi request tới banks
- `GET /api/bank/my-requests` - Xem tất cả requests đã gửi
- `POST /api/bank/invoices/{invoice_id}/confirm-receipt` - Xác nhận nhận tiền

### Bank Endpoints
- `GET /api/bank/invoices` - Xem danh sách hóa đơn (có phân quyền)
- `POST /api/bank/requests/{request_id}/finance` - Chấp nhận và bắt đầu financing
- `POST /api/bank/requests/{request_id}/financed` - Đánh dấu đã chuyển tiền
- `POST /api/bank/requests/{request_id}/reject` - Từ chối request

## Database Tables

### bank_requests
```sql
- id (PK)
- invoice_id (FK)
- bank_id (FK)
- sme_id (FK)
- status (PENDING/REJECTED/FINANCING/FINANCED)
- requested_at
- bank_responded_at
- rejection_reason
- financing_started_at
- bank_financed_at
- sme_confirmed_receipt_at
- financed_at
- finance_amount
- interest_rate
- notes
```

### invoices (new fields)
```sql
- bank_confirmed_financed (Boolean)
- sme_confirmed_receipt (Boolean)
- bank_financed_at (DateTime)
- sme_confirmed_at (DateTime)
```

## Migration

Chạy migration để tạo bảng và thêm fields:

```bash
cd Backend
python -m alembic upgrade head
```

## Testing Flow

1. Admin approve invoice → status = APPROVED
2. SME gửi request: `POST /api/bank/requests` với bank_ids = [1, 2]
3. Bank 1 login, xem: `GET /api/bank/invoices` (thấy full info)
4. Bank 2 login, xem: `GET /api/bank/invoices` (thấy full info)
5. Bank 3 (không được gửi request) login, xem: chỉ thấy basic info
6. Bank 1 reject: `POST /api/bank/requests/{id}/reject`
7. Bank 2 finance: `POST /api/bank/requests/{id}/finance` → status = FINANCING
8. Bank 2 financed: `POST /api/bank/requests/{id}/financed`
9. SME confirm: `POST /api/bank/invoices/{id}/confirm-receipt` → status = FINANCED ✓
