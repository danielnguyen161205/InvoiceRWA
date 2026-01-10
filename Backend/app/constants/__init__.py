"""
Constants module for InvoiceRWA Platform

This module contains shared constants used across the application.
"""

from app.constants.invoice_status import (
    InvoiceStatus,
    InvoiceStatusTransition,
    InvoiceStatusDisplay,
    ALL_STATUSES,
    ACTIVE_STATUSES,
    TERMINAL_STATUSES,
    is_terminal_status,
    is_editable,
    requires_approval,
    can_request_financing,
    is_financed,
    get_statuses_for_role,
)

__all__ = [
    # Invoice Status
    "InvoiceStatus",
    "InvoiceStatusTransition",
    "InvoiceStatusDisplay",
    "ALL_STATUSES",
    "ACTIVE_STATUSES",
    "TERMINAL_STATUSES",
    # Helper functions
    "is_terminal_status",
    "is_editable",
    "requires_approval",
    "can_request_financing",
    "is_financed",
    "get_statuses_for_role",
]
