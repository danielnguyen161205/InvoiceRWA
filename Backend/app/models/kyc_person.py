from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum
from app.db.base import Base
from enum import Enum as PyEnum


class IdType(str, PyEnum):
    CCCD = "CCCD"
    CMND = "CMND"
    PASSPORT = "PASSPORT"


class PersonRole(str, PyEnum):
    LEGAL_REP = "LEGAL_REP"              # Người đại diện pháp luật
    AUTHORIZED = "AUTHORIZED"            # Người được ủy quyền ký/thao tác
    SHAREHOLDER = "SHAREHOLDER"          # Cổ đông
    UBO = "UBO"                          # Ultimate Beneficial Owner
    OTHER = "OTHER"                      # Khác


class KycPerson(Base):
    __tablename__ = "kyc_persons"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    
    # Personal Information
    full_name = Column(String(255), nullable=False)  # Họ và tên
    date_of_birth = Column(Date, nullable=True)  # Ngày sinh
    nationality = Column(String(100), default="Việt Nam")  # Quốc tịch
    
    # Identification
    id_type = Column(Enum(IdType), default=IdType.CCCD)  # Loại giấy tờ
    id_number = Column(String(100), nullable=False)  # Số CCCD/CMND/Hộ chiếu
    id_issue_date = Column(Date, nullable=True)  # Ngày cấp
    id_issue_place = Column(String(255), nullable=True)  # Nơi cấp
    
    # Contact Information
    address = Column(String(500), nullable=True)  # Địa chỉ cư trú
    contact = Column(String(255), nullable=True)  # Liên hệ (phone/email)
    
    # Role in Organization
    role = Column(Enum(PersonRole), nullable=False)  # Vai trò liên quan đến DN
    
    # OCR/Scan Data (optional - for future use)
    id_document_path = Column(String(500), nullable=True)  # Path to scanned ID
    ocr_data = Column(String(2000), nullable=True)  # JSON string of OCR results
