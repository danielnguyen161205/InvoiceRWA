-- Manual migration for dispute increased amount fields
-- Run this on your MySQL database

USE invoice_rwa; -- Change to your database name

-- Add new dispute resolution fields
ALTER TABLE invoices 
ADD COLUMN dispute_resolution_action VARCHAR(50) NULL AFTER dispute_resolved_at,
ADD COLUMN previous_amount FLOAT NULL AFTER dispute_resolution_action,
ADD COLUMN increased_amount FLOAT NULL AFTER previous_amount,
ADD COLUMN additional_financing_amount FLOAT NULL AFTER increased_amount,
ADD COLUMN linked_invoice_id INT NULL AFTER additional_financing_amount;

-- Verify the columns were added
DESCRIBE invoices;
