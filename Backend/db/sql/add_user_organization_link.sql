-- Add organization_id column to users table
ALTER TABLE users ADD COLUMN organization_id INTEGER;
ALTER TABLE users ADD CONSTRAINT fk_users_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);
