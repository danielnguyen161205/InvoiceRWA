import pymysql
import sys
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

def parse_database_url(url):
    """Parse DATABASE_URL into PyMySQL connection params"""
    if url.startswith("mysql://"):
        url = url.replace("mysql://", "mysql+pymysql://", 1)
    elif url.startswith("mysql+pymysql://"):
        pass
    else:
        raise ValueError(f"Unsupported database URL: {url}")
    
    parsed = urlparse(url)
    
    return {
        'host': parsed.hostname or 'localhost',
        'port': parsed.port or 3306,
        'user': parsed.username,
        'password': parsed.password,
        'database': parsed.path.lstrip('/')
    }

def run_migration():
    try:
        # Get DATABASE_URL from environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL not found in environment variables")
            sys.exit(1)
        
        # Parse connection details
        db_config = parse_database_url(database_url)
        print(f"Connecting to database: {db_config['host']}:{db_config['port']}/{db_config['database']}")
        
        # Connect to database
        conn = pymysql.connect(**db_config)
        cursor = conn.cursor()
        
        print("✅ Connected to database successfully")
        
        # Read SQL file
        with open('db/sql/add_invoice_rejection_fields.sql', 'r') as f:
            sql = f.read()
        
        print("\nExecuting SQL migration...")
        print(sql)
        
        # Execute SQL
        cursor.execute(sql)
        conn.commit()
        
        print("\n✅ Migration completed successfully!")
        print("Added columns: rejection_comment, rejected_at, rejected_by to invoices table")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
