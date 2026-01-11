from passlib.context import CryptContext
import sys

# Use the application's SQLAlchemy session so inserts go to the same DB
from app.db.session import SessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def insert_user(db, email: str, password: str, roles_list, full_name: str):
    hashed = pwd_context.hash(password)
    roles_str = ",".join(roles_list)
    role_first = roles_list[0] if roles_list else None
    user = User(email=email, hashed_password=hashed, roles=roles_str, role=role_first)
    # optional additional fields can be set on `user` here (full_name is not on model)
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Inserted user: {email} id={user.id} (password: {password}) roles={roles_str}")
    except Exception as e:
        db.rollback()
        print("Insert failed:", e)
        raise


if __name__ == '__main__':
    # Ensure running from Backend/ and venv has passlib installed
    session = SessionLocal()
    try:
        insert_user(session, 'sme@example.com', 'Password123!', ['SME'], 'Test SME')
        insert_user(session, 'buyer@example.com', 'Password123!', ['BUYER'], 'Test Buyer')
    except Exception as exc:
        print('Error inserting users:', exc)
        sys.exit(1)
    finally:
        session.close()

    print('Done — two users inserted. Start backend and test login.')
