-- Add rejection fields to invoices table
ALTER TABLE invoices 
ADD COLUMN rejection_comment TEXT NULL,
ADD COLUMN rejected_at DATETIME NULL,
ADD COLUMN rejected_by INT NULL;
