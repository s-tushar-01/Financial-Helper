#!/usr/bin/env python3
"""Reset database to match current models."""
from app.db import engine, Base
from app.models import user, transaction, category  # noqa: F401

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Tables dropped.")

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
