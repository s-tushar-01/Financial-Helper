from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from .enums import RoleEnum

class UserBase(BaseModel):
    email: EmailStr
    username: str
    role: RoleEnum = RoleEnum.viewer

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = None
    role: RoleEnum | None = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
