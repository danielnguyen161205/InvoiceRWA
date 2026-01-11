from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.db.base import Base
import datetime


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    doc_type = Column(String(100), nullable=False)
    filename = Column(String(255), nullable=True)
    file_hash = Column(String(255), nullable=False, index=True)
    storage_path = Column(String(500), nullable=True)
    uploaded_by = Column(String(100), nullable=True)
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    review_status = Column(String(50), default="PENDING")
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
