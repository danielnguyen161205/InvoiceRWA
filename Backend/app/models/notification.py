"""
Notification Model for InvoiceRWA Platform

Stores in-app notifications for users including:
- Notification type and priority
- Title and message
- Read/unread status
- Links to related resources
- Metadata for additional context
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.db.base import Base


class Notification(Base):
    """Notification model for storing user notifications"""

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # Recipient user ID

    # Notification content
    type = Column(String(50), nullable=False, index=True)  # Type: INVOICE_CREATED, NFT_MINTED, etc.
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH, URGENT

    # Status tracking
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Related resource
    link = Column(String(500), nullable=True)  # Optional link to invoice/user/etc
    meta_data = Column(JSON, nullable=True)  # Additional data: invoice_id, amount, etc (renamed from metadata)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.type}, is_read={self.is_read})>"
