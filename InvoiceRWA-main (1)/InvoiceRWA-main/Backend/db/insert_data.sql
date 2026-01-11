-- Helper insertion file for test users.
-- Prefer using `db/insert_users.py` (creates pbkdf2_sha256 hashes and inserts users using the project's DB settings).

-- Example SQL (hash must be generated with pbkdf2_sha256 to match the project's auth):
-- INSERT INTO `users` (email, hashed_password, roles, role, full_name, created_at)
-- VALUES ('sme@example.com','<GENERATED_PBKDF2_HASH>','SME','SME','Test SME',NOW());
-- INSERT INTO `users` (email, hashed_password, roles, role, full_name, created_at)
-- VALUES ('buyer@example.com','<GENERATED_PBKDF2_HASH>','buyer','buyer','Test Buyer',NOW());

-- To generate and insert automatically, run (from Backend directory):
-- 1) Install dependency: `pip install passlib`
-- 2) Run: `python db/insert_users.py`

-- ------------------------------------------------------------------
-- HASHED PASSWORD TEST INSERTS (Password: Password123!)
-- ------------------------------------------------------------------
INSERT INTO `users` (email, hashed_password, roles, role, full_name, created_at)
VALUES ('sme@example.com','$pbkdf2-sha256$29000$.r8XIkQoZazVuleqtTbm/A$9Zxfu01qf0fLrUENFqmrmqbAkHLAd/iirgP3YcYYEWI','SME','SME','Test SME',NOW());

INSERT INTO `users` (email, hashed_password, roles, role, full_name, created_at)
VALUES ('buyer@example.com','$pbkdf2-sha256$29000$.r8XIkQoZazVuleqtTbm/A$9Zxfu01qf0fLrUENFqmrmqbAkHLAd/iirgP3YcYYEWI','buyer','buyer','Test Buyer',NOW());

-- ------------------------------------------------------------------
-- TEST INVOICES FOR SME@EXAMPLE.COM
-- ------------------------------------------------------------------
-- Insert test invoices for SME user
-- Note: Replace sme_id with actual user ID if different (default assumes ID=1 for sme@example.com)

INSERT INTO `invoices` (invoice_number, amount, status, sme_id, buyer_name)
VALUES 
('INV-2026-001', 50000.00, 'DRAFT', 1, 'ABC Corporation'),
('INV-2026-002', 75000.00, 'SUBMITTED', 1, 'XYZ Company Ltd'),
('INV-2026-003', 120000.00, 'APPROVED', 1, 'Tech Innovations Inc'),
('INV-2026-004', 95000.00, 'FUNDED', 1, 'Manufacturing Co');

