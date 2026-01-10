"""
Invoice Status Constants for InvoiceRWA Platform

This module provides standardized status constants and transitions
for invoice workflow management. Ensures consistency between
frontend and backend status handling.

Status Flow:
DRAFT -> EDITING -> DRAFT -> SUBMITTED -> APPROVED -> FINANCING -> FINANCED -> SETTLED -> CLOSED
                     |                                                    |
                     v                                                    v
                   REJECTED                                           DISPUTED
"""

from enum import Enum
from typing import List, Dict, Set


class InvoiceStatus(str, Enum):
    """
    Invoice status constants following business workflow

    Workflow:
    1. DRAFT - Initial creation, editable by SME
    2. EDITING - Buyer requested changes, editable by both
    3. SUBMITTED - Buyer accepted, pending admin approval
    4. APPROVED - Admin approved, ready for financing
    5. REJECTED - Admin or buyer rejected
    6. DISPUTED - Buyer raised dispute (pre or post financing)
    7. FINANCING - Bank processing financing
    8. FINANCED - Financing completed
    9. SETTLED - Buyer paid the invoice
    10. CLOSED - Bank confirmed payment, workflow complete
    """

    # Initial states
    DRAFT = "DRAFT"
    EDITING = "EDITING"

    # Approval states
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

    # Dispute state
    DISPUTED = "DISPUTED"

    # Financing states
    FINANCING = "FINANCING"
    FINANCED = "FINANCED"

    # Payment states
    SETTLED = "SETTLED"
    CLOSED = "CLOSED"


class InvoiceStatusTransition:
    """
    Defines valid status transitions and who can initiate them

    Format: {current_status: [(next_status, roles_who_can_transition)]}
    """

    TRANSITIONS: Dict[InvoiceStatus, List[tuple]] = {
        InvoiceStatus.DRAFT: [
            (InvoiceStatus.EDITING, ["BUYER", "SME"]),
            (InvoiceStatus.SUBMITTED, ["BUYER", "SME"]),
            (InvoiceStatus.REJECTED, ["BUYER"]),
        ],
        InvoiceStatus.EDITING: [
            (InvoiceStatus.DRAFT, ["SME"]),
            (InvoiceStatus.SUBMITTED, ["BUYER"]),
            (InvoiceStatus.REJECTED, ["BUYER"]),
        ],
        InvoiceStatus.SUBMITTED: [
            (InvoiceStatus.APPROVED, ["ADMIN", "BANK"]),
            (InvoiceStatus.REJECTED, ["ADMIN", "BANK"]),
            (InvoiceStatus.EDITING, ["ADMIN"]),
        ],
        InvoiceStatus.APPROVED: [
            (InvoiceStatus.FINANCING, ["BANK"]),
            (InvoiceStatus.REJECTED, ["ADMIN", "BUYER"]),
            (InvoiceStatus.DISPUTED, ["BUYER"]),
        ],
        InvoiceStatus.REJECTED: [
            (InvoiceStatus.DRAFT, ["SME"]),
        ],
        InvoiceStatus.DISPUTED: [
            (InvoiceStatus.APPROVED, ["ADMIN"]),
            (InvoiceStatus.REJECTED, ["ADMIN"]),
            (InvoiceStatus.FINANCED, ["ADMIN", "BANK"]),
        ],
        InvoiceStatus.FINANCING: [
            (InvoiceStatus.FINANCED, ["BANK", "SME"]),
            (InvoiceStatus.APPROVED, ["BANK"]),  # Bank cancelled
        ],
        InvoiceStatus.FINANCED: [
            (InvoiceStatus.SETTLED, ["BUYER"]),
            (InvoiceStatus.DISPUTED, ["BUYER"]),
        ],
        InvoiceStatus.SETTLED: [
            (InvoiceStatus.CLOSED, ["BANK"]),
        ],
        InvoiceStatus.CLOSED: [
            # Terminal state - no transitions
        ],
    }

    @classmethod
    def can_transition(
        cls,
        from_status: InvoiceStatus,
        to_status: InvoiceStatus,
        user_roles: List[str]
    ) -> bool:
        """
        Check if a status transition is valid for given user roles

        Args:
            from_status: Current invoice status
            to_status: Desired status
            user_roles: List of user roles

        Returns:
            True if transition is allowed, False otherwise
        """
        if from_status not in cls.TRANSITIONS:
            return False

        allowed_transitions = cls.TRANSITIONS[from_status]

        for allowed_status, allowed_roles in allowed_transitions:
            if allowed_status == to_status:
                # Check if user has any of the required roles
                return any(role in allowed_roles for role in user_roles)

        return False

    @classmethod
    def get_valid_next_statuses(
        cls,
        current_status: InvoiceStatus,
        user_roles: List[str]
    ) -> List[InvoiceStatus]:
        """
        Get list of valid next statuses for a user based on current status

        Args:
            current_status: Current invoice status
            user_roles: List of user roles

        Returns:
            List of valid next statuses
        """
        if current_status not in cls.TRANSITIONS:
            return []

        valid_statuses = []

        for allowed_status, allowed_roles in cls.TRANSITIONS[current_status]:
            if any(role in allowed_roles for role in user_roles):
                valid_statuses.append(allowed_status)

        return valid_statuses


class InvoiceStatusDisplay:
    """
    Human-readable display names and descriptions for statuses
    """

    DISPLAY_NAMES: Dict[InvoiceStatus, str] = {
        InvoiceStatus.DRAFT: "Draft",
        InvoiceStatus.EDITING: "Pending Changes",
        InvoiceStatus.SUBMITTED: "Pending Approval",
        InvoiceStatus.APPROVED: "Approved",
        InvoiceStatus.REJECTED: "Rejected",
        InvoiceStatus.DISPUTED: "Disputed",
        InvoiceStatus.FINANCING: "Financing in Progress",
        InvoiceStatus.FINANCED: "Financed",
        InvoiceStatus.SETTLED: "Paid",
        InvoiceStatus.CLOSED: "Closed",
    }

    DESCRIPTIONS: Dict[InvoiceStatus, str] = {
        InvoiceStatus.DRAFT: "Invoice is being created and can be edited",
        InvoiceStatus.EDITING: "Buyer has requested changes to the invoice",
        InvoiceStatus.SUBMITTED: "Invoice is pending admin approval",
        InvoiceStatus.APPROVED: "Invoice approved and ready for financing",
        InvoiceStatus.REJECTED: "Invoice has been rejected",
        InvoiceStatus.DISPUTED: "A dispute has been raised for this invoice",
        InvoiceStatus.FINANCING: "Bank is processing the financing request",
        InvoiceStatus.FINANCED: "Financing has been completed",
        InvoiceStatus.SETTLED: "Buyer has paid the invoice amount",
        InvoiceStatus.CLOSED: "Invoice workflow is complete",
    }

    # CSS classes for frontend styling
    CSS_CLASSES: Dict[InvoiceStatus, str] = {
        InvoiceStatus.DRAFT: "status-draft",
        InvoiceStatus.EDITING: "status-editing",
        InvoiceStatus.SUBMITTED: "status-submitted",
        InvoiceStatus.APPROVED: "status-approved",
        InvoiceStatus.REJECTED: "status-rejected",
        InvoiceStatus.DISPUTED: "status-disputed",
        InvoiceStatus.FINANCING: "status-financing",
        InvoiceStatus.FINANCED: "status-financed",
        InvoiceStatus.SETTLED: "status-settled",
        InvoiceStatus.CLOSED: "status-closed",
    }

    # Bootstrap color classes for frontend
    BOOTSTRAP_COLORS: Dict[InvoiceStatus, str] = {
        InvoiceStatus.DRAFT: "secondary",
        InvoiceStatus.EDITING: "warning",
        InvoiceStatus.SUBMITTED: "info",
        InvoiceStatus.APPROVED: "success",
        InvoiceStatus.REJECTED: "danger",
        InvoiceStatus.DISPUTED: "danger",
        InvoiceStatus.FINANCING: "primary",
        InvoiceStatus.FINANCED: "primary",
        InvoiceStatus.SETTLED: "success",
        InvoiceStatus.CLOSED: "dark",
    }

    @classmethod
    def get_display_name(cls, status: InvoiceStatus) -> str:
        """Get human-readable display name for status"""
        return cls.DISPLAY_NAMES.get(status, status.value)

    @classmethod
    def get_description(cls, status: InvoiceStatus) -> str:
        """Get description for status"""
        return cls.DESCRIPTIONS.get(status, "")

    @classmethod
    def get_css_class(cls, status: InvoiceStatus) -> str:
        """Get CSS class for status"""
        return cls.CSS_CLASSES.get(status, "")

    @classmethod
    def get_bootstrap_color(cls, status: InvoiceStatus) -> str:
        """Get Bootstrap color class for status"""
        return cls.BOOTSTRAP_COLORS.get(status, "secondary")


# Utility functions for common status operations
def is_terminal_status(status: InvoiceStatus) -> bool:
    """Check if status is terminal (no further transitions)"""
    return status in [InvoiceStatus.CLOSED, InvoiceStatus.REJECTED]


def is_editable(status: InvoiceStatus) -> bool:
    """Check if invoice can be edited in this status"""
    return status in [InvoiceStatus.DRAFT, InvoiceStatus.EDITING]


def requires_approval(status: InvoiceStatus) -> bool:
    """Check if invoice is in approval state"""
    return status == InvoiceStatus.SUBMITTED


def can_request_financing(status: InvoiceStatus) -> bool:
    """Check if invoice can be financed"""
    return status == InvoiceStatus.APPROVED


def is_financed(status: InvoiceStatus) -> bool:
    """Check if invoice is financed or beyond"""
    return status in [
        InvoiceStatus.FINANCING,
        InvoiceStatus.FINANCED,
        InvoiceStatus.SETTLED,
        InvoiceStatus.CLOSED
    ]


def get_statuses_for_role(role: str) -> List[InvoiceStatus]:
    """
    Get all statuses that a specific role can encounter

    Args:
        role: User role (SME, BUYER, BANK, ADMIN)

    Returns:
        List of relevant statuses
    """
    role_statuses = {
        "SME": [
            InvoiceStatus.DRAFT,
            InvoiceStatus.EDITING,
            InvoiceStatus.SUBMITTED,
            InvoiceStatus.APPROVED,
            InvoiceStatus.FINANCING,
            InvoiceStatus.FINANCED,
            InvoiceStatus.SETTLED,
            InvoiceStatus.CLOSED,
            InvoiceStatus.REJECTED,
        ],
        "BUYER": [
            InvoiceStatus.DRAFT,
            InvoiceStatus.EDITING,
            InvoiceStatus.SUBMITTED,
            InvoiceStatus.APPROVED,
            InvoiceStatus.FINANCED,
            InvoiceStatus.SETTLED,
            InvoiceStatus.CLOSED,
            InvoiceStatus.DISPUTED,
            InvoiceStatus.REJECTED,
        ],
        "BANK": [
            InvoiceStatus.APPROVED,
            InvoiceStatus.FINANCING,
            InvoiceStatus.FINANCED,
            InvoiceStatus.SETTLED,
            InvoiceStatus.CLOSED,
            InvoiceStatus.DISPUTED,
        ],
        "ADMIN": [
            InvoiceStatus.SUBMITTED,
            InvoiceStatus.APPROVED,
            InvoiceStatus.REJECTED,
            InvoiceStatus.DISPUTED,
            InvoiceStatus.CLOSED,
        ],
    }

    return role_statuses.get(role, list(InvoiceStatus))


# Export key constants
ALL_STATUSES = list(InvoiceStatus)
ACTIVE_STATUSES = [
    InvoiceStatus.DRAFT,
    InvoiceStatus.EDITING,
    InvoiceStatus.SUBMITTED,
    InvoiceStatus.APPROVED,
    InvoiceStatus.FINANCING,
    InvoiceStatus.FINANCED,
    InvoiceStatus.SETTLED,
]
TERMINAL_STATUSES = [InvoiceStatus.CLOSED, InvoiceStatus.REJECTED]
