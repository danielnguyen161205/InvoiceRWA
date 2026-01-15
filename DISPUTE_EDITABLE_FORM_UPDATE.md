# Dispute Resolution - Editable Form Feature

## Overview
Cập nhật dispute resolution modal với khả năng chỉnh sửa thông tin hóa đơn và tạo linked invoice cho trường hợp reject.

## Ngày cập nhật
2026-01-12

---

## 🎯 Tính năng mới

### 1. **Editable Invoice Form trong Dispute Modal**

#### Frontend Changes
- **File**: `Frontend/assets/js/admin-dashboard.js`
- **Functions Updated**:
  - `loadDisputeDetails(invoice)` - Render form với input fields thay vì read-only display
  - `toggleDisputeEdit()` - Enable/disable edit mode
  - `saveDisputeInvoiceEdit()` - Lưu changes vào database
  - `cancelDisputeEdit()` - Hủy changes và reload original data

#### Editable Fields:
```javascript
- invoice_number (text input)
- serial_no (text input)
- amount (number input) ✨ Main field for increased amount
- issue_date (date input)
- lookup_code (text input)
- funding_purpose (textarea)
- seller_name (readonly - không cho edit)
- buyer_name (readonly - không cho edit)
```

#### UI Features:
- **Enable Edit Button**: Unlock form để chỉnh sửa
- **Save Changes Button**: Gọi API `PUT /api/invoices/{id}/admin-edit`
- **Cancel Button**: Reload form với original data
- **Real-time Amount Calculation**: Tự động tính additional financing khi amount thay đổi

---

### 2. **Create Linked Invoice Feature**

#### Function: `createLinkedInvoice()`
**Location**: `Frontend/assets/js/admin-dashboard.js`

**Workflow**:
1. Lưu `linked_invoice_id` và `linked_invoice_data` vào `localStorage`
2. Pre-fill data:
   ```javascript
   {
     invoice_number: original,
     serial_no: original,
     amount: previous_amount (NOT increased),
     seller_id: original,
     buyer_id: original,
     funding_purpose: original,
     issue_date: original
   }
   ```
3. Alert user để navigate tới invoice creation page
4. Close dispute modal

**HTML Button**:
```html
<button onclick="createLinkedInvoice()" class="bg-blue-600...">
    <i class="ri-file-add-line"></i>
    Create Linked Invoice (After Rejection)
</button>
```

---

### 3. **Backend API Integration**

#### Endpoint Used: `PUT /api/invoices/{invoice_id}/admin-edit`
**File**: `Backend/app/api/invoices.py` (line 390)

**Request Body**:
```json
{
  "invoice_number": "INV-2024-001",
  "serial_no": "SN-123",
  "amount": 50000000,
  "issue_date": "2024-01-10",
  "lookup_code": "LC-456",
  "funding_purpose": "Working capital",
  "edit_note": "Updated invoice during dispute resolution"
}
```

**Authorization**: Requires `ADMIN` role

**Response**:
```json
{
  "message": "Invoice updated by admin",
  "status": "DISPUTED"
}
```

---

## 📊 Workflow Complete

### Accept Increased Amount Flow:
```
1. Admin opens dispute modal
2. Click "Enable Edit" → Modify amount/fields
3. Click "Save Changes" → Update invoice via API
4. Review amount comparison (Previous vs New vs Additional)
5. Enter decision comments
6. Click "Accept Increased Amount"
   → Status: DISPUTED → FINANCING
   → Bank disburses additional amount
   → Normal workflow continues
```

### Reject Increased Amount Flow:
```
1. Admin opens dispute modal
2. Review dispute details
3. Enter decision comments
4. Click "Reject - Request Resubmission"
   → Status: DISPUTED → SUBMITTED
   → Invoice returned to SME/Buyer
5. Click "Create Linked Invoice"
   → Save linked data to localStorage
   → Navigate to invoice creation page
   → Pre-filled form with linked_invoice_id
6. SME/Buyer submit new invoice
   → linked_invoice_id points to disputed invoice
```

---

## 🎨 UI Components

### Amount Comparison Section (Dynamic)
```html
<div class="grid grid-cols-3 gap-4">
  <div>Previous Financed Amount: 40,000,000 VND</div>
  <div id="newAmountDisplay">New Disputed Amount: 50,000,000 VND</div>
  <div id="additionalAmountDisplay">Additional Financing: 10,000,000 VND</div>
</div>
```

**Real-time Update**: Khi user change amount input, display tự động update.

### Edit Mode Toggle
- **Disabled State**: Background `bg-gray-50`, inputs disabled
- **Enabled State**: Background `bg-white border-orange-300`, inputs editable
- **Warning Banner**: Shows when edit mode active

---

## 🔐 Security & Validation

### Frontend Validation:
- Amount must be > 0
- Required fields: invoice_number, amount
- Confirmation dialog before saving
- Confirmation dialog before resolving dispute

### Backend Validation:
- `ADMIN` role required for admin-edit endpoint
- Invoice must exist (404 if not found)
- All fields validated by Pydantic `InvoiceUpdate` model

---

## 📝 Database Fields Used

### Invoice Model Fields:
```python
dispute_resolution_action: VARCHAR(50)    # 'ACCEPT_INCREASED' or 'REJECT_INCREASED'
previous_amount: FLOAT                    # Original financed amount
increased_amount: FLOAT                   # New disputed amount
additional_financing_amount: FLOAT        # Difference (increased - previous)
linked_invoice_id: INT                    # Foreign key to original invoice (for new submissions)
```

---

## 🧪 Testing Checklist

### Manual Test Steps:
1. ✅ Create invoice with status FINANCED
2. ✅ Submit dispute with INCREASED_AMOUNT type
3. ✅ Admin opens dispute modal
4. ✅ Click "Enable Edit" button
5. ✅ Modify amount field (e.g., increase by 10,000,000)
6. ✅ Click "Save Changes" - Verify API call success
7. ✅ Check amount comparison updates dynamically
8. ✅ Accept increased amount - Verify status → FINANCING
9. ✅ Reject increased amount - Verify status → SUBMITTED
10. ✅ Click "Create Linked Invoice" - Verify localStorage saved
11. ✅ Navigate to creation page - Verify pre-filled data
12. ✅ Submit new invoice - Verify linked_invoice_id set

---

## 🐛 Known Issues & Future Improvements

### Future Enhancements:
1. **Auto-navigate to creation page** after clicking "Create Linked Invoice"
2. **Add "View Original Invoice" link** in new invoice form when linked_invoice_id exists
3. **Show history of linked invoices** in dispute modal
4. **Add validation** to prevent creating multiple linked invoices
5. **Email notification** to SME/Buyer when dispute rejected

### Notes:
- Currently, invoice creation page needs manual implementation to read `localStorage` data
- Bank must manually disburse additional amount (no automatic blockchain transaction yet)
- Audit log records all changes but not displayed in UI

---

## 📚 Related Files

### Frontend:
- `Frontend/assets/pages/admin-dashboard.html` (lines 304-331)
- `Frontend/assets/js/admin-dashboard.js` (lines 1269-1650)

### Backend:
- `Backend/app/api/invoices.py` (line 390: admin-edit endpoint)
- `Backend/app/models/invoice.py` (dispute fields)
- `Backend/alembic/versions/20260111_add_dispute_increased_fields.py`

### Documentation:
- `DISPUTE_RESOLUTION_WORKFLOW.md`
- `README_BANK_FINANCING.md`

---

## 🎉 Summary

Dispute modal giờ đã có:
1. ✅ **Editable form** với toggle enable/disable
2. ✅ **Real-time amount calculation** hiển thị additional financing
3. ✅ **Save Changes** gọi admin-edit API
4. ✅ **Create Linked Invoice** button lưu data vào localStorage
5. ✅ **Accept/Reject** decisions với confirmation dialogs
6. ✅ **Dynamic UI updates** khi edit invoice

Bank admin giờ có full control để review và modify invoice information trước khi quyết định accept hay reject increased amount! 🚀
