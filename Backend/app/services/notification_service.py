"""
Notification Service for InvoiceRWA Platform

This service handles:
1. In-app notification storage and retrieval
2. Email notification sending (template-based)
3. Notification preferences management
4. Notification history tracking

Notifications are sent for:
- Invoice created -> notify buyer
- Buyer approved -> notify seller/admin
- Admin approved -> notify seller
- NFT minted -> notify seller/buyer
- Bank purchased -> notify seller
- Bank request status changes -> notify SME
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)


# Notification Types
class NotificationType:
    INVOICE_CREATED = "INVOICE_CREATED"
    INVOICE_SUBMITTED = "INVOICE_SUBMITTED"
    BUYER_ACCEPTED = "BUYER_ACCEPTED"
    ADMIN_APPROVED = "ADMIN_APPROVED"
    ADMIN_REJECTED = "ADMIN_REJECTED"
    NFT_MINTED = "NFT_MINTED"
    BANK_REQUESTED = "BANK_REQUESTED"
    BANK_ACCEPTED = "BANK_ACCEPTED"
    BANK_REJECTED = "BANK_REJECTED"
    BANK_FINANCED = "BANK_FINANCED"
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED"
    DISPUTE_CREATED = "DISPUTE_CREATED"
    KYC_APPROVED = "KYC_APPROVED"
    KYC_REJECTED = "KYC_REJECTED"


# Notification Priority
class NotificationPriority:
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class NotificationService:
    """Service for managing notifications in the InvoiceRWA platform"""

    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        priority: str = NotificationPriority.MEDIUM,
        metadata: Optional[Dict[str, Any]] = None,
        link: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new notification for a user.

        Args:
            user_id: ID of the user to notify
            notification_type: Type of notification (see NotificationType)
            title: Notification title
            message: Notification message
            priority: Priority level (see NotificationPriority)
            metadata: Additional data (invoice_id, etc.)
            link: Optional link to related resource

        Returns:
            Created notification data
        """
        try:
            # Import Notification model dynamically to avoid circular imports
            from app.models.notification import Notification

            notification = Notification(
                user_id=user_id,
                type=notification_type,
                title=title,
                message=message,
                priority=priority,
                meta_data=metadata or {},  # renamed from metadata (reserved word)
                link=link,
                created_at=datetime.now(timezone.utc),
                is_read=False
            )

            self.db.add(notification)
            self.db.commit()
            self.db.refresh(notification)

            logger.info(f"Created notification for user {user_id}: {title}")

            return {
                "id": notification.id,
                "user_id": notification.user_id,
                "type": notification.type,
                "title": notification.title,
                "message": notification.message,
                "priority": notification.priority,
                "link": notification.link,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat()
            }

        except Exception as e:
            logger.error(f"Failed to create notification: {str(e)}")
            self.db.rollback()
            raise

    def get_user_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get notifications for a user.

        Args:
            user_id: ID of the user
            unread_only: If True, only return unread notifications
            limit: Maximum number of notifications to return
            offset: Number of notifications to skip

        Returns:
            List of notifications
        """
        try:
            from app.models.notification import Notification

            query = self.db.query(Notification).filter(Notification.user_id == user_id)

            if unread_only:
                query = query.filter(Notification.is_read == False)

            query = query.order_by(Notification.created_at.desc())
            query = query.limit(limit).offset(offset)

            notifications = query.all()

            return [
                {
                    "id": n.id,
                    "type": n.type,
                    "title": n.title,
                    "message": n.message,
                    "priority": n.priority,
                    "link": n.link,
                    "metadata": n.meta_data,  # Fixed: use meta_data column name
                    "is_read": n.is_read,
                    "created_at": n.created_at.isoformat()
                }
                for n in notifications
            ]

        except Exception as e:
            logger.error(f"Failed to get notifications: {str(e)}")
            raise

    def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        """
        Mark a notification as read.

        Args:
            notification_id: ID of the notification
            user_id: ID of the user (for authorization)

        Returns:
            True if marked as read successfully
        """
        try:
            from app.models.notification import Notification

            notification = self.db.query(Notification).filter(
                Notification.id == notification_id,
                Notification.user_id == user_id
            ).first()

            if not notification:
                raise HTTPException(status_code=404, detail="Notification not found")

            notification.is_read = True
            notification.read_at = datetime.now(timezone.utc)
            self.db.commit()

            return True

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to mark notification as read: {str(e)}")
            self.db.rollback()
            raise

    def mark_all_as_read(self, user_id: int) -> int:
        """
        Mark all notifications for a user as read.

        Args:
            user_id: ID of the user

        Returns:
            Number of notifications marked as read
        """
        try:
            from app.models.notification import Notification

            count = self.db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.is_read == False
            ).update({
                "is_read": True,
                "read_at": datetime.now(timezone.utc)
            })

            self.db.commit()

            logger.info(f"Marked {count} notifications as read for user {user_id}")
            return count

        except Exception as e:
            logger.error(f"Failed to mark all as read: {str(e)}")
            self.db.rollback()
            raise

    def get_unread_count(self, user_id: int) -> int:
        """
        Get count of unread notifications for a user.

        Args:
            user_id: ID of the user

        Returns:
            Number of unread notifications
        """
        try:
            from app.models.notification import Notification

            count = self.db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.is_read == False
            ).count()

            return count

        except Exception as e:
            logger.error(f"Failed to get unread count: {str(e)}")
            return 0

    def delete_notification(self, notification_id: int, user_id: int) -> bool:
        """
        Delete a notification.

        Args:
            notification_id: ID of the notification
            user_id: ID of the user (for authorization)

        Returns:
            True if deleted successfully
        """
        try:
            from app.models.notification import Notification

            notification = self.db.query(Notification).filter(
                Notification.id == notification_id,
                Notification.user_id == user_id
            ).first()

            if not notification:
                raise HTTPException(status_code=404, detail="Notification not found")

            self.db.delete(notification)
            self.db.commit()

            return True

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to delete notification: {str(e)}")
            self.db.rollback()
            raise


# Notification templates for common events
class NotificationTemplates:
    """Templates for creating standardized notifications"""

    @staticmethod
    def invoice_created(invoice_number: str, seller_name: str, amount: float) -> Dict[str, str]:
        return {
            "title": "New Invoice Created",
            "message": f"{seller_name} sent you a new invoice {invoice_number} for {amount:,.2f}. Please review and accept.",
            "type": NotificationType.INVOICE_CREATED,
            "priority": NotificationPriority.MEDIUM
        }

    @staticmethod
    def invoice_submitted(invoice_number: str) -> Dict[str, str]:
        return {
            "title": "Invoice Submitted for Approval",
            "message": f"Invoice {invoice_number} has been submitted and is pending admin approval.",
            "type": NotificationType.INVOICE_SUBMITTED,
            "priority": NotificationPriority.HIGH
        }

    @staticmethod
    def buyer_accepted(invoice_number: str, buyer_name: str) -> Dict[str, str]:
        return {
            "title": "Invoice Accepted by Buyer",
            "message": f"{buyer_name} has accepted invoice {invoice_number}. It's now pending admin approval.",
            "type": NotificationType.BUYER_ACCEPTED,
            "priority": NotificationPriority.HIGH
        }

    @staticmethod
    def admin_approved(invoice_number: str) -> Dict[str, str]:
        return {
            "title": "Invoice Approved",
            "message": f"Invoice {invoice_number} has been approved by admin. You can now request financing.",
            "type": NotificationType.ADMIN_APPROVED,
            "priority": NotificationPriority.HIGH
        }

    @staticmethod
    def admin_rejected(invoice_number: str, reason: str) -> Dict[str, str]:
        return {
            "title": "Invoice Rejected",
            "message": f"Invoice {invoice_number} was rejected. Reason: {reason}",
            "type": NotificationType.ADMIN_REJECTED,
            "priority": NotificationPriority.URGENT
        }

    @staticmethod
    def nft_minted(invoice_number: str, token_id: int) -> Dict[str, str]:
        return {
            "title": "NFT Minted Successfully",
            "message": f"Invoice {invoice_number} has been tokenized. Token ID: {token_id}",
            "type": NotificationType.NFT_MINTED,
            "priority": NotificationPriority.HIGH
        }

    @staticmethod
    def bank_request_sent(invoice_number: str, bank_name: str) -> Dict[str, str]:
        return {
            "title": "Financing Request Sent",
            "message": f"Financing request for invoice {invoice_number} has been sent to {bank_name}.",
            "type": NotificationType.BANK_REQUESTED,
            "priority": NotificationPriority.MEDIUM
        }

    @staticmethod
    def bank_accepted(invoice_number: str, bank_name: str) -> Dict[str, str]:
        return {
            "title": "Financing Request Accepted",
            "message": f"{bank_name} has accepted to finance invoice {invoice_number}. Please confirm receipt of funds.",
            "type": NotificationType.BANK_ACCEPTED,
            "priority": NotificationPriority.HIGH
        }

    @staticmethod
    def bank_rejected(invoice_number: str, bank_name: str, reason: str) -> Dict[str, str]:
        return {
            "title": "Financing Request Rejected",
            "message": f"{bank_name} declined to finance invoice {invoice_number}. Reason: {reason}",
            "type": NotificationType.BANK_REJECTED,
            "priority": NotificationPriority.HIGH
        }

    @staticmethod
    def bank_financed(invoice_number: str, bank_name: str, amount: float) -> Dict[str, str]:
        return {
            "title": "Financing Confirmed",
            "message": f"{bank_name} has transferred {amount:,.2f} for invoice {invoice_number}. Please confirm receipt.",
            "type": NotificationType.BANK_FINANCED,
            "priority": NotificationPriority.URGENT
        }

    @staticmethod
    def kyc_approved(org_name: str) -> Dict[str, str]:
        return {
            "title": "KYC Verification Approved",
            "message": f"Your organization '{org_name}' has been verified. You can now use all platform features.",
            "type": NotificationType.KYC_APPROVED,
            "priority": NotificationPriority.HIGH
        }

    @staticmethod
    def kyc_rejected(org_name: str, reason: str) -> Dict[str, str]:
        return {
            "title": "KYC Verification Rejected",
            "message": f"Your organization '{org_name}' verification was rejected. Reason: {reason}",
            "type": NotificationType.KYC_REJECTED,
            "priority": NotificationPriority.URGENT
        }

    @staticmethod
    def dispute_created(invoice_number: str, case_id: str) -> Dict[str, str]:
        return {
            "title": "Dispute Created",
            "message": f"A dispute has been created for invoice {invoice_number}. Case ID: {case_id}",
            "type": NotificationType.DISPUTE_CREATED,
            "priority": NotificationPriority.URGENT
        }


def notify_users(
    db: Session,
    user_ids: List[int],
    title: str,
    message: str,
    notification_type: str,
    priority: str = NotificationPriority.MEDIUM,
    metadata: Optional[Dict[str, Any]] = None,
    link: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Helper function to send notifications to multiple users.

    Args:
        db: Database session
        user_ids: List of user IDs to notify
        title: Notification title
        message: Notification message
        notification_type: Type of notification
        priority: Priority level
        metadata: Additional data
        link: Optional link

    Returns:
        List of created notifications
    """
    service = NotificationService(db)
    results = []

    for user_id in user_ids:
        try:
            notification = service.create_notification(
                user_id=user_id,
                notification_type=notification_type,
                title=title,
                message=message,
                priority=priority,
                metadata=metadata,
                link=link
            )
            results.append(notification)
        except Exception as e:
            logger.error(f"Failed to notify user {user_id}: {str(e)}")

    return results
