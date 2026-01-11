"""
Script to run dispute system migration
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import SessionLocal

def run_migration():
    """Add dispute fields to invoices table"""
    db = SessionLocal()
    try:
        print("🔄 Running dispute system migration...")
        
        # Check if columns already exist
        result = db.execute(text("SHOW COLUMNS FROM invoices LIKE 'dispute_type'"))
        if result.fetchone():
            print("✅ Dispute fields already exist. Skipping migration.")
            return
        
        # Add new columns
        migrations = [
            "ALTER TABLE invoices ADD COLUMN dispute_type VARCHAR(50) NULL AFTER disputed_by",
            "ALTER TABLE invoices ADD COLUMN dispute_case_id VARCHAR(100) NULL AFTER dispute_type",
            "ALTER TABLE invoices ADD COLUMN dispute_description TEXT NULL AFTER dispute_case_id",
            "ALTER TABLE invoices ADD COLUMN dispute_resolved BOOLEAN DEFAULT 0 AFTER dispute_description",
            "ALTER TABLE invoices ADD COLUMN dispute_resolved_at DATETIME NULL AFTER dispute_resolved"
        ]
        
        for migration in migrations:
            print(f"  Running: {migration[:80]}...")
            db.execute(text(migration))
        
        db.commit()
        print("✅ Dispute system migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
