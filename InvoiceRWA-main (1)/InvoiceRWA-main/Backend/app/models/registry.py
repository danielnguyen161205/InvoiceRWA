from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from app.db.base import Base
import datetime


class RegistryEntry(Base):
    __tablename__ = "registry_entries"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    doc_hash = Column(String(255), nullable=False, index=True)
    lien_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
