# Bank Financing - Quick Reference

## Key Concepts

🏦 **Bank Dashboard Access**
- ✅ Has Request → Full Invoice Info + Actions (Finance/Reject)
- ⚠️ No Request → Basic Info Only (view only)

## Status Flow

```
APPROVED ──(SME sends)──> PENDING REQUEST
    │
    ├──(Bank Reject)──> APPROVED (can resend to other banks)
    │
    └──(Bank Finance)──> FINANCING
                            │
                            └──(Both Confirm)──> FINANCED
```

## 2-Way Confirmation

Status only changes to **FINANCED** when **BOTH** confirm:
1. ✅ Bank: "I transferred the money"
2. ✅ SME: "I received the money"

Order doesn't matter - both required!

## Quick Commands

```bash
# Run migration
cd Backend
python -m alembic upgrade head

# Test import
python -c "from app.api import bank; print('OK')"

# Start server
cd Backend
uvicorn app.main:app --reload
```

## API Cheat Sheet

| Who | Action | Endpoint | Method |
|-----|--------|----------|--------|
| SME | Send request | `/api/bank/requests` | POST |
| SME | View my requests | `/api/bank/my-requests` | GET |
| SME | Confirm receipt | `/api/bank/invoices/{id}/confirm-receipt` | POST |
| Bank | View invoices | `/api/bank/invoices` | GET |
| Bank | Finance | `/api/bank/requests/{id}/finance` | POST |
| Bank | Reject | `/api/bank/requests/{id}/reject` | POST |
| Bank | Mark financed | `/api/bank/requests/{id}/financed` | POST |

## Files Created

📄 Models: `app/models/bank_request.py`
📄 Schemas: `app/schemas/bank_request.py`
📄 API: `app/api/bank.py`
📄 Migration: `alembic/versions/20260110_add_bank_requests.py`

## Files Modified

📝 `app/models/invoice.py` - Added FINANCING, FINANCED statuses
📝 `app/main.py` - Registered bank router
📝 `alembic/env.py` - Imported BankRequest model

## Common Scenarios

### Scenario 1: Bank Rejects
- Bank rejects request
- Invoice status: APPROVED (unchanged)
- SME can send to another bank ✅

### Scenario 2: Multiple Banks
- SME sends to Bank A, B, C
- Bank A finances → locks invoice
- Bank B, C can no longer finance this invoice

### Scenario 3: Partial Confirmation
- Bank marks "financed" but SME hasn't confirmed yet
- Status: FINANCING (waiting for SME)
- Once SME confirms → FINANCED ✅

## Documentation

📖 Full Flow: `README_BANK_FINANCING.md`
📖 API Testing: `README_BANK_API_TESTING.md`
📖 Summary: `SUMMARY_BANK_FINANCING_CHANGES.md`
