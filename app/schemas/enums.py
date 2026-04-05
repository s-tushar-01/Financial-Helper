from enum import Enum

class RoleEnum(str, Enum):
    viewer = "viewer"
    analyst = "analyst"
    admin = "admin"

class TransactionTypeEnum(str, Enum):
    income = "income"
    expense = "expense"


class TransactionStatusEnum(str, Enum):
    pending = "pending"
    completed = "completed"
