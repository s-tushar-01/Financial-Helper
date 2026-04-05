from app.db import get_db
from sqlalchemy import inspect

db = next(get_db())
inspector = inspect(db.bind)
columns = inspector.get_columns('users')
print("Existing 'users' table columns:")
for col in columns:
    print(f"  - {col['name']}: {col['type']}")
db.close()
