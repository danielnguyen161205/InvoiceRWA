import uuid
from app.models.invoice import Invoice, InvoiceStatus

def create_invoice(db, sme_id, data):
    invoice = Invoice(
        id=str(uuid.uuid4()),
        sme_id=sme_id,
        buyer_name=data.buyer_name,
        amount=data.amount
    )
    db.add(invoice)
    db.commit()
    return invoice

def submit_invoice(db, invoice):
    invoice.status = InvoiceStatus.SUBMITTED
    db.commit()
    return invoice
