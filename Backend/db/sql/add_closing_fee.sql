-- Add invoice closing fee fields
-- Migration for adding closing fee feature

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS closing_fee FLOAT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS closing_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_closed_by_sme BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_closed_at TIMESTAMP;

COMMENT ON COLUMN invoices.closing_fee IS 'Closing fee amount (0.1% of final invoice value)';
COMMENT ON COLUMN invoices.closing_fee_paid IS 'Whether the closing fee has been paid';
COMMENT ON COLUMN invoices.invoice_closed_by_sme IS 'Whether SME has closed the invoice after bank financing';
COMMENT ON COLUMN invoices.invoice_closed_at IS 'Timestamp when invoice was closed by SME';
