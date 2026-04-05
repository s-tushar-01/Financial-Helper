"""
Transaction model.
"""
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Text,
    CheckConstraint,
    Boolean,
)
from sqlalchemy.orm import relationship

from app.db import Base


class Transaction(Base):
    """Transaction model for income/expense records."""

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(Enum("income", "expense", name="transaction_type_enum"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    status = Column(Enum("pending", "completed", name="transaction_status_enum"), nullable=False, default="completed")
    is_recurring = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

    # Indexes for performance
    __table_args__ = (
        Index("ix_transaction_user_id", "user_id"),
        Index("ix_transaction_date", "date"),
        Index("ix_transaction_notes", "notes"),
        CheckConstraint('amount > 0', name='ck_transaction_amount_positive'),
    )
