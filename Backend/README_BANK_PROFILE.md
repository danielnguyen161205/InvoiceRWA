# Bank Profile Fields - Thông tin Profile Ngân hàng

## Tổng quan

Đã thêm 3 trường thông tin vào profile của user có role BANK để SME có thể xem thông tin này khi gửi request tài trợ đến ngân hàng.

## Các trường mới được thêm

### 1. **Thời hạn giải ngân trung bình** (`average_disbursement_days`)
- **Kiểu dữ liệu**: Integer (số ngày)
- **Mô tả**: Số ngày trung bình để ngân hàng giải ngân sau khi duyệt hồ sơ
- **Ví dụ**: `7` (7 ngày), `15` (15 ngày)

### 2. **Lãi suất chiết khấu** (`discount_interest_rate`)
- **Kiểu dữ liệu**: String (50 ký tự)
- **Mô tả**: Lãi suất chiết khấu hóa đơn của ngân hàng
- **Ví dụ**: `"8.5%"`, `"10%"`, `"7.5% - 9.5%"`

### 3. **Phần trăm tài trợ trung bình** (`average_financing_percentage`)
- **Kiểu dữ liệu**: String (50 ký tự)
- **Mô tả**: Phần trăm giá trị hóa đơn mà ngân hàng sẵn sàng tài trợ
- **Ví dụ**: `"80%"`, `"70%"`, `"70% - 85%"`

## Thay đổi trong codebase

### 1. Database Model
**File**: `Backend/app/models/organization.py`

Đã thêm 3 cột mới vào bảng `organizations`:
```python
# Bank-specific Profile Information (for BANK org_type)
average_disbursement_days = Column(Integer, nullable=True)
discount_interest_rate = Column(String(50), nullable=True)
average_financing_percentage = Column(String(50), nullable=True)
```

### 2. Pydantic Schemas
**File**: `Backend/app/schemas/kyc.py`

Đã cập nhật các schema:
- `OrganizationCreate`: Cho phép nhập dữ liệu khi tạo/cập nhật organization
- `OrganizationOut`: Trả về dữ liệu bank profile trong response

### 3. Database Migration
**File**: `Backend/alembic/versions/98632e72f3d1_add_bank_profile_fields.py`

Migration đã được tạo và chạy thành công để thêm các cột vào database.

**Chạy migration**:
```bash
cd Backend
alembic upgrade head
```

### 4. API Endpoints

#### a. Create/Update Organization
**Endpoint**: `POST /api/kyc/organizations`

Bank users có thể thêm thông tin profile khi tạo/cập nhật organization:
```json
{
  "legal_name": "Ngân hàng ABC",
  "org_type": "BANK",
  "average_disbursement_days": 7,
  "discount_interest_rate": "8.5%",
  "average_financing_percentage": "80%",
  ...
}
```

#### b. Get Banks List (for SME)
**Endpoint**: `GET /api/users/banks`
**File**: `Backend/app/api/auth.py`

SME có thể xem danh sách banks kèm thông tin profile:
```json
[
  {
    "id": 1,
    "email": "bank@example.com",
    "organization_name": "Ngân hàng ABC",
    "average_disbursement_days": 7,
    "discount_interest_rate": "8.5%",
    "average_financing_percentage": "80%"
  },
  ...
]
```

## Cách sử dụng

### Cho Bank Users:
1. Đăng nhập với tài khoản có role BANK
2. Vào trang Profile → KYC/KYB Verification
3. Điền thông tin organization cùng với 3 trường mới:
   - Thời hạn giải ngân trung bình (số ngày)
   - Lãi suất chiết khấu (%, ví dụ: "8.5%")
   - Phần trăm tài trợ trung bình (%, ví dụ: "80%")
4. Submit form

### Cho SME Users:
1. Khi gửi request tài trợ, SME sẽ chọn bank từ danh sách
2. API sẽ trả về thông tin bank profile để SME xem và so sánh:
   - Thời gian giải ngân
   - Lãi suất
   - Tỷ lệ tài trợ
3. SME có thể chọn bank phù hợp nhất dựa trên các thông tin này

## Testing

### 1. Tạo Bank với Profile Information
```python
# Test trong Python hoặc API client
payload = {
    "legal_name": "Ngân hàng XYZ",
    "org_type": "BANK",
    "tax_id": "0123456789",
    "address": "123 Test Street",
    "average_disbursement_days": 10,
    "discount_interest_rate": "9%",
    "average_financing_percentage": "75%"
}

# POST /api/kyc/organizations
```

### 2. Kiểm tra danh sách Banks (từ SME account)
```bash
# GET /api/users/banks
curl -H "Authorization: Bearer <token>" http://127.0.0.1:8000/api/users/banks
```

## Notes

- Các trường này chỉ áp dụng cho organizations có `org_type = "BANK"`
- Tất cả 3 trường đều là optional (nullable=True)
- Bank users có thể cập nhật thông tin này bất kỳ lúc nào thông qua endpoint `/api/kyc/organizations`
- SME users sẽ thấy thông tin này khi gọi endpoint `/api/users/banks`

## Frontend Integration (TODO)

Cần cập nhật Frontend để:
1. Thêm form input cho 3 trường mới trong trang Profile (cho Bank users)
2. Hiển thị thông tin bank profile khi SME chọn bank để gửi request
3. Có thể thêm UI để so sánh các banks dựa trên các tiêu chí này
