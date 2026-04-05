"""
Category business logic.
"""
from sqlalchemy.orm import Session
from ..models import Category


def get_category(db: Session, category_id: int):
    """Get a category by ID."""
    return db.query(Category).get(category_id)


def get_categories_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get categories for a specific user."""
    return db.query(Category).filter(Category.user_id == user_id).offset(skip).limit(limit).all()


def create_category(db: Session, category_data: dict, user_id: int):
    """Create a new category for a user."""
    db_category = Category(**category_data, user_id=user_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category_update: dict, user_id: int):
    """Update a category."""
    db_category = get_category(db, category_id)
    if db_category is None or db_category.user_id != user_id:
        return None
    for field, value in category_update.items():
        setattr(db_category, field, value)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int, user_id: int):
    """Delete a category."""
    db_category = get_category(db, category_id)
    if db_category is None or db_category.user_id != user_id:
        return False
    db.delete(db_category)
    db.commit()
    return True
