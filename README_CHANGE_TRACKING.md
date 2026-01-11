# 🎨 Tính năng Highlight Thay Đổi (Change Tracking)

## Tổng quan

Tính năng này cho phép highlight (tô màu) các trường thông tin đã bị thay đổi khi hóa đơn ở trạng thái **EDITING**. Cả SME và Buyer đều có thể thấy rõ những gì đã được sửa đổi so với phiên bản gốc.

## Cách hoạt động

### 1. Backend - Lưu snapshot dữ liệu gốc

Khi hóa đơn chuyển sang trạng thái **EDITING** (qua buyer request changes hoặc buyer edit), hệ thống tự động lưu snapshot của dữ liệu gốc vào trường `original_data_snapshot`:

```python
# Ví dụ snapshot JSON được lưu:
{
  "serial_no": "INV-2024-001",
  "amount": 1000000,
  "currency": "VND",
  "issue_date": "2024-01-15",
  "buyer_name": "ABC Corp",
  "recourse_type": "Full Recourse",
  "payment_term": 30,
  "proposed_ltv": 80.0,
  "discount_rate": 5.5,
  ...
}
```

**File liên quan:**
- `Backend/app/models/invoice.py` - Định nghĩa cột `original_data_snapshot`
- `Backend/app/api/invoices.py` - Logic lưu snapshot trong `request_changes()` và `buyer_edit_invoice()`

### 2. Frontend - Hiển thị highlighting

Khi invoice modal được mở và hóa đơn ở trạng thái **EDITING**, frontend sẽ:

1. Parse snapshot JSON từ `invoice.original_data_snapshot`
2. So sánh giá trị hiện tại với giá trị gốc
3. Tô màu vàng các trường đã thay đổi
4. Hiển thị thông tin "Giá trị cũ → Giá trị mới"

**File liên quan:**
- `Frontend/assets/js/dashboard.js`:
  - Function `highlightChanges(invoice)` - So sánh và áp dụng highlight
  - Function `clearHighlights()` - Xóa highlight khi đóng modal

### 3. Visual Design

**Trường đã thay đổi:**
- 🟡 Background màu vàng nhạt (`#fef3c7`)
- 🟠 Border bên trái màu cam (`#f59e0b`)
- 📝 Text hiển thị giá trị cũ và mới

**Banner cảnh báo:**
```
⚠️ Hóa đơn đang được chỉnh sửa
Các trường được tô màu vàng đã bị thay đổi so với bản gốc. 
Xem chi tiết bên dưới mỗi trường.
```

## Ví dụ hiển thị

### Before (Không có thay đổi):
```
┌────────────────────────────┐
│ Số hóa đơn: INV-2024-001  │
│ Số tiền: 1,000,000 VND    │
└────────────────────────────┘
```

### After (Có thay đổi - EDITING status):
```
⚠️ Hóa đơn đang được chỉnh sửa

┌────────────────────────────┐  <- Background trắng (không đổi)
│ Số hóa đơn: INV-2024-001  │
└────────────────────────────┘

┃────────────────────────────┐  <- Border cam + background vàng
┃ Số tiền: 1,500,000 VND    │
┃ ✏️ Đã thay đổi:            │
┃ 1,000,000 VND → 1,500,000 │
└────────────────────────────┘
```

## Database Migration

Đã thêm cột mới vào bảng `invoices`:

```sql
ALTER TABLE invoices 
ADD COLUMN original_data_snapshot TEXT NULL;
```

**Migration script:** `Backend/migrate_change_tracking.py`

## Testing

### Bước 1: Tạo hóa đơn mới
1. Login as SME
2. Tạo hóa đơn với các giá trị ban đầu
3. Submit invoice

### Bước 2: Buyer request changes
1. Login as Buyer
2. Mở invoice detail
3. Click "Request Changes" và thêm comment
4. **→ Backend lưu snapshot vào `original_data_snapshot`**
5. Invoice chuyển sang status **EDITING**

### Bước 3: SME chỉnh sửa
1. Login as SME
2. Mở invoice (đang ở status EDITING)
3. **→ Thấy highlight màu vàng trên các trường đã bị sửa**
4. Sửa thêm một số trường khác
5. Save changes

### Bước 4: Buyer xem lại
1. Login as Buyer
2. Mở invoice detail
3. **→ Thấy tất cả các thay đổi được highlight**
4. Có thể approve hoặc request thêm changes

## API Endpoints liên quan

### GET /api/invoices/
- Trả về danh sách invoices
- Field `original_data_snapshot` được include trong response khi status = "EDITING"

### POST /api/invoices/{invoice_id}/request-changes
- Buyer yêu cầu sửa đổi
- **Lưu snapshot nếu chưa có**
- Chuyển status → EDITING

### PUT /api/invoices/{invoice_id}/edit
- Buyer edit invoice trực tiếp
- **Lưu snapshot nếu chưa có**
- Chuyển status → EDITING

### PUT /api/invoices/{invoice_id}
- SME update invoice
- Không lưu snapshot (chỉ lưu khi buyer yêu cầu thay đổi)

## Các trường được track

Danh sách các trường được so sánh và highlight:

- ✅ `serial_no` - Số sê-ri hóa đơn
- ✅ `issue_date` - Ngày phát hành
- ✅ `lookup_code` - Mã tra cứu
- ✅ `amount` - Số tiền
- ✅ `currency` - Đơn vị tiền tệ
- ✅ `buyer_name` - Tên người mua
- ✅ `recourse_type` - Loại quyền truy đòi
- ✅ `payment_term` - Kỳ hạn thanh toán
- ✅ `proposed_ltv` - Tỷ lệ LTV đề xuất
- ✅ `discount_rate` - Lãi suất chiết khấu
- ✅ `funding_category` - Danh mục tài trợ
- ✅ `funding_purpose` - Mục đích tài trợ
- ✅ `dispute_method` - Phương thức giải quyết tranh chấp

## Technical Notes

### Frontend Logic
```javascript
function highlightChanges(invoice) {
  try {
    const originalData = JSON.parse(invoice.original_data_snapshot);
    
    // Compare each field
    fieldMappings.forEach(field => {
      const currentValue = String(field.current || '');
      const originalValue = String(field.original || '');
      
      if (currentValue !== originalValue) {
        // Apply highlight styling
        parent.style.backgroundColor = '#fef3c7';
        parent.style.borderLeft = '4px solid #f59e0b';
        
        // Add change indicator
        indicator.innerHTML = `Đã thay đổi: ${originalValue} → ${currentValue}`;
      }
    });
  } catch (error) {
    console.error('Error highlighting changes:', error);
  }
}
```

### Backend Logic
```python
# Save snapshot when entering EDITING status
if not invoice.original_data_snapshot:
    original_data = {
        "serial_no": invoice.serial_no,
        "amount": float(invoice.amount) if invoice.amount else None,
        "currency": invoice.currency,
        # ... other fields
    }
    invoice.original_data_snapshot = json.dumps(original_data)
    db.commit()
```

## Troubleshooting

### Không thấy highlighting
1. Kiểm tra status của invoice: `console.log(invoice.status)` → Phải là "EDITING"
2. Kiểm tra có snapshot: `console.log(invoice.original_data_snapshot)` → Phải có giá trị JSON
3. Check browser console cho errors

### Highlight không đúng
1. Clear cache và reload trang
2. Kiểm tra snapshot trong database:
   ```sql
   SELECT id, invoice_number, status, original_data_snapshot 
   FROM invoices 
   WHERE status = 'EDITING';
   ```

### Migration failed
1. Check database connection
2. Verify column doesn't already exist:
   ```sql
   DESCRIBE invoices;
   ```
3. Run migration manually:
   ```bash
   cd Backend
   python migrate_change_tracking.py
   ```

## Future Enhancements

Có thể mở rộng tính năng:

1. **History log**: Lưu tất cả các lần thay đổi, không chỉ snapshot ban đầu
2. **Diff viewer**: Modal popup hiển thị side-by-side comparison
3. **Change approval**: Buyer phải approve từng thay đổi cụ thể
4. **Notification**: Email/push notification khi có thay đổi
5. **Audit trail**: Track ai đã thay đổi gì và khi nào
6. **Revert**: Cho phép revert về giá trị gốc

## Version History

- **v1.0** (2025-01-11): Initial implementation
  - Backend: Added `original_data_snapshot` field
  - Frontend: Basic highlighting with yellow background
  - Database: Migration script created
