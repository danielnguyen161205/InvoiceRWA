"""
Add original_data_snapshot field for change tracking
"""
import sys
sys.path.append('.')

from app.db.session import engine
from sqlalchemy import text

def run_migration():
    print("========================================")
    print("  Add Change Tracking Field")
    print("========================================")
    print()
    
    sql = "ALTER TABLE invoices ADD COLUMN original_data_snapshot TEXT NULL"
    
    try:
        with engine.connect() as conn:
            print(f"Executing: {sql}")
            conn.execute(text(sql))
            conn.commit()
            print("✅ Success")
            print()
            print("✅ Migration completed successfully!")
            print()
            print("Added column: original_data_snapshot (TEXT)")
            print()
    except Exception as e:
        if "Duplicate column name" in str(e):
            print(f"⚠️  Column already exists, skipping...")
            return True
        else:
            print(f"❌ Migration failed: {e}")
            return False
    
    return True

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
