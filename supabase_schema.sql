-- =====================================================
-- Financial Helper - Supabase Database Schema
-- =====================================================
-- This schema matches the SQLAlchemy models in the backend
-- Run this in Supabase SQL Editor to set up the database
-- =====================================================

-- Enable UUID extension (optional, we're using serial for IDs)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE role_enum AS ENUM ('viewer', 'analyst', 'admin');

CREATE TYPE transaction_type_enum AS ENUM ('income', 'expense');

CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed');


-- =====================================================
-- TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_enum NOT NULL DEFAULT 'viewer',
    name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (optional but recommended)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type transaction_type_enum NOT NULL,
    color VARCHAR(20),
    icon VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name, type)
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    type transaction_type_enum NOT NULL,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    status transaction_status_enum NOT NULL DEFAULT 'completed',
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- INDEXES
-- =====================================================

-- Foreign key indexes (automatically created by PostgreSQL, but explicit is better)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);

-- For text search on notes (ILIKE queries)
-- For note: GIN with gin_trgm_ops extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_transactions_notes_gin ON transactions USING GIN (notes gin_trgm_ops);

-- For category name lookups
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_name ON categories(name);

-- Composite indexes for common query patterns
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_recurring ON transactions(user_id, is_recurring);


-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for categories table
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for transactions table
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- =====================================================
-- Enable RLS on tables if you want Supabase auth integration
-- For now, the application will handle user filtering

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to seed test data

-- -- Create sample users (password: admin123, analyst123, viewer123)
-- INSERT INTO users (email, password_hash, role, name) VALUES
-- ('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/qN3M6l4FO', 'admin', 'Admin User'),
-- ('analyst@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/qN3M6l4FO', 'analyst', 'Analyst User'),
-- ('viewer@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/qN3M6l4FO', 'viewer', 'Viewer User')
-- ON CONFLICT (email) DO NOTHING;

-- -- Create sample categories for admin
-- INSERT INTO categories (user_id, name, type, color, is_default) VALUES
-- (1, 'Salary', 'income', '#4CAF50', TRUE),
-- (1, 'Freelance', 'income', '#8BC34A', TRUE),
-- (1, 'Food', 'expense', '#FF9800', TRUE),
-- (1, 'Transport', 'expense', '#2196F3', TRUE),
-- (1, 'Utilities', 'expense', '#9C27B0', TRUE),
-- (1, 'Entertainment', 'expense', '#E91E63', TRUE)
-- ON CONFLICT DO NOTHING;

-- -- Create sample transactions
-- INSERT INTO transactions (user_id, amount, type, category_id, date, notes, status, is_recurring) VALUES
-- (1, 5000.00, 'income', 1, '2025-03-01', 'Monthly salary', 'completed', FALSE),
-- (1, 200.00, 'expense', 3, '2025-03-05', 'Grocery shopping', 'completed', FALSE),
-- (1, 150.00, 'expense', 4, '2025-03-10', 'Gas', 'completed', FALSE)
-- ON CONFLICT DO NOTHING;


-- =====================================================
-- END OF SCHEMA
-- =====================================================
-- Notes:
-- 1. Password hashes are bcrypt with cost factor 12
-- 2. All foreign keys have appropriate ON DELETE actions
-- 3. Check constraint ensures amount > 0
-- 4. GIN index on notes supports ILIKE '%search%' queries efficiently
-- 5. Composite indexes optimize common filter patterns
-- 6. triggers automatically update the updated_at timestamp
-- 7. Enum types enforce valid values at the database level
-- 8. Unique constraint on (user_id, name, type) prevents duplicate category names per user per type
-- =====================================================
