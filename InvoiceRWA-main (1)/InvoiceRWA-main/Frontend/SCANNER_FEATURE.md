# 📸 Tính năng Scan Giấy Tờ Tùy Thân

## Tổng quan
Tính năng scan giấy tờ đã được nâng cấp hoàn toàn với khả năng:
- ✅ Chụp ảnh trực tiếp từ camera (desktop & mobile)
- ✅ Tải ảnh từ file
- ✅ Xem trước và xử lý ảnh
- ✅ Trích xuất thông tin tự động (OCR)
- ✅ Tự động điền vào form

## Vị trí
File: `Frontend/assets/pages/profile.html`
- Modal Scanner: Dòng 577-672
- JavaScript Functions: Dòng 1313-1543

## Luồng hoạt động

### 1. Mở Scanner
Người dùng click nút **"Scan giấy tờ"** bên cạnh trường nhập số CCCD/CMND/Passport.

### 2. Chụp ảnh
- **Camera View**: Hiển thị camera để chụp trực tiếp
  - Nút capture (tròn xanh): Chụp ảnh
  - Nút switch camera (xám): Chuyển camera trước/sau
- **Upload File**: Hoặc click "Tải lên từ file" để chọn ảnh có sẵn

### 3. Xem trước
- Hiển thị ảnh đã chụp/tải lên
- Nút "Chụp lại": Quay lại camera
- Nút "Xử lý & Trích xuất": Bắt đầu OCR

### 4. Xử lý OCR
- Hiển thị loading animation
- Gọi API OCR (hiện tại dùng mock data)
- Trích xuất thông tin:
  - Họ và tên
  - Loại giấy tờ (CCCD/CMND/Passport)
  - Số giấy tờ
  - Ngày sinh
  - Quốc tịch
  - Địa chỉ
  - Ngày cấp
  - Nơi cấp

### 5. Hiển thị kết quả
- Hiển thị tất cả thông tin đã trích xuất
- Hiển thị độ tin cậy (confidence score)
- Nút "Đóng": Hủy bỏ
- Nút "Áp dụng vào Form": Tự động điền thông tin

## Các hàm chính

### `scanIdDocument(personId)`
- Mở modal scanner cho người được chọn
- Khởi tạo camera

### `startCamera()`
- Truy cập camera device
- Hỗ trợ chuyển camera trước/sau
- Độ phân giải: 1920x1080 (ideal)

### `captureDocument()`
- Chụp frame từ video stream
- Chuyển thành base64 image
- Hiển thị preview

### `processDocument()`
- Gọi OCR API (mock)
- Trích xuất thông tin
- Hiển thị kết quả

### `mockOCRExtraction(imageData)`
**⚠️ QUAN TRỌNG: Đây là mock function**

Trong production, thay thế bằng API OCR thực tế:
- **Google Cloud Vision API** - Hỗ trợ tiếng Việt tốt
- **AWS Textract** - OCR mạnh mẽ
- **FPT.AI OCR** - Chuyên CCCD/CMND Việt Nam
- **Viettel AI OCR** - Dịch vụ OCR nội địa

### `applyExtractedData()`
- Lấy thông tin đã trích xuất
- Tự động điền vào form person tương ứng
- Re-render form để hiển thị

### `closeScannerModal()`
- Dừng camera stream
- Reset tất cả states
- Đóng modal

## Tích hợp OCR API thực tế

### Google Cloud Vision API
```javascript
async function realOCRExtraction(imageData) {
    const apiKey = 'YOUR_GOOGLE_CLOUD_API_KEY';
    const base64Image = imageData.split(',')[1];
    
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requests: [{
                image: { content: base64Image },
                features: [
                    { type: 'TEXT_DETECTION' },
                    { type: 'DOCUMENT_TEXT_DETECTION' }
                ]
            }]
        })
    });
    
    const result = await response.json();
    const text = result.responses[0].fullTextAnnotation.text;
    
    // Parse Vietnamese ID card format
    return parseVietnameseID(text);
}

function parseVietnameseID(text) {
    // Regex patterns for Vietnamese CCCD/CMND
    const patterns = {
        idNumber: /(?:Số|No\.?):?\s*(\d{9,12})/i,
        fullName: /(?:Họ và tên|Full name):?\s*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]+)/i,
        dob: /(?:Ngày sinh|Date of birth):?\s*(\d{2}\/\d{2}\/\d{4})/i,
        address: /(?:Nơi thường trú|Place of residence):?\s*([^\n]+)/i,
    };
    
    return {
        id_number: text.match(patterns.idNumber)?.[1],
        full_name: text.match(patterns.fullName)?.[1],
        date_of_birth: convertDateFormat(text.match(patterns.dob)?.[1]),
        address: text.match(patterns.address)?.[1],
        nationality: 'Việt Nam',
        id_type: 'CCCD',
        confidence: 0.92
    };
}
```

### FPT.AI OCR (Chuyên CCCD Việt Nam)
```javascript
async function fptOCRExtraction(imageData) {
    const apiKey = 'YOUR_FPT_AI_API_KEY';
    
    const response = await fetch('https://api.fpt.ai/vision/idr/vnm', {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: imageData.split(',')[1]
        })
    });
    
    const result = await response.json();
    const data = result.data[0];
    
    return {
        id_number: data.id,
        full_name: data.name,
        date_of_birth: data.dob,
        address: data.address,
        nationality: 'Việt Nam',
        id_type: 'CCCD',
        id_issue_date: data.issue_date,
        id_issue_place: data.issue_loc,
        confidence: 0.95
    };
}
```

## UI/UX Features

### Camera Controls
- **Nút chụp (Camera)**: Tròn lớn, màu indigo, hiệu ứng scale khi hover
- **Nút đổi camera**: Tròn nhỏ, màu xám, chuyển giữa camera trước/sau
- **Hướng dẫn**: Text mô tả cách đặt giấy tờ

### Preview
- Hiển thị full-width ảnh đã chụp
- 2 nút: Chụp lại (xám) và Xử lý (xanh)

### Processing
- Spinner animation
- Text "Đang xử lý..."
- Thời gian: ~2 giây

### Results
- Card màu xanh lá
- Icon success
- Grid 2 cột hiển thị thông tin
- Độ tin cậy % ở cuối
- 2 nút: Đóng và Áp dụng

## Tính năng nâng cao có thể thêm

1. **Image Enhancement**
   - Auto-crop (tự động cắt viền)
   - Brightness/Contrast adjustment
   - Perspective correction

2. **Validation**
   - Kiểm tra định dạng số CCCD (9 hoặc 12 số)
   - Kiểm tra ngày hợp lệ
   - Highlight các trường thiếu

3. **Multi-language Support**
   - Hỗ trợ Passport nước ngoài
   - Auto-detect ngôn ngữ

4. **Document Storage**
   - Lưu ảnh giấy tờ lên S3
   - Liên kết với kyc_person record
   - Trường `id_document_path` đã có sẵn trong DB

5. **Security**
   - Encrypt ảnh trước khi upload
   - Watermark với timestamp
   - EXIF data stripping

## Browser Support
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (iOS 11+)
- ✅ Mobile browsers: Camera access supported

## Permissions Required
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
```
User phải cho phép truy cập camera khi browser yêu cầu.

## Testing

### Desktop
1. Click "Scan giấy tờ"
2. Cho phép camera access
3. Đặt CCCD/CMND trước camera
4. Click nút chụp
5. Click "Xử lý & Trích xuất"
6. Xem kết quả
7. Click "Áp dụng vào Form"

### Mobile
1. Mở trang trên mobile browser
2. Tương tự desktop
3. Hoặc chọn "Tải lên từ file" để chọn ảnh từ thư viện

## Notes
- Mock OCR trả về dữ liệu random để demo
- Cần thay thế `mockOCRExtraction()` bằng API thực
- Camera stream tự động dừng khi đóng modal
- Hỗ trợ cả front và back camera (mobile)
