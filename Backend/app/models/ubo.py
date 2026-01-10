from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text, Enum
from app.db.base import Base
from enum import Enum as PyEnum


class ShareholderType(str, PyEnum):
    INDIVIDUAL = "INDIVIDUAL"      # Cá nhân
    ORGANIZATION = "ORGANIZATION"  # Tổ chức


class Shareholder(Base):
    """Cổ đông/Thành viên góp vốn"""
    __tablename__ = "shareholders"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)  # Tên cổ đông/thành viên
    shareholder_type = Column(Enum(ShareholderType), default=ShareholderType.INDIVIDUAL)  # Loại
    ownership_percent = Column(Float, nullable=True)  # Tỷ lệ sở hữu (%)
    id_number = Column(String(100), nullable=True)  # Số CCCD/MST
    
    # Additional info
    address = Column(String(500), nullable=True)
    contact = Column(String(255), nullable=True)


class UBO(Base):
    """UBO và thông tin niêm yết"""
    __tablename__ = "ubos"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, unique=True, index=True)
    
    # Listed company info
    is_listed = Column(Boolean, default=False)  # Công ty có niêm yết
    stock_exchange = Column(String(50), nullable=True)  # HOSE, HNX, UPCOM
    stock_code = Column(String(20), nullable=True)  # Mã chứng khoán
    
    # Ownership documents (JSON or file paths)
    ownership_documents = Column(Text, nullable=True)  # Danh sách file paths (JSON string)
    
    # Additional notes
    notes = Column(Text, nullable=True)
