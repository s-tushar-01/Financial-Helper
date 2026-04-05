from datetime import datetime
from pydantic import BaseModel, Field

from .enums import TransactionTypeEnum, TransactionStatusEnum

class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0)
    type: TransactionTypeEnum
    category_id: int
    date: datetime
    notes: str | None = Field(None, max_length=500)
    status: TransactionStatusEnum = Field(default="completed")
    is_recurring: bool = False

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: float | None = Field(None, gt=0)
    type: TransactionTypeEnum | None = None
    category_id: int | None = None
    date: datetime | None = None
    notes: str | None = Field(None, max_length=500)
    status: TransactionStatusEnum | None = None
    is_recurring: bool | None = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionPaginatedResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
