# Bank Financing API - Postman Collection

## Prerequisites
- Server running on http://localhost:8000
- You have valid tokens for SME and BANK users
- At least one invoice in APPROVED status

## 1. SME: Send Financing Request to Banks

```bash
POST http://localhost:8000/api/bank/requests
Headers:
  Authorization: Bearer {SME_TOKEN}
  Content-Type: application/json

Body:
{
  "invoice_id": 1,
  "bank_ids": [5, 6, 7]
}

Response:
[
  {
    "id": 1,
    "invoice_id": 1,
    "bank_id": 5,
    "sme_id": 2,
    "status": "PENDING",
    "requested_at": "2026-01-10T10:00:00"
  },
  ...
]
```

## 2. SME: View My Requests

```bash
GET http://localhost:8000/api/bank/my-requests
Headers:
  Authorization: Bearer {SME_TOKEN}

Response:
[
  {
    "id": 1,
    "invoice_id": 1,
    "bank_id": 5,
    "status": "PENDING",
    ...
  }
]
```

## 3. BANK: View All Invoices (with permission check)

```bash
GET http://localhost:8000/api/bank/invoices
Headers:
  Authorization: Bearer {BANK_TOKEN}

Response:
[
  {
    "id": 1,
    "invoice_number": "INV-001",
    "amount": 1000000000,
    "status": "APPROVED",
    "has_request": true,
    "request_id": 1,
    "request_status": "PENDING",
    // Full invoice details because bank received request
    "buyer_name": "ABC Corp",
    "payment_term": 30,
    "proposed_ltv": 80,
    ...
  },
  {
    "id": 2,
    "invoice_number": "INV-002",
    "amount": 500000000,
    "status": "APPROVED",
    "has_request": false,
    // Only basic info - no request sent to this bank
  }
]
```

## 4a. BANK: Accept and Start Financing

```bash
POST http://localhost:8000/api/bank/requests/{request_id}/finance
Headers:
  Authorization: Bearer {BANK_TOKEN}
  Content-Type: application/json

Body:
{
  "finance_amount": 950000000,
  "interest_rate": 12.5,
  "notes": "Approved with 12.5% annual interest rate"
}

Response:
{
  "message": "Financing started",
  "request": {
    "id": 1,
    "status": "FINANCING",
    "finance_amount": 950000000,
    "interest_rate": 12.5,
    ...
  }
}

// Invoice status changes: APPROVED → FINANCING
```

## 4b. BANK: Reject Request

```bash
POST http://localhost:8000/api/bank/requests/{request_id}/reject?rejection_reason=High%20risk%20profile
Headers:
  Authorization: Bearer {BANK_TOKEN}

Response:
{
  "message": "Request rejected",
  "request": {
    "id": 1,
    "status": "REJECTED",
    "rejection_reason": "High risk profile",
    ...
  }
}

// Invoice status remains: APPROVED (SME can send to other banks)
```

## 5. BANK: Mark as Financed (Bank transferred money)

```bash
POST http://localhost:8000/api/bank/requests/{request_id}/financed
Headers:
  Authorization: Bearer {BANK_TOKEN}

Response:
{
  "message": "Bank confirmed financed",
  "status": "FINANCING"  // or "FINANCED" if SME already confirmed
}

// Sets invoice.bank_confirmed_financed = True
// If SME also confirmed → status becomes FINANCED
```

## 6. SME: Confirm Receipt of Money

```bash
POST http://localhost:8000/api/bank/invoices/{invoice_id}/confirm-receipt
Headers:
  Authorization: Bearer {SME_TOKEN}

Response:
{
  "message": "Receipt confirmed",
  "status": "FINANCING"  // or "FINANCED" if Bank already confirmed
}

// Sets invoice.sme_confirmed_receipt = True
// If Bank also confirmed → status becomes FINANCED
```

## 7. Verify Final Status

```bash
GET http://localhost:8000/api/invoices/{invoice_id}
Headers:
  Authorization: Bearer {SME_TOKEN or BANK_TOKEN}

Response:
{
  "id": 1,
  "status": "FINANCED",
  "bank_confirmed_financed": true,
  "sme_confirmed_receipt": true,
  "bank_financed_at": "2026-01-10T11:00:00",
  "sme_confirmed_at": "2026-01-10T11:05:00",
  ...
}
```

## Status Flow

```
APPROVED (Admin approved)
   ↓ (SME sends request to banks)
APPROVED (Banks see it, can accept/reject)
   ↓ (Bank accepts and finances)
FINANCING (Bank financing invoice)
   ↓ (Both Bank financed AND SME confirmed receipt)
FINANCED (Complete!)
```

## Edge Cases

### Bank Rejection
- Bank rejects → Invoice stays APPROVED
- SME can send request to different banks
- SME gets notification (TODO: implement notification)

### Multiple Banks
- SME can send to multiple banks simultaneously
- Only one bank can finance an invoice
- First bank to accept "locks" the invoice

### Confirmation Required from BOTH Parties
- Status only changes to FINANCED when:
  1. Bank marks as financed (transferred money)
  2. SME confirms receipt (received money)
- Order doesn't matter - both must confirm

## Testing Sequence

1. Create invoice as SME → status: DRAFT
2. Buyer accepts → status: SUBMITTED  
3. Admin approves → status: APPROVED
4. SME sends request to Bank A, B, C
5. Bank A views invoices → sees full details
6. Bank D views invoices → sees only basic info
7. Bank B rejects → invoice still APPROVED
8. Bank A finances → status: FINANCING
9. Bank A marks financed
10. SME confirms receipt → status: FINANCED ✓
