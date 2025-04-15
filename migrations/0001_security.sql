
ALTER TABLE users
ADD COLUMN two_factor_secret TEXT,
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN last_login_attempt TIMESTAMP,
ADD COLUMN login_attempts INTEGER DEFAULT 0;
