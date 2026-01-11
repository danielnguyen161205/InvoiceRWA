"""
Run closing fee migration for MySQL
"""
import sys
sys.path.append('.')

from app.db.session import engine
from sqlalchemy import text

# SQL statements
sql_statements = [
    "ALTER TABLE invoices ADD COLUMN closing_fee FLOAT NULL",
    "ALTER TABLE invoices ADD COLUMN closing_fee_paid TINYINT(1) DEFAULT 0",
    "ALTER TABLE invoices ADD COLUMN invoice_closed_by_sme TINYINT(1) DEFAULT 0",
    "ALTER TABLE invoices ADD COLUMN invoice_closed_at DATETIME NULL"
]

def run_migration():
    print("========================================")
    print("  Invoice Closing Fee Migration (MySQL)")
    print("========================================")
    print()
    
    try:
        with engine.connect() as conn:
            for sql in sql_statements:
                try:
                    print(f"Executing: {sql}")
                    conn.execute(text(sql))
                    conn.commit()
                    print("✅ Success")
                except Exception as e:
                    if "Duplicate column name" in str(e):
                        print(f"⚠️  Column already exists, skipping...")
                    else:
                        print(f"❌ Error: {e}")
                        raise
            
            print()
            print("✅ Migration completed successfully!")
            print()
            print("Added columns:")
            print("  - closing_fee (FLOAT)")
            print("  - closing_fee_paid (TINYINT)")
            print("  - invoice_closed_by_sme (TINYINT)")
            print("  - invoice_closed_at (DATETIME)")
            print()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
