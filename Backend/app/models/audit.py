from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from app.db.base import Base
import datetime


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True, index=True)
    actor_sub = Column(String(100), nullable=True)
    actor_roles = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(100), nullable=False)
    target_id = Column(String(100), nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class OrganizationReview(Base):
    __tablename__ = 'organization_reviews'

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    reviewer_sub = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False)  # APPROVE or REJECT
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
