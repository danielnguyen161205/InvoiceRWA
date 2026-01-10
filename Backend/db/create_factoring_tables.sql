-- ==========================================
-- HỆ THỐNG BAO THANH TOÁN (INVOICE FACTORING)
-- ==========================================
-- Thiết kế database cho hệ thống RWA Invoice Factoring
-- Hỗ trợ: KYC, Hóa đơn điện tử XML, Hợp đồng bao thanh toán, NFT/Token hóa
-- Ngày tạo: 2026-01-07
-- ==========================================

-- ==========================================
-- BẢNG 1: ORGANIZATIONS (Tổ chức/Công ty)
-- ==========================================
-- Lưu thông tin KYC doanh nghiệp của Seller và Buyer
CREATE TABLE IF NOT EXISTS `organizations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Thông tin cơ bản (Bảng 1: Xác định Chủ thể)
    `name` VARCHAR(255) NOT NULL COMMENT 'Tên công ty/tổ chức',
    `tax_id` VARCHAR(50) NOT NULL COMMENT 'Mã số thuế (MST)',
    `business_registration_no` VARCHAR(100) NULL COMMENT 'Số đăng ký kinh doanh',
    `legal_representative` VARCHAR(255) NULL COMMENT 'Người đại diện pháp luật',
    
    -- Thông tin liên hệ
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `address` TEXT NULL COMMENT 'Địa chỉ trụ sở',
    `website` VARCHAR(255) NULL,
    
    -- Phân loại
    `org_type` ENUM('seller', 'buyer', 'both', 'bank') NOT NULL DEFAULT 'seller' 
        COMMENT 'Loại tổ chức: Seller (SME), Buyer (Doanh nghiệp mua hàng), Bank (Ngân hàng/Tổ chức tài chính)',
    
    -- Thông tin ngành nghề
    `industry` VARCHAR(100) NULL COMMENT 'Ngành nghề kinh doanh',
    `business_scope` TEXT NULL COMMENT 'Phạm vi kinh doanh',
    
    -- Tài liệu pháp lý (JSON)
    `legal_documents` JSON NULL COMMENT 'Giấy phép kinh doanh, đăng ký thuế, etc.',
    
    -- Trạng thái KYC
    `kyc_status` ENUM('not_started', 'in_review', 'approved', 'rejected', 'expired') 
        NOT NULL DEFAULT 'not_started',
    `kyc_verified_at` DATETIME NULL,
    `kyc_verified_by` INT NULL COMMENT 'User ID của người xác minh',
    
    -- Audit
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_organizations_tax_id` (`tax_id`),
    KEY `idx_organizations_type` (`org_type`),
    KEY `idx_organizations_kyc_status` (`kyc_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- BẢNG 2: INVOICES (Hóa đơn điện tử)
-- ==========================================
-- Lưu thông tin từ XML hóa đơn điện tử (Bảng 2: Thông tin Khoản phải thu)
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Thông tin hóa đơn từ XML
    `invoice_no` VARCHAR(50) NOT NULL COMMENT 'Số hóa đơn',
    `serial_no` VARCHAR(50) NOT NULL COMMENT 'Ký hiệu hóa đơn',
    `issue_date` DATE NOT NULL COMMENT 'Ngày lập hóa đơn',
    `invoice_value` DECIMAL(20, 2) NOT NULL COMMENT 'Giá trị hóa đơn (Face Value)',
    `currency` CHAR(3) NOT NULL DEFAULT 'VND' COMMENT 'Loại tiền tệ (ISO 4217)',
    `lookup_code` VARCHAR(100) NULL COMMENT 'Mã tra cứu từ Cơ quan thuế',
    
    -- Thông tin bên bán & bên mua
    `seller_org_id` INT UNSIGNED NOT NULL COMMENT 'Tổ chức bên bán (Seller)',
    `buyer_org_id` INT UNSIGNED NOT NULL COMMENT 'Tổ chức bên mua (Buyer)',
    `seller_user_id` INT UNSIGNED NULL COMMENT 'User khởi tạo (từ Seller)',
    
    -- Thông tin chi tiết hàng hóa/dịch vụ (từ XML)
    `items` JSON NULL COMMENT 'Chi tiết hàng hóa/dịch vụ từ XML',
    
    -- File gốc
    `xml_file_path` VARCHAR(500) NULL COMMENT 'Đường dẫn file XML gốc (S3/storage)',
    `xml_hash` VARCHAR(128) NULL COMMENT 'Hash của file XML để verify',
    `pdf_file_path` VARCHAR(500) NULL COMMENT 'Đường dẫn file PDF (nếu có)',
    
    -- Trạng thái hóa đơn
    `invoice_status` ENUM('draft', 'issued', 'verified', 'paid', 'cancelled') 
        NOT NULL DEFAULT 'issued',
    `verified_at` DATETIME NULL COMMENT 'Ngày xác thực với Cơ quan thuế',
    
    -- Audit
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_invoices_number_serial` (`invoice_no`, `serial_no`),
    KEY `idx_invoices_seller` (`seller_org_id`),
    KEY `idx_invoices_buyer` (`buyer_org_id`),
    KEY `idx_invoices_status` (`invoice_status`),
    KEY `idx_invoices_issue_date` (`issue_date`),
    
    CONSTRAINT `fk_invoices_seller` 
        FOREIGN KEY (`seller_org_id`) REFERENCES `organizations` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_invoices_buyer` 
        FOREIGN KEY (`buyer_org_id`) REFERENCES `organizations` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- BẢNG 3: FACTORING_CONTRACTS (Hợp đồng Bao thanh toán)
-- ==========================================
-- Hợp đồng RWA - Token hóa khoản phải thu (Bảng 3 & Overview)
CREATE TABLE IF NOT EXISTS `factoring_contracts` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Liên kết hóa đơn
    `invoice_id` INT UNSIGNED NOT NULL COMMENT 'Hóa đơn được bao thanh toán',
    
    -- ===== BẢNG 1: XÁC ĐỊNH CHỦ THỂ & MỤC ĐÍCH =====
    `seller_org_id` INT UNSIGNED NOT NULL COMMENT 'Seller (SME)',
    `seller_name` VARCHAR(255) NOT NULL COMMENT 'Tên Seller từ KYC',
    `seller_tax_id` VARCHAR(50) NOT NULL COMMENT 'MST Seller từ KYC',
    
    `buyer_org_id` INT UNSIGNED NOT NULL COMMENT 'Buyer (Doanh nghiệp)',
    `buyer_name` VARCHAR(255) NOT NULL COMMENT 'Tên Buyer từ KYC',
    `buyer_tax_id` VARCHAR(50) NOT NULL COMMENT 'MST Buyer từ KYC',
    
    `funding_purpose` TEXT NOT NULL COMMENT 'Lý do/Mục đích bao thanh toán (Bắt buộc theo luật)',
    `funding_category` VARCHAR(100) NULL COMMENT 'Nhóm phân loại mục đích (VD: Vốn lưu động, Mở rộng sản xuất, etc.)',
    
    -- ===== BẢNG 2: THÔNG TIN KHOẢN PHẢI THU (từ Invoice) =====
    `face_value` DECIMAL(20, 2) NOT NULL COMMENT 'Mệnh giá (Invoice Value)',
    `currency` CHAR(3) NOT NULL DEFAULT 'VND',
    
    -- ===== BẢNG 3: THIẾT LẬP ĐIỀU KHOẢN BAO THANH TOÁN =====
    `recourse_type` TINYINT(1) NOT NULL DEFAULT 1 
        COMMENT '1 = Có truy đòi (Recourse), 0 = Không truy đòi (Non-recourse)',
    
    `payment_term` INT NOT NULL COMMENT 'Hạn thanh toán (số ngày)',
    `maturity_date` DATE NOT NULL COMMENT 'Ngày đáo hạn (Invoice Issue Date + Payment Term)',
    
    `proposed_ltv` DECIMAL(5, 2) NOT NULL COMMENT 'Tỷ lệ ứng (Loan-to-Value) đề xuất (%)',
    `funding_request` DECIMAL(20, 2) NOT NULL COMMENT 'Số tiền yêu cầu giải ngân (Face Value * LTV)',
    `reserve_amount` DECIMAL(20, 2) NOT NULL COMMENT 'Số tiền dự trữ (Face Value - Funding Request)',
    
    `discount_rate` DECIMAL(5, 4) NOT NULL COMMENT 'Lãi suất chiết khấu Seller chấp nhận (%/năm)',
    `discount_fee` DECIMAL(20, 2) NULL COMMENT 'Phí chiết khấu = Funding Request * Discount Rate * (Duration/365)',
    
    `dispute_method` VARCHAR(100) NOT NULL DEFAULT 'VIAC' 
        COMMENT 'Phương thức giải quyết tranh chấp (VD: VIAC - Trọng tài)',
    
    -- ===== OVERVIEW: TOKENIZATION & NFT =====
    `token_id` VARCHAR(128) NULL COMMENT 'Token ID (Hash) trên Blockchain',
    `nft_contract_address` VARCHAR(128) NULL COMMENT 'Địa chỉ Smart Contract NFT',
    `token_standard` VARCHAR(20) NULL DEFAULT 'ERC-721' COMMENT 'Chuẩn token (ERC-721, ERC-1155, etc.)',
    
    -- ===== THỜI HẠN & DURATION =====
    `contract_date` DATE NOT NULL COMMENT 'Ngày hợp đồng',
    `duration_days` INT NULL COMMENT 'Số ngày từ hợp đồng đến đáo hạn (Maturity Date - Contract Date)',
    
    -- ===== TRẠNG THÁI HỢP ĐỒNG =====
    `contract_status` ENUM(
        'draft',           -- Bản nháp
        'pending_buyer',   -- Chờ Buyer xác nhận
        'pending_verify',  -- Chờ xác thực/phê duyệt
        'verified',        -- Đã xác thực, sẵn sàng lên marketplace
        'listed',          -- Đã đưa lên marketplace
        'funded',          -- Đã được tài trợ (Bank mua)
        'matured',         -- Đã đáo hạn
        'settled',         -- Đã thanh toán hoàn tất
        'defaulted',       -- Vỡ nợ
        'cancelled'        -- Hủy bỏ
    ) NOT NULL DEFAULT 'draft',
    
    `verified_at` DATETIME NULL COMMENT 'Thời điểm verified (đủ điều kiện lên marketplace)',
    `listed_at` DATETIME NULL COMMENT 'Thời điểm đưa lên marketplace',
    `funded_at` DATETIME NULL COMMENT 'Thời điểm được tài trợ',
    
    -- ===== BẢNG 4: CHỮ KÝ SỐ =====
    `seller_signature` TEXT NULL COMMENT 'Chữ ký số của Seller',
    `seller_signed_at` DATETIME NULL,
    
    `buyer_signature` TEXT NULL COMMENT 'Chữ ký số của Buyer',
    `buyer_signed_at` DATETIME NULL,
    
    `bank_signature` TEXT NULL COMMENT 'Chữ ký số của Bank/Funder (nếu có)',
    `bank_signed_at` DATETIME NULL,
    
    -- Audit
    `created_by` INT UNSIGNED NULL COMMENT 'User ID người tạo (thường là Seller)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_factoring_invoice` (`invoice_id`),
    KEY `idx_factoring_seller` (`seller_org_id`),
    KEY `idx_factoring_buyer` (`buyer_org_id`),
    KEY `idx_factoring_status` (`contract_status`),
    KEY `idx_factoring_maturity` (`maturity_date`),
    KEY `idx_factoring_token` (`token_id`),
    
    CONSTRAINT `fk_factoring_invoice` 
        FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_factoring_seller` 
        FOREIGN KEY (`seller_org_id`) REFERENCES `organizations` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_factoring_buyer` 
        FOREIGN KEY (`buyer_org_id`) REFERENCES `organizations` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- BẢNG 4: DIGITAL_SIGNATURES (Chữ ký số)
-- ==========================================
-- Lưu trữ chi tiết chữ ký số của các bên
CREATE TABLE IF NOT EXISTS `digital_signatures` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    `contract_id` INT UNSIGNED NOT NULL COMMENT 'Hợp đồng liên quan',
    `contract_type` VARCHAR(50) NOT NULL DEFAULT 'factoring' 
        COMMENT 'Loại hợp đồng (factoring, loan, etc.)',
    
    -- Thông tin người ký
    `signer_type` ENUM('seller', 'buyer', 'bank', 'other') NOT NULL,
    `signer_org_id` INT UNSIGNED NULL COMMENT 'Tổ chức ký',
    `signer_user_id` INT UNSIGNED NULL COMMENT 'User ký (nếu có)',
    `signer_name` VARCHAR(255) NOT NULL COMMENT 'Tên người ký',
    
    -- Chữ ký số
    `signature_data` TEXT NOT NULL COMMENT 'Chữ ký số (base64 hoặc hex)',
    `signature_algorithm` VARCHAR(50) NOT NULL DEFAULT 'RSA-SHA256' 
        COMMENT 'Thuật toán ký (RSA, ECDSA, etc.)',
    `public_key` TEXT NULL COMMENT 'Public key để verify',
    `certificate` TEXT NULL COMMENT 'Chứng thư số (nếu có)',
    
    -- Thông tin xác thực
    `signature_hash` VARCHAR(128) NOT NULL COMMENT 'Hash của chữ ký',
    `document_hash` VARCHAR(128) NOT NULL COMMENT 'Hash của tài liệu được ký',
    `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
    `verified_at` DATETIME NULL,
    
    -- Metadata
    `ip_address` VARCHAR(45) NULL COMMENT 'IP người ký',
    `user_agent` VARCHAR(500) NULL COMMENT 'Thiết bị/trình duyệt',
    `signed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `idx_signatures_contract` (`contract_id`, `contract_type`),
    KEY `idx_signatures_signer` (`signer_org_id`),
    KEY `idx_signatures_hash` (`signature_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- BẢNG PHỤ: MARKETPLACE_LISTINGS
-- ==========================================
-- Quản lý danh sách hợp đồng trên marketplace
CREATE TABLE IF NOT EXISTS `marketplace_listings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    `contract_id` INT UNSIGNED NOT NULL COMMENT 'Hợp đồng bao thanh toán',
    
    -- Thông tin listing
    `listing_price` DECIMAL(20, 2) NOT NULL COMMENT 'Giá niêm yết',
    `min_investment` DECIMAL(20, 2) NULL COMMENT 'Số tiền đầu tư tối thiểu',
    `max_investment` DECIMAL(20, 2) NULL COMMENT 'Số tiền đầu tư tối đa',
    
    -- Thời gian
    `listed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `delisted_at` DATETIME NULL,
    `expires_at` DATETIME NULL COMMENT 'Hết hạn listing',
    
    -- Trạng thái
    `listing_status` ENUM('active', 'sold', 'expired', 'cancelled') 
        NOT NULL DEFAULT 'active',
    
    -- Thông tin người mua (Bank/Investor)
    `buyer_org_id` INT UNSIGNED NULL COMMENT 'Tổ chức mua (Bank)',
    `purchased_at` DATETIME NULL,
    `purchase_price` DECIMAL(20, 2) NULL COMMENT 'Giá thực tế mua',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_listing_contract` (`contract_id`),
    KEY `idx_listing_status` (`listing_status`),
    KEY `idx_listing_buyer` (`buyer_org_id`),
    
    CONSTRAINT `fk_listing_contract` 
        FOREIGN KEY (`contract_id`) REFERENCES `factoring_contracts` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- BẢNG PHỤ: PAYMENT_RECORDS
-- ==========================================
-- Lưu trữ lịch sử thanh toán
CREATE TABLE IF NOT EXISTS `payment_records` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    `contract_id` INT UNSIGNED NOT NULL,
    
    -- Thông tin thanh toán
    `payment_type` ENUM('funding', 'reserve_release', 'interest', 'penalty', 'refund') 
        NOT NULL COMMENT 'Loại thanh toán',
    `amount` DECIMAL(20, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'VND',
    
    -- Bên trả & nhận
    `payer_org_id` INT UNSIGNED NULL COMMENT 'Bên trả',
    `payee_org_id` INT UNSIGNED NULL COMMENT 'Bên nhận',
    
    -- Chi tiết giao dịch
    `transaction_ref` VARCHAR(100) NULL COMMENT 'Mã giao dịch ngân hàng',
    `payment_method` VARCHAR(50) NULL COMMENT 'Phương thức (Bank Transfer, Blockchain, etc.)',
    `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') 
        NOT NULL DEFAULT 'pending',
    
    `payment_date` DATETIME NOT NULL,
    `confirmed_at` DATETIME NULL,
    
    -- Blockchain (nếu có)
    `blockchain_tx_hash` VARCHAR(128) NULL COMMENT 'Hash giao dịch trên blockchain',
    
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `idx_payment_contract` (`contract_id`),
    KEY `idx_payment_payer` (`payer_org_id`),
    KEY `idx_payment_status` (`payment_status`),
    
    CONSTRAINT `fk_payment_contract` 
        FOREIGN KEY (`contract_id`) REFERENCES `factoring_contracts` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- CẬP NHẬT BẢNG USERS
-- ==========================================
-- Thêm trường tax_id vào bảng users (nếu chưa có)
-- Chạy riêng nếu bảng users đã tồn tại:

-- ALTER TABLE `users` 
--     ADD COLUMN `tax_id` VARCHAR(50) NULL COMMENT 'Mã số thuế cá nhân' AFTER `id_number`,
--     ADD KEY `idx_users_tax_id` (`tax_id`);


-- ==========================================
-- INDEXES BỔ SUNG (Performance Optimization)
-- ==========================================

-- Tối ưu cho queries thường dùng
CREATE INDEX `idx_invoices_seller_status` ON `invoices` (`seller_org_id`, `invoice_status`);
CREATE INDEX `idx_factoring_seller_status` ON `factoring_contracts` (`seller_org_id`, `contract_status`);
CREATE INDEX `idx_factoring_created_at` ON `factoring_contracts` (`created_at`);


-- ==========================================
-- TRIGGERS TỰ ĐỘNG
-- ==========================================

-- Trigger: Tự động tính toán funding_request và reserve_amount
DELIMITER $$
CREATE TRIGGER `trg_factoring_calculate_funding` 
BEFORE INSERT ON `factoring_contracts`
FOR EACH ROW
BEGIN
    SET NEW.funding_request = NEW.face_value * (NEW.proposed_ltv / 100);
    SET NEW.reserve_amount = NEW.face_value - NEW.funding_request;
    
    -- Tính duration
    IF NEW.contract_date IS NOT NULL AND NEW.maturity_date IS NOT NULL THEN
        SET NEW.duration_days = DATEDIFF(NEW.maturity_date, NEW.contract_date);
    END IF;
    
    -- Tính discount fee (nếu có discount_rate)
    IF NEW.discount_rate IS NOT NULL AND NEW.duration_days IS NOT NULL THEN
        SET NEW.discount_fee = NEW.funding_request * (NEW.discount_rate / 100) * (NEW.duration_days / 365);
    END IF;
END$$

CREATE TRIGGER `trg_factoring_update_funding` 
BEFORE UPDATE ON `factoring_contracts`
FOR EACH ROW
BEGIN
    IF NEW.face_value != OLD.face_value OR NEW.proposed_ltv != OLD.proposed_ltv THEN
        SET NEW.funding_request = NEW.face_value * (NEW.proposed_ltv / 100);
        SET NEW.reserve_amount = NEW.face_value - NEW.funding_request;
    END IF;
    
    IF NEW.contract_date != OLD.contract_date OR NEW.maturity_date != OLD.maturity_date THEN
        SET NEW.duration_days = DATEDIFF(NEW.maturity_date, NEW.contract_date);
    END IF;
    
    IF NEW.discount_rate != OLD.discount_rate OR NEW.duration_days != OLD.duration_days THEN
        SET NEW.discount_fee = NEW.funding_request * (NEW.discount_rate / 100) * (NEW.duration_days / 365);
    END IF;
END$$
DELIMITER ;


-- ==========================================
-- DỮ LIỆU MẪU (SAMPLE DATA)
-- ==========================================

-- Organization mẫu (Seller - SME)
INSERT INTO `organizations` (name, tax_id, org_type, email, phone, address, kyc_status)
VALUES 
('Công ty TNHH ABC Trading', '0123456789', 'seller', 'abc@example.com', '+84901234567', 
 'Số 123 Đường ABC, Quận 1, TP.HCM', 'approved'),

-- Organization mẫu (Buyer)
('Tập đoàn XYZ Corporation', '9876543210', 'buyer', 'xyz@example.com', '+84907654321', 
 'Số 456 Đường XYZ, Quận 3, TP.HCM', 'approved'),

-- Organization mẫu (Bank)
('Ngân hàng TMCP TechBank', '1112223334', 'bank', 'techbank@example.com', '+84909999999', 
 'Số 789 Đường Banking, Quận 1, TP.HCM', 'approved');


-- ==========================================
-- NOTES VÀ HƯỚNG DẪN SỬ DỤNG
-- ==========================================
/*
1. WORKFLOW BAO THANH TOÁN:
   - Seller upload XML hóa đơn → Tạo record trong `invoices`
   - Seller khởi tạo hợp đồng → Tạo record trong `factoring_contracts` (status = 'draft')
   - Seller mời Buyer tham gia → Buyer ký (status = 'pending_verify')
   - Hệ thống xác thực → status = 'verified'
   - Đưa lên marketplace → `marketplace_listings` (status = 'verified' → 'listed')
   - Bank mua → status = 'funded', tạo record trong `payment_records`
   - Đáo hạn & thanh toán → status = 'settled'

2. CÁC TRẠNG THÁI QUAN TRỌNG:
   - factoring_contracts.contract_status: Theo dõi vòng đời hợp đồng
   - invoices.invoice_status: Theo dõi trạng thái hóa đơn
   - organizations.kyc_status: Đảm bảo KYC trước khi tham gia

3. BẢO MẬT & TUÂN THỦ:
   - Chữ ký số lưu trong `digital_signatures`
   - File XML/PDF lưu off-chain (S3)
   - Hash để verify tính toàn vẹn
   - Audit trail đầy đủ

4. TOKENIZATION (NFT/RWA):
   - token_id: Mã định danh duy nhất trên blockchain
   - nft_contract_address: Smart contract address
   - Mỗi hợp đồng = 1 NFT = 1 tài sản kỹ thuật số

5. TÍNH TOÁN TỰ ĐỘNG:
   - Triggers tự động tính: funding_request, reserve_amount, duration, discount_fee
   - Đảm bảo tính nhất quán dữ liệu
*/
