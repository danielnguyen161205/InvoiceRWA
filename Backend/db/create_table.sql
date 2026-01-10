-- Users table for authentication, KYC, UBO, consent, documents, and compliance
-- Notes:
-- 1) `hashed_password` must be produced using the project's password scheme (pbkdf2_sha256).
--    Example (run inside the project's venv):
--      python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['pbkdf2_sha256']).hash('Password123!'))"
-- 2) `organization_id` references `organizations.id` in the app models (INTEGER).
-- 3) Documents metadata is stored as JSON; actual files should be stored off-chain (S3, filesystem).

CREATE TABLE IF NOT EXISTS `users` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`email` VARCHAR(255) NOT NULL,
	`hashed_password` VARCHAR(512) NOT NULL,
	`roles` VARCHAR(512) NOT NULL DEFAULT 'SME',
	`role` VARCHAR(100) NOT NULL DEFAULT 'SME',

	-- Basic identity (KYC)
	`full_name` VARCHAR(255) NOT NULL,
	`date_of_birth` DATE NULL,
	`nationality` VARCHAR(100) NULL,
	`gender` VARCHAR(20) NULL,
	`id_number` VARCHAR(128) NULL,
	`id_type` VARCHAR(50) NULL,
	`id_issue_date` DATE NULL,
	`id_issue_place` VARCHAR(255) NULL,
	`id_expiry_date` DATE NULL,

	-- Contact & residence
	`permanent_address` TEXT NULL,
	`current_address` TEXT NULL,
	`phone` VARCHAR(50) NULL,

	-- Legal role / organization relation
	`organization_id` INT NULL,
	`relationship_to_org` VARCHAR(100) NULL,
	`position` VARCHAR(255) NULL,

	-- UBO fields (only relevant when `is_ubo`=1)
	`is_ubo` TINYINT(1) NOT NULL DEFAULT 0,
	`ubo_ownership_percent` DECIMAL(5,2) NULL,
	`ubo_ownership_type` VARCHAR(50) NULL,
	`ubo_control` TINYINT(1) NULL,

	-- Documents metadata (OFF-CHAIN storage references)
	`documents` JSON NULL,
	`selfie_present` TINYINT(1) NULL DEFAULT 0,

	-- Compliance & risk (internal only)
	`sanction_screening_result` VARCHAR(100) NULL,
	`pep_flag` TINYINT(1) NULL DEFAULT 0,
	`adverse_media_flag` TINYINT(1) NULL DEFAULT 0,
	`risk_level` VARCHAR(10) NULL,
	`last_screened_at` DATETIME NULL,

	-- Consent (mandatory per NĐ 13/2023)
	`consent_version` VARCHAR(50) NULL,
	`consent_text` TEXT NULL,
	`consent_purpose` VARCHAR(255) NULL,
	`consent_timestamp` DATETIME NULL,
	`consent_method` VARCHAR(100) NULL,
	`consent_copyable` TINYINT(1) NULL DEFAULT 1,

	-- Statuses and validity for renewals
	`user_status` ENUM('pending','verified','rejected','suspended') NOT NULL DEFAULT 'pending',
	`kyc_status` ENUM('not_started','in_review','approved','expired') NOT NULL DEFAULT 'not_started',
	`valid_from` DATETIME NULL,
	`valid_to` DATETIME NULL,

	-- Legacy / audit
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_users_email` (`email`),
	KEY `idx_users_org` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional foreign key (uncomment if `organizations` table exists and you want FK enforcement):
-- ALTER TABLE `users` ADD CONSTRAINT `fk_users_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Example insert (placeholder hashed password). Generate a proper hash as noted above before inserting.
-- INSERT INTO `users` (email, hashed_password, roles, role, full_name, date_of_birth, nationality, phone, permanent_address, organization_id, relationship_to_org, created_at)
-- VALUES ('tester@example.com','<PASTE_HASH_HERE>','SME','SME','Test User','1990-01-01','VN','+84123456789','Some address', NULL, 'representative', NOW());

