-- Add invoice closing fee fields for MySQL
-- Migration for adding closing fee feature

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS closing_fee FLOAT NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS closing_fee_paid TINYINT(1) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_closed_by_sme TINYINT(1) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_closed_at DATETIME NULL;
