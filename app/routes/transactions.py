from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..core.auth import get_current_user, require_roles
from ..db import get_db
from ..models import User
from ..schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse, TransactionPaginatedResponse
from ..services.transaction_service import (
    create_transaction as create_transaction_service,
    get_transaction as get_transaction_service,
    get_transactions as get_transactions_service,
    update_transaction as update_transaction_service,
    delete_transaction as delete_transaction_service,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
):
    """Create a new transaction. Only admin can create."""
    db_transaction = create_transaction_service(db, transaction.model_dump(), current_user.id)
    if db_transaction is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category or category does not belong to user"
        )
    return db_transaction

@router.get("/", response_model=TransactionPaginatedResponse)
def list_transactions(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    category: str | None = Query(None),
    type: str | None = Query(None, pattern="^(income|expense)$"),
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(8, ge=1, le=8),
    min_amount: float | None = Query(None, ge=0),
    max_amount: float | None = Query(None, ge=0),
    month: int | None = Query(None, ge=1, le=12),
    year: int | None = Query(None, ge=1900, le=2100),
    range: str | None = Query(None, pattern="^(today|this_week|last_month)$"),
    high_expense: bool | None = Query(None),
    is_recurring: bool | None = Query(None),
    status: str | None = Query(None, pattern="^(pending|completed)$"),
    sort_by: str | None = Query(None),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List transactions for the current user with optional filters."""
    transactions, total = get_transactions_service(
        db,
        current_user.id,
        start_date=start_date,
        end_date=end_date,
        category=category,
        type_=type,
        search=search,
        skip=skip,
        limit=limit,
        min_amount=min_amount,
        max_amount=max_amount,
        month=month,
        year=year,
        range_=range,
        high_expense=high_expense,
        is_recurring=is_recurring,
        status=status,
        sort_by=sort_by,
        order=order,
    )
    page = (skip // limit) + 1
    total_pages = (total + limit - 1) // limit
    return {
        "items": transactions,
        "total": total,
        "page": page,
        "per_page": limit,
        "total_pages": total_pages,
    }

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific transaction by ID."""
    transaction = get_transaction_service(db, transaction_id, current_user.id)
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
):
    """Update a transaction. Only admin can update."""
    transaction = update_transaction_service(db, transaction_id, transaction_update.model_dump(exclude_unset=True), current_user.id)
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
):
    """Delete a transaction. Only admin can delete."""
    success = delete_transaction_service(db, transaction_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")