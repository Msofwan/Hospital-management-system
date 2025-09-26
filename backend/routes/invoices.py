from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models
from ..database import get_db
from ..schemas.invoice import Invoice, InvoiceCreate, InvoiceUpdate
from ..auth import get_current_user, has_permission

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[Invoice], dependencies=[Depends(has_permission("read_invoices"))])
def get_all_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all invoices.
    """
    invoices = crud.get_invoices(db, skip=skip, limit=limit)
    return invoices

@router.post("/", response_model=Invoice, dependencies=[Depends(has_permission("create_invoice"))])
def create_new_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    """
    Create a new invoice.
    """
    return crud.create_invoice(db=db, invoice=invoice)

@router.put("/{invoice_id}/status", response_model=Invoice, dependencies=[Depends(has_permission("update_invoice"))])
def update_invoice_status_by_id(invoice_id: int, invoice_update: InvoiceUpdate, db: Session = Depends(get_db)):
    """
    Update an invoice's status.
    """
    db_invoice = crud.update_invoice_status(db, invoice_id=invoice_id, status=invoice_update.status)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice
