"""
Notification API Endpoints

Provides endpoints for:
- Getting user notifications
- Marking notifications as read
- Deleting notifications
- Getting unread count
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.session import get_db
from app.core.security import get_current_user
from app.services.notification_service import NotificationService, NotificationTemplates
from app.models.notification import Notification
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])


# Schemas
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    priority: str
    link: Optional[str] = None
    metadata: Optional[dict] = None
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):
    unread_count: int


class MarkReadResponse(BaseModel):
    success: bool
    message: str


@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = Query(False, description="Only return unread notifications"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of notifications"),
    offset: int = Query(0, ge=0, description="Number of notifications to skip"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Get notifications for the current user.

    Args:
        unread_only: If True, only return unread notifications
        limit: Maximum number to return (default: 50, max: 100)
        offset: Number to skip for pagination

    Returns:
        List of notifications ordered by creation date (newest first)
    """
    user_id = int(current_user.get("sub"))
    service = NotificationService(db)

    notifications = service.get_user_notifications(
        user_id=user_id,
        unread_only=unread_only,
        limit=limit,
        offset=offset
    )

    return notifications


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Get count of unread notifications for the current user.

    Returns:
        Number of unread notifications
    """
    user_id = int(current_user.get("sub"))
    service = NotificationService(db)

    count = service.get_unread_count(user_id=user_id)

    return {"unread_count": count}


@router.post("/{notification_id}/mark-read", response_model=MarkReadResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Mark a specific notification as read.

    Args:
        notification_id: ID of the notification to mark as read

    Returns:
        Success status
    """
    user_id = int(current_user.get("sub"))
    service = NotificationService(db)

    try:
        service.mark_as_read(notification_id=notification_id, user_id=user_id)
        return {"success": True, "message": "Notification marked as read"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to mark notification as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")


@router.post("/mark-all-read", response_model=MarkReadResponse)
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Mark all notifications for the current user as read.

    Returns:
        Success status with count of marked notifications
    """
    user_id = int(current_user.get("sub"))
    service = NotificationService(db)

    try:
        count = service.mark_all_as_read(user_id=user_id)
        return {"success": True, "message": f"Marked {count} notifications as read"}
    except Exception as e:
        logger.error(f"Failed to mark all as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark notifications as read")


@router.delete("/{notification_id}", response_model=MarkReadResponse)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Delete a specific notification.

    Args:
        notification_id: ID of the notification to delete

    Returns:
        Success status
    """
    user_id = int(current_user.get("sub"))
    service = NotificationService(db)

    try:
        service.delete_notification(notification_id=notification_id, user_id=user_id)
        return {"success": True, "message": "Notification deleted"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to delete notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete notification")


@router.post("/test", response_model=NotificationResponse)
def create_test_notification(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Create a test notification (for development/debugging).

    Returns:
        Created test notification
    """
    user_id = int(current_user.get("sub"))
    service = NotificationService(db)

    notification = service.create_notification(
        user_id=user_id,
        notification_type="TEST",
        title="Test Notification",
        message=f"This is a test notification for user {user_id}",
        priority="LOW",
        metadata={"test": True},
        link=None
    )

    return notification
