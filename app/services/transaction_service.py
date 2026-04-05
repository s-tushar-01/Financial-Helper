"""
Transaction business logic.
"""
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, extract
from ..models import Transaction, Category


def create_transaction(db: Session, transaction_data: dict, user_id: int):
    """Create a new transaction for a user."""
    # Verify category exists and belongs to the user
    category = db.query(Category).filter(
        Category.id == transaction_data["category_id"],
        Category.user_id == user_id
    ).first()
    if not category:
        return None

    db_transaction = Transaction(**transaction_data, user_id=user_id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_transaction(db: Session, transaction_id: int, user_id: int):
    """Get a transaction by ID for a specific user."""
    return db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id
    ).first()


def get_transactions(
    db: Session,
    user_id: int,
    start_date: datetime = None,
    end_date: datetime = None,
    category: str = None,
    type_: str = None,
    search: str = None,
    skip: int = 0,
    limit: int = 100,
    min_amount: float = None,
    max_amount: float = None,
    sort_by: str = None,
    order: str = "asc",
    month: int = None,
    year: int = None,
    range_: str = None,
    high_expense: bool = None,
    is_recurring: bool = None,
    status: str = None,
):
    """Get transactions for a user with optional filters. Returns (items, total)."""
    query = db.query(Transaction)

    # Date filters
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    # Predefined time ranges (overrides start/end if provided)
    if range_ and not start_date and not end_date:
        today = date.today()
        if range_ == "today":
            start = datetime.combine(today, datetime.min.time())
            end = datetime.combine(today, datetime.max.time())
            query = query.filter(Transaction.date >= start, Transaction.date <= end)
        elif range_ == "this_week":
            # Week starts on Monday
            start = today - timedelta(days=today.weekday())
            start = datetime.combine(start, datetime.min.time())
            end = start + timedelta(days=6)
            end = datetime.combine(end, datetime.max.time())
            query = query.filter(Transaction.date >= start, Transaction.date <= end)
        elif range_ == "last_month":
            first_day_of_current_month = today.replace(day=1)
            last_day_of_last_month = first_day_of_current_month - timedelta(days=1)
            start = last_day_of_last_month.replace(day=1)
            start = datetime.combine(start, datetime.min.time())
            end = datetime.combine(last_day_of_last_month, datetime.max.time())
            query = query.filter(Transaction.date >= start, Transaction.date <= end)

    # Month and Year filter
    if month is not None:
        query = query.filter(extract('month', Transaction.date) == month)
    if year is not None:
        query = query.filter(extract('year', Transaction.date) == year)

    # Amount range
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    # Type filter
    if type_:
        query = query.filter(Transaction.type == type_)

    # Category filter
    if category:
        query = query.join(Transaction.category).filter(Category.name == category)

    # Search
    if search:
        search_lower = search.lower()
        if not category:
            query = query.join(Transaction.category)
        query = query.filter(
            or_(
                func.lower(Transaction.notes).like(f"%{search_lower}%"),
                func.lower(Category.name).like(f"%{search_lower}%")
            )
        )

    # Advanced filters
    if is_recurring is not None:
        query = query.filter(Transaction.is_recurring == is_recurring)
    if status:
        query = query.filter(Transaction.status == status)

    # High expense filter: expenses above user's average
    if high_expense and type_ in [None, "expense"]:
        # Compute average expense for this user
        avg_subq = db.query(func.avg(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense"
        ).scalar_subquery()
        query = query.filter(Transaction.amount > avg_subq)

    # Sorting
    allowed_sort_fields = {"amount", "date", "created_at"}
    if sort_by and sort_by in allowed_sort_fields:
        sort_column = getattr(Transaction, sort_by)
        if order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    else:
        # Default: newest first
        query = query.order_by(Transaction.date.desc())

    # Get total count before pagination
    total = query.count()

    # Apply pagination
    query = query.offset(skip).limit(limit)
    items = query.all()
    return items, total


def update_transaction(db: Session, transaction_id: int, transaction_update: dict, user_id: int):
    """Update a transaction."""
    db_transaction = get_transaction(db, transaction_id, user_id)
    if db_transaction is None:
        return None
    for field, value in transaction_update.items():
        setattr(db_transaction, field, value)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int, user_id: int):
    """Delete a transaction."""
    db_transaction = get_transaction(db, transaction_id, user_id)
    if not db_transaction:
        return False
    db.delete(db_transaction)
    db.commit()
    return True
