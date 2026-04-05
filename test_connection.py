#!/usr/bin/env python3
"""
Test database connection to Supabase.
This script will verify your DATABASE_URL configuration and connection.
"""
import sys
from app.db import init_db, get_db
from sqlalchemy import text

def test_connection():
    print("[TEST] Testing database connection...")
    try:
        # Initialize database (creates tables if they don't exist)
        print("[INIT] Initializing database tables...")
        init_db()
        print("[OK] Database initialized successfully")

        # Test actual connection by executing a simple query
        print("[TEST] Testing connection with a sample query...")
        db = next(get_db())
        result = db.execute(text("SELECT 1"))
        result.fetchone()
        db.close()

        print("[SUCCESS] Connection successful! Your Supabase database is ready.")
        return True

    except Exception as e:
        print(f"[ERROR] Connection failed: {type(e).__name__}: {e}")
        print("\n[TIPS] Troubleshooting tips:")
        print("   1. Check if your DATABASE_URL in .env is correct")
        print("   2. Ensure your IP is allowed in Supabase -> Project Settings -> Network")
        print("   3. Verify your database password is correct")
        print("   4. Make sure the database exists and is accessible")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
