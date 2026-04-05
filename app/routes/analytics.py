from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..core.auth import require_roles
from ..db import get_db
from ..models import User
from ..schemas.transaction import TransactionResponse
from ..services.analytics_service import get_summary

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
def get_analytics_summary(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["analyst", "admin"])),
):
    """
    Get analytics summary for the whole system (admin/analyst only).
    """
    summary = get_summary(db, start_date=start_date, end_date=end_date)

    # Convert recent_activity ORM objects to dict using Pydantic v2
    recent = summary["recent_activity"]
    summary["recent_activity"] = [TransactionResponse.model_validate(t).model_dump() for t in recent]

    return summary