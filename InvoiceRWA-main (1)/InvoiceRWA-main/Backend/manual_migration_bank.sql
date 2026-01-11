-- Manual SQL migration for bank financing feature
-- Run this on your MySQL database (Aiven Cloud)

-- 1. Add new columns to invoices table
ALTER TABLE invoices 
ADD COLUMN bank_confirmed_financed BOOLEAN DEFAULT FALSE,
ADD COLUMN sme_confirmed_receipt BOOLEAN DEFAULT FALSE,
ADD COLUMN bank_financed_at DATETIME NULL,
ADD COLUMN sme_confirmed_at DATETIME NULL;

-- 2. Create bank_requests table
CREATE TABLE IF NOT EXISTS bank_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    bank_id INT NOT NULL,
    sme_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    requested_at DATETIME NULL,
    bank_responded_at DATETIME NULL,
    rejection_reason TEXT NULL,
    financing_started_at DATETIME NULL,
    bank_financed_at DATETIME NULL,
    sme_confirmed_receipt_at DATETIME NULL,
    financed_at DATETIME NULL,
    finance_amount DECIMAL(15, 2) NULL,
    interest_rate DECIMAL(5, 2) NULL,
    notes TEXT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (bank_id) REFERENCES users(id),
    FOREIGN KEY (sme_id) REFERENCES users(id),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_bank_id (bank_id),
    INDEX idx_sme_id (sme_id),
    INDEX idx_status (status)
);

-- 3. Update alembic version (optional - if you use alembic tracking)
-- INSERT INTO alembic_version VALUES ('20260110_add_bank_requests');
