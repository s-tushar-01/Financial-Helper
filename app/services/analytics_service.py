"""
Analytics business logic.
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, extract
from ..models import Transaction, Category
from datetime import datetime


def get_summary(db: Session, user_id: int = None, start_date: datetime | None = None, end_date: datetime | None = None):
    """
    Compute comprehensive analytics summary for a user.
    Optional start_date and end_date filter the date range.
    """
    # Build base filter; user_id is optional for global summaries
    base_filter = []
    if user_id is not None:
        base_filter.append(Transaction.user_id == user_id)
    if start_date:
        base_filter.append(Transaction.date >= start_date)
    if end_date:
        base_filter.append(Transaction.date <= end_date)

    # Total income and expense
    totals = (
        db.query(
            Transaction.type,
            func.sum(Transaction.amount).label("total")
        )
        .filter(*base_filter)
        .group_by(Transaction.type)
        .all()
    )
    total_income = 0.0
    total_expenses = 0.0
    for type_, total in totals:
        if type_ == "income":
            total_income = float(total) if total else 0.0
        elif type_ == "expense":
            total_expenses = float(total) if total else 0.0

    balance = total_income - total_expenses

    # Category-wise breakdown
    category_breakdown = (
        db.query(
            Category.name,
            func.sum(Transaction.amount).label("amount")
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(*base_filter)
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )
    category_breakdown_list = [
        {"category": name, "amount": float(amount) if amount else 0.0}
        for name, amount in category_breakdown
    ]

    # Monthly totals
    monthly_totals_raw = (
        db.query(
            extract('year', Transaction.date).label('year'),
            extract('month', Transaction.date).label('month'),
            Transaction.type,
            func.sum(Transaction.amount).label('total')
        )
        .filter(*base_filter)
        .group_by('year', 'month', Transaction.type)
        .order_by('year', 'month')
        .all()
    )
    monthly_dict = {}
    for year, month, type_, total in monthly_totals_raw:
        month_key = f"{int(year)}-{int(month):02d}"
        if month_key not in monthly_dict:
            monthly_dict[month_key] = {"month": month_key, "income": 0.0, "expense": 0.0}
        monthly_dict[month_key][type_] = float(total) if total else 0.0
    monthly_totals_list = list(monthly_dict.values())

    # Recent activity
    recent_transactions = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(*base_filter)
        .order_by(Transaction.date.desc())
        .limit(10)
        .all()
    )

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance,
        "category_breakdown": category_breakdown_list,
        "monthly_totals": monthly_totals_list,
        "recent_activity": recent_transactions,
    }
