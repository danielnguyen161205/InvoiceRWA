from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    # store roles as a comma-separated string, e.g. "SME,BUYER"
    roles = Column(String(255), nullable=False)
    # keep `role` column mapped for backward compatibility with existing DB
    role = Column(String(50), nullable=False)
    # link to organization for KYC
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=True)
