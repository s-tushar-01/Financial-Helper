#!/usr/bin/env python3
"""
Seed the database with initial data for testing.
"""
from app.db import init_db, SessionLocal
from app.models import User, Category, Transaction
from app.core.auth import get_password_hash
from datetime import datetime, timedelta

def main():
    init_db()
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Database already seeded.")
            return

        # Create users with different roles
        admin = User(email="admin@example.com", username="admin", password_hash=get_password_hash("admin123"), role="admin")
        analyst = User(email="analyst@example.com", username="analyst", password_hash=get_password_hash("analyst123"), role="analyst")
        viewer = User(email="viewer@example.com", username="viewer", password_hash=get_password_hash("viewer123"), role="viewer")
        db.add_all([admin, analyst, viewer])
        db.commit()

        # Create categories for admin
        admin_categories = [
            Category(name="Salary", user_id=admin.id),
            Category(name="Freelance", user_id=admin.id),
            Category(name="Food", user_id=admin.id),
            Category(name="Transport", user_id=admin.id),
            Category(name="Entertainment", user_id=admin.id),
            Category(name="Utilities", user_id=admin.id),
        ]
        # Create categories for analyst
        analyst_categories = [
            Category(name="Salary", user_id=analyst.id),
            Category(name="Freelance", user_id=analyst.id),
            Category(name="Food", user_id=analyst.id),
            Category(name="Transport", user_id=analyst.id),
            Category(name="Entertainment", user_id=analyst.id),
            Category(name="Utilities", user_id=analyst.id),
        ]
        # Create categories for viewer
        viewer_categories = [
            Category(name="Salary", user_id=viewer.id),
            Category(name="Food", user_id=viewer.id),
            Category(name="Transport", user_id=viewer.id),
        ]
        db.add_all(admin_categories)
        db.add_all(analyst_categories)
        db.add_all(viewer_categories)
        db.commit()

        # Create some transactions for admin
        admin_transactions = [
            Transaction(amount=5000.0, type="income", category_id=admin_categories[0].id, date=datetime.now() - timedelta(days=5), notes="Monthly salary", user_id=admin.id),
            Transaction(amount=1500.0, type="income", category_id=admin_categories[1].id, date=datetime.now() - timedelta(days=10), notes="Freelance project", user_id=admin.id),
            Transaction(amount=200.0, type="expense", category_id=admin_categories[2].id, date=datetime.now() - timedelta(days=2), notes="Groceries", user_id=admin.id),
            Transaction(amount=50.0, type="expense", category_id=admin_categories[3].id, date=datetime.now() - timedelta(days=3), notes="Bus fare", user_id=admin.id),
            Transaction(amount=100.0, type="expense", category_id=admin_categories[4].id, date=datetime.now() - timedelta(days=1), notes="Netflix", user_id=admin.id),
            Transaction(amount=150.0, type="expense", category_id=admin_categories[5].id, date=datetime.now() - timedelta(days=15), notes="Electric bill", user_id=admin.id),
        ]

        # Create some transactions for analyst
        analyst_transactions = [
            Transaction(amount=3000.0, type="income", category_id=analyst_categories[0].id, date=datetime.now() - timedelta(days=3), notes="Part-time salary", user_id=analyst.id),
            Transaction(amount=1200.0, type="income", category_id=analyst_categories[1].id, date=datetime.now() - timedelta(days=7), notes="Consulting", user_id=analyst.id),
            Transaction(amount=250.0, type="expense", category_id=analyst_categories[2].id, date=datetime.now() - timedelta(days=2), notes="Dining out", user_id=analyst.id),
            Transaction(amount=75.0, type="expense", category_id=analyst_categories[3].id, date=datetime.now() - timedelta(days=5), notes="Transport", user_id=analyst.id),
            Transaction(amount=80.0, type="expense", category_id=analyst_categories[4].id, date=datetime.now() - timedelta(days=1), notes="Movies", user_id=analyst.id),
            Transaction(amount=120.0, type="expense", category_id=analyst_categories[2].id, date=datetime.now() - timedelta(days=10), notes="Groceries", user_id=analyst.id),
        ]

        # Create some transactions for viewer
        viewer_transactions = [
            Transaction(amount=1200.0, type="income", category_id=viewer_categories[0].id, date=datetime.now() - timedelta(days=6), notes="Gift", user_id=viewer.id),
            Transaction(amount=45.0, type="expense", category_id=viewer_categories[1].id, date=datetime.now() - timedelta(days=8), notes="Coffee", user_id=viewer.id),
            Transaction(amount=30.0, type="expense", category_id=viewer_categories[2].id, date=datetime.now() - timedelta(days=4), notes="Bus", user_id=viewer.id),
        ]

        db.add_all(admin_transactions + analyst_transactions + viewer_transactions)
        db.commit()

        print("Database seeded successfully!")
        print("Login credentials:")
        print("  Admin: admin@example.com / admin123")
        print("  Analyst: analyst@example.com / analyst123")
        print("  Viewer: viewer@example.com / viewer123")
    finally:
        db.close()

if __name__ == "__main__":
    main()
