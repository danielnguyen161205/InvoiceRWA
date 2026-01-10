from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, invoices, admin
from app.api import kyc, blockchain
from app.db.base import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Invoice RWA Backend")

# Allow frontend dev server origin for development
# Use wildcard for development to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=False,  # Set to False when using wildcard
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