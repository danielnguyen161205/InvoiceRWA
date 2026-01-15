# Dispute Resolution Workflow - Increased Invoice Amount

## Overview
This document explains the dispute resolution workflow for invoices that are already FINANCED but have their amount increased due to disputes.

## Use Case
**Scenario**: A buyer disputes an invoice that has already been financed by the bank because the actual invoice amount should be higher than what was originally agreed upon.

## Workflow

### Step 1: Invoice is FINANCED
- Status: `FINANCED`
- Bank has already disbursed funds to SME
- Original amount: e.g., 100,000,000 VND

### Step 2: Buyer Raises Dispute
- Buyer discovers the actual invoice amount should be higher (e.g., 120,000,000 VND)
- Buyer clicks "Dispute" button
- Status changes: `FINANCED` → `DISPUTED`
- System records:
  - `dispute_type`: `POST_FINANCE`
  - `dispute_case_id`: Unique case identifier
  - `disputed_at`: Timestamp
  - `disputed_by`: Buyer user ID
  - `dispute_description`: Reason for dispute

### Step 3: Bank Admin Reviews Dispute
Bank admin opens the Dispute Resolution Modal and sees:
- Original financed amount: 100,000,000 VND
- New disputed amount: 120,000,000 VND
- Additional financing needed: 20,000,000 VND
- Dispute description and evidence

### Step 4: Bank Makes Decision

#### Option A: ACCEPT Increased Amount ✅
**What happens:**
1. Bank accepts to finance the additional amount
2. Status changes: `DISPUTED` → `FINANCING`
3. System records:
   - `previous_amount`: 100,000,000 VND
   - `increased_amount`: 120,000,000 VND
   - `additional_financing_amount`: 20,000,000 VND
   - `dispute_resolved`: `true`
   - `dispute_resolution_action`: `ACCEPT_INCREASED`
4. Invoice `amount` is updated to 120,000,000 VND
5. Bank must disburse additional 20,000,000 VND to SME
6. After disbursement confirmed, status returns to `FINANCED`
7. Normal workflow continues (Buyer pays, Bank confirms, etc.)

**API Endpoint:**
```
POST /api/invoices/{invoice_id}/dispute/resolve
{
  "action": "ACCEPT_INCREASED",
  "new_amount": 120000000,
  "comments": "Bank accepts increased amount based on verified documentation"
}
```

#### Option B: REJECT Increased Amount ❌
**What happens:**
1. Bank rejects the increased amount
2. Status changes: `DISPUTED` → `SUBMITTED`
3. System records:
   - `dispute_resolved`: `true`
   - `dispute_resolution_action`: `REJECT_INCREASED`
4. SME and Buyer must create a NEW invoice
5. New invoice should have:
   - `linked_invoice_id`: Points to the original disputed invoice
   - Correct amount from the beginning
6. New invoice goes through normal approval workflow
7. Original invoice remains in `SUBMITTED` state as historical record

**API Endpoint:**
```
POST /api/invoices/{invoice_id}/dispute/resolve
{
  "action": "REJECT_INCREASED",
  "comments": "Bank requires resubmission with proper documentation"
}
```

## UI Components

### Admin Dashboard - Invoice Table
- Shows disputed invoices with special badge: 💰 Post-Finance
- Displays original vs new amount comparison
- "Resolve Dispute" button (animated pulse effect)

### Dispute Resolution Modal
Shows:
- Case ID and dispute type
- Invoice information
- Amount comparison:
  - Previous financed amount
  - New disputed amount
  - Additional financing needed (highlighted in red)
- Dispute description
- Two action buttons:
  - ✅ Accept Increased Amount & Continue Financing (green)
  - ❌ Reject - Request Resubmission (red)
- Bank decision comments textarea

## Database Schema Changes

### New Fields in `invoices` Table:
```sql
-- Dispute resolution tracking
dispute_resolution_action VARCHAR(50)  -- 'ACCEPT_INCREASED' or 'REJECT_INCREASED'

-- Amount tracking for disputes
previous_amount FLOAT                   -- Original financed amount
increased_amount FLOAT                  -- New disputed amount (higher)
additional_financing_amount FLOAT       -- Difference to be paid

-- Link to resubmitted invoice
linked_invoice_id INTEGER               -- References invoices.id
```

## Status Flow Diagram

```
FINANCED (100M VND)
    ↓
[Buyer raises dispute - amount should be 120M]
    ↓
DISPUTED (POST_FINANCE)
    ↓
    ├─→ Bank ACCEPTS
    │       ↓
    │   FINANCING (120M VND)
    │       ↓
    │   [Bank disburses additional 20M]
    │       ↓
    │   FINANCED (120M VND)
    │       ↓
    │   [Continue normal workflow]
    │
    └─→ Bank REJECTS
            ↓
        SUBMITTED
            ↓
        [SME/Buyer create new invoice]
            ↓
        [Link new invoice to old one]
            ↓
        [New invoice goes through normal approval]
```

## Key Points

1. **Only POST_FINANCE disputes** (invoices already FINANCED) use this workflow
2. **Bank has full control** over accepting or rejecting increased amounts
3. **Additional financing** is automatically calculated
4. **Audit trail** is maintained with comments and timestamps
5. **Linked invoices** allow tracking of resubmissions
6. **UI indicators** clearly show disputed status and amounts

## Testing Scenarios

### Test Case 1: Accept Increased Amount
1. Create invoice with 100M VND
2. Get it FINANCED by bank
3. Buyer disputes with new amount 120M VND
4. Bank admin accepts
5. Verify status changes to FINANCING
6. Verify additional_financing_amount = 20M VND
7. Bank confirms disbursement
8. Verify status returns to FINANCED with new amount

### Test Case 2: Reject Increased Amount
1. Create invoice with 100M VND
2. Get it FINANCED by bank
3. Buyer disputes with new amount 120M VND
4. Bank admin rejects
5. Verify status changes to SUBMITTED
6. Create new invoice with correct amount
7. Set linked_invoice_id to original invoice
8. Go through normal approval workflow

## Future Enhancements
- Email/SMS notifications to all parties
- Document upload for dispute evidence
- Multiple dispute rounds tracking
- Automatic interest calculation on additional amounts
- Integration with accounting systems
