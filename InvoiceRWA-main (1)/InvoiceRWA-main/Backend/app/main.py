from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, invoices, admin, bank
from app.api import kyc, blockchain
from app.db.base import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Invoice RWA Backend")

# Allow frontend dev server origin for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:3000",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

app.include_router(auth.router, prefix="/api")
app.include_router(auth.users_router, prefix="/api")  # Users routes
app.include_router(invoices.router, prefix="/api")
app.include_router(kyc.router, prefix="/api")
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["blockchain"])
app.include_router(admin.router, prefix="/api")  # Admin routes
app.include_router(bank.router, prefix="/api")  # Bank routes


@app.get("/")
def root():
    return {"status": "Invoice RWA API running"}