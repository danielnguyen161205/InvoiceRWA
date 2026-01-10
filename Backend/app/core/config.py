from dotenv import load_dotenv
import os

load_dotenv()

# =====================
# DATABASE
# =====================
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./invoice_rwa.db")

# =====================
# JWT / AUTH
# =====================
SECRET_KEY = os.getenv("SECRET_KEY", "change_me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
