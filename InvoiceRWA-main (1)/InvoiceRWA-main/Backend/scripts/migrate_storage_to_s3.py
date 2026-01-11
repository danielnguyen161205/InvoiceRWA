import os
from app.db.session import SessionLocal
from app.models.document import Document
from app.storage import _USE_S3, save_file

def migrate():
    if not _USE_S3:
        print("S3 is not enabled. Set S3_ENABLED=true to perform migration.")
        return

    storage_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'storage')
    if not os.path.exists(storage_dir):
        print("No local storage found to migrate.")
        return

    db = SessionLocal()
    try:
        # find documents without storage_path
        docs = db.query(Document).filter(Document.storage_path == None).all()
        for d in docs:
            # local file expected under storage/{org_id}/{file_hash}_{filename}
            local_path = os.path.join(storage_dir, str(d.org_id), f"{d.file_hash}_{d.filename}")
            if not os.path.exists(local_path):
                print(f"Local file missing for doc {d.id}: {local_path}")
                continue

            with open(local_path, 'rb') as f:
                file_hash, storage_path = save_file(d.org_id, d.filename, f, d.doc_type)
                d.storage_path = storage_path
                db.add(d)
                db.commit()
                print(f"Migrated doc {d.id} to {storage_path}")
    finally:
        db.close()

if __name__ == '__main__':
    migrate()
