-- Personal Finance Manager - Database Schema (PostgreSQL)

-- =========================
-- Table: users
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  profile_picture TEXT,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- =========================
-- Table: categories
-- Each user has their own set of income/expense categories.
-- =========================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name, type)
);

-- =========================
-- Table: transactions
-- Stores both income and expense records.
-- =========================
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount TEXT NOT NULL,
  description VARCHAR(255),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

-- Add the standard categories to existing users without duplicating custom categories.
INSERT INTO categories (user_id, name, type)
SELECT users.id, defaults.name, defaults.type
FROM users
CROSS JOIN (VALUES
  ('Salary', 'income'),
  ('Other Income', 'income'),
  ('Freelance', 'income'),
  ('Business', 'income'),
  ('Investments', 'income'),
  ('Refunds', 'income'),
  ('Gifts', 'income'),
  ('Food', 'expense'),
  ('Groceries', 'expense'),
  ('Transport', 'expense'),
  ('Rent', 'expense'),
  ('Bills & Utilities', 'expense'),
  ('Credit Card Bills', 'expense'),
  ('Shopping', 'expense'),
  ('Movies & Entertainment', 'expense'),
  ('Health', 'expense'),
  ('Education', 'expense'),
  ('Travel', 'expense'),
  ('Insurance', 'expense'),
  ('Other Expense', 'expense')
) AS defaults(name, type)
ON CONFLICT (user_id, name, type) DO NOTHING;

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_amount_check;
ALTER TABLE transactions ALTER COLUMN amount TYPE TEXT USING amount::TEXT;
