# Hướng Dẫn Đóng Góp

Cảm ơn bạn đã quan tâm đến việc đóng góp vào dự án InvoiceRWA! 🎉

## 📋 Quy Trình Pull Request

### 1. Fork và Clone (Nếu là External Contributor)

Nếu bạn là thành viên trong team, bỏ qua bước này.

```powershell
# Fork repository trên GitHub, sau đó clone
git clone https://github.com/YOUR_USERNAME/InvoiceRWA.git
cd InvoiceRWA

# Thêm upstream remote
git remote add upstream https://github.com/danielnguyen161205/InvoiceRWA.git
```

### 2. Tạo Branch Mới

**QUAN TRỌNG**: Không bao giờ làm việc trực tiếp trên branch `main`!

```powershell
# Cập nhật main branch
git checkout main
git pull origin main

# Tạo branch mới
git checkout -b feature/ten-tinh-nang
```

#### Quy Tắc Đặt Tên Branch:

```
feature/<tên-tính-năng>     # Thêm tính năng mới
fix/<tên-lỗi>                # Sửa bug
hotfix/<tên-lỗi-khẩn-cấp>   # Sửa lỗi nghiêm trọng
docs/<tên-tài-liệu>          # Cập nhật tài liệu
refactor/<tên-phần-code>     # Tái cấu trúc code
test/<tên-test>              # Thêm tests
```

**Ví dụ:**
- `feature/kyc-verification`
- `fix/login-error`
- `hotfix/database-connection`
- `docs/api-documentation`

### 3. Làm Việc và Commit

```powershell
# Thực hiện thay đổi code của bạn

# Kiểm tra file đã thay đổi
git status

# Thêm file
git add .

# Commit với message rõ ràng
git commit -m "feat: Thêm chức năng scan CCCD tự động"
```

#### Quy Tắc Commit Message:

Format: `<type>: <subject>`

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Thay đổi tài liệu
- `style`: Format code (không ảnh hưởng logic)
- `refactor`: Tái cấu trúc code
- `test`: Thêm hoặc sửa tests
- `chore`: Cập nhật dependencies, config

**Ví dụ:**
```
feat: Thêm API endpoint cho UBO verification
fix: Sửa lỗi validation trong form KYC
docs: Cập nhật hướng dẫn cài đặt
refactor: Tối ưu hàm getUserStatus
test: Thêm unit test cho invoice service
```

### 4. Push Branch Lên GitHub

```powershell
git push origin feature/ten-tinh-nang
```

### 5. Tạo Pull Request

1. Vào GitHub repository
2. Click nút **"Compare & pull request"** (xuất hiện sau khi push)
3. Hoặc vào tab **Pull requests** → **New pull request**
4. Chọn:
   - Base: `main`
   - Compare: `feature/ten-tinh-nang`
5. Điền thông tin:

```markdown
## Mô Tả

Mô tả ngắn gọn về những thay đổi trong PR này.

## Loại Thay Đổi

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix hoặc feature làm thay đổi existing functionality)
- [ ] Documentation update

## Checklist

- [ ] Code đã được test kỹ
- [ ] Code tuân thủ coding standards
- [ ] Đã cập nhật documentation (nếu cần)
- [ ] Không có warning/error mới
- [ ] Đã test trên nhiều browsers (nếu là frontend)

## Screenshots (nếu có thay đổi UI)

Thêm ảnh chụp màn hình nếu có

## Liên Quan

Fixes #<issue-number> (nếu có)
```

6. Click **Create pull request**

### 6. Code Review Process

#### Vai Trò Reviewer (Owner/Admin):

1. **Review Code:**
   - Kiểm tra logic
   - Kiểm tra code quality
   - Kiểm tra security issues
   - Kiểm tra performance

2. **Comment và Request Changes:**
   - Click vào dòng code cần comment
   - Viết feedback rõ ràng
   - Click **Start a review** → **Request changes** (nếu cần sửa)

3. **Approve:**
   - Nếu code OK, click **Approve**
   - Click **Merge pull request**
   - Chọn merge method (thường dùng **Squash and merge**)

#### Vai Trò Contributor:

1. **Phản Hồi Comments:**
   - Đọc kỹ feedback
   - Trả lời các câu hỏi
   - Giải thích nếu cần

2. **Sửa Code:**
```powershell
# Thực hiện thay đổi theo yêu cầu
git add .
git commit -m "fix: Áp dụng feedback từ review"
git push origin feature/ten-tinh-nang
```

3. **Re-request Review:**
   - Sau khi push, PR tự động cập nhật
   - Click **Re-request review** từ reviewer

### 7. Sau Khi Merge

```powershell
# Cập nhật local main branch
git checkout main
git pull origin main

# Xóa branch cũ (local)
git branch -d feature/ten-tinh-nang

# Xóa branch cũ (remote) - tự động xóa nếu đã cấu hình
# git push origin --delete feature/ten-tinh-nang
```

## ✅ Code Quality Standards

### Python (Backend)

```python
# Sử dụng type hints
def get_user(user_id: int) -> User:
    pass

# Docstrings cho functions
def calculate_invoice_total(items: List[Item]) -> Decimal:
    """
    Calculate total amount for invoice items.
    
    Args:
        items: List of invoice items
        
    Returns:
        Total amount as Decimal
    """
    pass

# PEP 8 compliance
# Sử dụng black, flake8 để format
```

### JavaScript (Frontend)

```javascript
// Sử dụng const/let thay vì var
const API_URL = 'http://127.0.0.1:8000';

// Arrow functions
const getUserStatus = (payload) => {
    // ...
};

// Comments cho logic phức tạp
// Calculate days difference for verification expiry
const daysDiff = Math.floor((currentDate - verifiedDate) / (1000 * 60 * 60 * 24));
```

### HTML

```html
<!-- Semantic HTML -->
<section class="kyc-form">
    <h2>KYC Verification</h2>
    <!-- ... -->
</section>

<!-- Accessibility -->
<label for="fullName">Họ và tên</label>
<input id="fullName" type="text" aria-required="true">
```

## 🚫 Những Điều Nên Tránh

❌ Commit trực tiếp lên `main`  
❌ Force push (`git push -f`)  
❌ Commit file config có thông tin nhạy cảm (`.env`, passwords)  
❌ Commit file build (`node_modules/`, `__pycache__/`)  
❌ Commit message không rõ ràng ("fix", "update", "test")  
❌ Pull Request quá lớn (>500 lines changed)  
❌ Code không được test  

## ✅ Best Practices

✔️ Commit nhỏ, thường xuyên  
✔️ Pull Request tập trung vào 1 feature/fix  
✔️ Test kỹ trước khi tạo PR  
✔️ Viết commit message rõ ràng  
✔️ Cập nhật documentation khi cần  
✔️ Respond nhanh với review comments  
✔️ Sync với main branch thường xuyên  

## 🐛 Báo Cáo Bug

Khi tạo issue báo bug, vui lòng bao gồm:

```markdown
## Mô Tả Bug
Mô tả ngắn gọn về bug

## Các Bước Tái Hiện
1. Vào trang '...'
2. Click vào '...'
3. Scroll xuống '...'
4. Thấy lỗi

## Expected Behavior
Mô tả hành vi mong đợi

## Actual Behavior
Mô tả hành vi thực tế

## Screenshots
Thêm ảnh chụp màn hình

## Environment
- OS: Windows 11
- Browser: Chrome 120
- Python: 3.11
- Node: 18.x
```

## 💡 Đề Xuất Tính Năng

Khi đề xuất feature mới:

```markdown
## Tính Năng Đề Xuất
Mô tả tính năng

## Lý Do
Tại sao cần tính năng này?

## Cách Triển Khai Đề Xuất
Ý tưởng về cách implement (nếu có)

## Alternatives
Các giải pháp thay thế đã xem xét
```

## 📞 Liên Hệ

Nếu có câu hỏi:
- Tạo issue trên GitHub
- Comment trực tiếp trong Pull Request
- Liên hệ owner: [@danielnguyen161205](https://github.com/danielnguyen161205)

---

**Lưu ý**: Owner/Admin có quyền từ chối hoặc yêu cầu thay đổi bất kỳ Pull Request nào không tuân thủ guidelines này.
