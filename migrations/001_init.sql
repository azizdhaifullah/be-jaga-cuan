CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  wallet_id TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS otp_sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY,
  budget_cycle_start_day INTEGER NOT NULL,
  budget_cycle_end_day INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS wallet_members (
  wallet_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  PRIMARY KEY (wallet_id, user_id)
);

CREATE TABLE IF NOT EXISTS invites (
  code TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  title TEXT NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL,
  remaining_amount DOUBLE PRECISION NOT NULL,
  due_date TEXT NOT NULL,
  is_shared BOOLEAN NOT NULL
);
