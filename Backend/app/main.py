from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, invoices, admin
from app.api import kyc, blockchain
from app.db.base import Base
from app.db.session import engine
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Invoice RWA Backend")

# Configure CORS based on environment
# Get allowed origins from environment variable or use development defaults
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = os.getenv("ALLOWED_ORIGINS", frontend_url).split(",")

# For development, you can set ALLOWED_ORIGINS=* to allow all origins
# In production, always set specific origins
allow_all = "*" in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else allowed_origins,
    allow_credentials=not allow_all,  # Cannot use credentials with wildcard
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(auth.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(kyc.router, prefix="/api")
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["blockchain"])
app.include_router(admin.router, prefix="/api")  # Admin routes


@app.get("/")
def root():
    return {"status": "Invoice RWA API running"}