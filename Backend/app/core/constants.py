"""
Invoice Status Constants for InvoiceRWA Platform

This module defines all status constants used throughout the platform
to ensure consistency between frontend and backend.

Status Flow:
DRAFT -> EDITING -> DRAFT -> SUBMITTED -> APPROVED -> FINANCING -> FINANCED -> SETTLED -> CLOSED

Alternative flows:
- DRAFT -> REJECTED (buyer/admin rejection)
- SUBMITTED/APPROVED -> DISPUTED (buyer dispute)
- FINANCED -> DISPUTED (post-finance dispute)
"""

from enum import Enum
from typing import List


class InvoiceStatus(str, Enum):
    """Invoice status constants"""

    # Initial states
    DRAFT = "DRAFT"  # Invoice created, not yet submitted
    EDITING = "EDITING"  # Buyer/SME requested changes

    # Approval flow
    SUBMITTED = "SUBMITTED"  # Submitted to admin for approval
    APPROVED = "APPROVED"  # Approved by admin, ready for financing

    # Rejection states
    REJECTED = "REJECTED"  # Rejected by buyer or admin

    # Dispute states
    DISPUTED = "DISPUTED"  # Dispute created by buyer

    # Financing flow
    FINANCING = "FINANCING"  # Bank is processing financing
    FINANCED = "FINANCED"  # Financing completed, both parties confirmed

    # Payment flow
    SETTLED = "SETTLED"  # Buyer marked as paid
    CLOSED = "CLOSED"  # Bank confirmed payment, workflow complete


class OrganizationStatus(str, Enum):
    """Organization/KYC status constants"""

    PENDING = "PENDING"  # KYC submitted, waiting for review
    UNDER_REVIEW = "UNDER_REVIEW"  # Admin is reviewing
    APPROVED = "APPROVED"  # KYC verified and approved
    REJECTED = "REJECTED"  # KYC rejected


class BankRequestStatus(str, Enum):
    """Bank request status constants"""

    PENDING = "PENDING"  # Request sent to bank, waiting response
    FINANCING = "FINANCING"  # Bank accepted, processing transfer
    FINANCED = "FINANCED"  # Funds transferred
    REJECTED = "REJECTED"  # Bank declined


class UserRole(str, Enum):
    """User role constants"""

    ADMIN = "ADMIN"
    BANK = "BANK"
    SME = "SME"
    BUYER = "BUYER"


# Status flow definitions
INVOICE_STATUS_FLOW = {
    InvoiceStatus.DRAFT: [InvoiceStatus.EDITING, InvoiceStatus.SUBMITTED, InvoiceStatus.REJECTED],
    InvoiceStatus.EDITING: [InvoiceStatus.DRAFT, InvoiceStatus.REJECTED],
    InvoiceStatus.SUBMITTED: [InvoiceStatus.APPROVED, InvoiceStatus.REJECTED, InvoiceStatus.DISPUTED],
    InvoiceStatus.APPROVED: [InvoiceStatus.FINANCING, InvoiceStatus.DISPUTED],
    InvoiceStatus.FINANCING: [InvoiceStatus.FINANCED],
    InvoiceStatus.FINANCED: [InvoiceStatus.SETTLED, InvoiceStatus.DISPUTED],
    InvoiceStatus.SETTLED: [InvoiceStatus.CLOSED],
    InvoiceStatus.CLOSED: [],  # Terminal state
    InvoiceStatus.REJECTED: [],  # Terminal state (unless resubmitted)
    InvoiceStatus.DISPUTED: [InvoiceStatus.APPROVED, InvoiceStatus.FINANCED, InvoiceStatus.REJECTED],
}


# Status groups for filtering
INVOICE_STATUS_ACTIVE: List[str] = [
    InvoiceStatus.DRAFT,
    InvoiceStatus.EDITING,
    InvoiceStatus.SUBMITTED,
    InvoiceStatus.APPROVED,
    InvoiceStatus.FINANCING,
]

INVOICE_STATUS_COMPLETED: List[str] = [
    InvoiceStatus.FINANCED,
    InvoiceStatus.SETTLED,
    InvoiceStatus.CLOSED,
]

INVOICE_STATUS_TERMINAL: List[str] = [
    InvoiceStatus.CLOSED,
    InvoiceStatus.REJECTED,
]

INVOICE_STATUS_PENDING_ACTION: List[str] = [
    InvoiceStatus.EDITING,  # Waiting for SME/Buyer to resubmit
    InvoiceStatus.SUBMITTED,  # Waiting for admin approval
    InvoiceStatus.APPROVED,  # Waiting for financing request
    InvoiceStatus.FINANCING,  # Waiting for confirmations
    InvoiceStatus.SETTLED,  # Waiting for bank confirmation
]


# Helper functions
def is_valid_status_transition(current_status: str, new_status: str) -> bool:
    """
    Check if a status transition is valid.

    Args:
        current_status: Current invoice status
        new_status: Desired new status

    Returns:
        True if transition is valid, False otherwise
    """
    allowed_transitions = INVOICE_STATUS_FLOW.get(current_status, [])
    return new_status in allowed_transitions


def get_status_description(status: str) -> str:
    """
    Get human-readable description for a status.

    Args:
        status: Invoice status

    Returns:
        Status description
    """
    descriptions = {
        InvoiceStatus.DRAFT: "Draft - Invoice created but not submitted",
        InvoiceStatus.EDITING: "Editing - Changes requested by buyer or seller",
        InvoiceStatus.SUBMITTED: "Submitted - Pending admin approval",
        InvoiceStatus.APPROVED: "Approved - Ready for financing",
        InvoiceStatus.REJECTED: "Rejected - Invoice was rejected",
        InvoiceStatus.DISPUTED: "Disputed - Buyer has raised a dispute",
        InvoiceStatus.FINANCING: "Financing - Bank is processing payment",
        InvoiceStatus.FINANCED: "Financed - Payment completed",
        InvoiceStatus.SETTLED: "Settled - Buyer marked as paid",
        InvoiceStatus.CLOSED: "Closed - Payment confirmed by bank",
    }

    return descriptions.get(status, "Unknown status")


def can_edit_invoice(status: str) -> bool:
    """
    Check if invoice can be edited in current status.

    Args:
        status: Current invoice status

    Returns:
        True if invoice can be edited
    """
    return status in [InvoiceStatus.DRAFT, InvoiceStatus.EDITING]


def can_request_financing(status: str) -> bool:
    """
    Check if financing can be requested for invoice.

    Args:
        status: Current invoice status

    Returns:
        True if financing can be requested
    """
    return status == InvoiceStatus.APPROVED


def can_dispute(status: str) -> bool:
    """
    Check if invoice can be disputed.

    Args:
        status: Current invoice status

    Returns:
        True if invoice can be disputed
    """
    return status in [InvoiceStatus.APPROVED, InvoiceStatus.FINANCED]


# Export all constants
__all__ = [
    "InvoiceStatus",
    "OrganizationStatus",
    "BankRequestStatus",
    "UserRole",
    "INVOICE_STATUS_FLOW",
    "INVOICE_STATUS_ACTIVE",
    "INVOICE_STATUS_COMPLETED",
    "INVOICE_STATUS_TERMINAL",
    "INVOICE_STATUS_PENDING_ACTION",
    "is_valid_status_transition",
    "get_status_description",
    "can_edit_invoice",
    "can_request_financing",
    "can_dispute",
]
