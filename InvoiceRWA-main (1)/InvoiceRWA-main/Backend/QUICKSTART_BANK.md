# Quick Start Guide - Bank Role Setup

## Bước 1: Chạy Migration
```bash
cd Backend
python add_bank_fields_migration.py
```

## Bước 2: Khởi động Backend Server
```bash
cd Backend
python -m uvicorn app.main:app --reload
```

## Bước 3: Khởi động Frontend
```bash
cd Frontend
# Nếu dùng VS Code Live Server
# Right-click vào index.html → Open with Live Server

# Hoặc dùng Python simple HTTP server
python -m http.server 8080
```

## Bước 4: Test Backend API
```bash
cd Backend
python test_bank_role.py
```

## Bước 5: Test Frontend Flow

### A. Đăng ký Bank User
1. Mở browser: http://localhost:8080/assets/pages/register.html
2. Điền form:
   - Full name: Test Bank
   - Email: mybank@example.com
   - Password: BankPass123!
   - Role: **Bank (Financial Institution)**
3. Click Register

### B. Login và Complete KYB
1. Login với email/password vừa tạo
2. Hệ thống sẽ hiện KYB modal
3. Điền thông tin organization:
   - Organization Name: ABC Bank
   - Tax ID: 0123456789
   - Registration Number: BANK-001
   - Legal Type: Corporation
   - Country: Vietnam
4. Submit và chờ admin approve

### C. Admin Approve KYB (Temporary Workaround)
Cách 1 - Update database trực tiếp:
```sql
-- Tìm organization vừa tạo
SELECT * FROM organizations WHERE legal_name = 'ABC Bank';

-- Update status
UPDATE organizations 
SET status = 'APPROVED' 
WHERE legal_name = 'ABC Bank';

-- Update user KYC verified
UPDATE users 
SET kyc_verified = TRUE 
WHERE email = 'mybank@example.com';
```

Cách 2 - Dùng Admin Dashboard (nếu có):
1. Login as Admin
2. Navigate to KYC/KYB approval page
3. Approve Bank organization

### D. Login lại và Access Bank Dashboard
1. Logout
2. Login lại với bank account
3. Tự động redirect đến `/assets/pages/bank-dashboard.html`
4. Tab "Available Invoices" hiển thị approved invoices

### E. Purchase Invoice
1. Browse available invoices
2. Click "Purchase" button
3. Nhập purchase price (suggested price based on discount)
4. Confirm
5. Invoice xuất hiện trong "My Portfolio" tab

## Bước 6: Create Test Data

### Tạo SME Invoice và Approve
```bash
cd Backend
python create_sme_invoice.py  # Tạo invoice
# Sau đó update status = 'APPROVED' trong database
```

Hoặc dùng SQL:
```sql
-- Update existing invoice to APPROVED
UPDATE invoices 
SET status = 'APPROVED' 
WHERE id = 1;
```

## Common Issues

### Issue 1: KYB Modal không hiển thị
**Solution:** Check `auth.js` có function `showKybModal()` và modal element tồn tại trong HTML

### Issue 2: Cannot access /invoices/bank/approved - 403 Forbidden
**Solution:** 
- Check JWT token có role=BANK
- Check KYC verified = True
```javascript
// Trong browser console
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload.roles);  // Should include "BANK"
console.log(payload.kyc_verified);  // Should be true
```

### Issue 3: Không có invoice available
**Solution:** Tạo invoice và set status = APPROVED
```sql
INSERT INTO invoices (invoice_number, amount, currency, status, sme_id, buyer_name)
VALUES ('INV-TEST-001', 100000000, 'VND', 'APPROVED', 1, 'Test Buyer');
```

### Issue 4: Migration failed - column already exists
**Solution:** Migration đã chạy rồi, bỏ qua bước này

## Verification Checklist

- [ ] Backend server running (http://localhost:8000)
- [ ] Frontend server running (http://localhost:8080)
- [ ] Migration completed successfully
- [ ] Bank user created and verified
- [ ] At least 1 APPROVED invoice exists
- [ ] Bank can view approved invoices
- [ ] Bank can purchase invoice
- [ ] Purchased invoice shows in portfolio

## API Endpoints Reference

```
POST   /api/auth/register          - Register bank user
POST   /api/auth/login              - Login bank user
GET    /invoices/bank/approved      - List approved invoices
GET    /invoices/bank/purchased     - List purchased invoices
POST   /invoices/{id}/purchase      - Purchase an invoice
```

## Next Steps

1. Implement full KYB form với business-specific fields
2. Add invoice filtering và search
3. Implement bidding system
4. Add payment processing
5. Create analytics dashboard
6. Add notifications cho new invoices

---
**Need Help?** Check README_BANK_ROLE.md for detailed documentation
