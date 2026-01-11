from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from typing import List

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def get_notifications(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get notifications for the current user.
    Currently returns an empty list - to be implemented.
    """
    return {
        "notifications": [],
        "unread_count": 0,
        "total": 0
    }


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a notification as read.
    Currently a placeholder - to be implemented.
    """
    return {"status": "success", "message": "Notification marked as read"}


@router.post("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark all notifications as read for the current user.
    Currently a placeholder - to be implemented.
    """
    return {"status": "success", "message": "All notifications marked as read"}
