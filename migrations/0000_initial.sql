
-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  subscription_tier TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Portfolio Assets Table
CREATE TABLE IF NOT EXISTS portfolio_assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  purchase_price DECIMAL NOT NULL,
  current_price DECIMAL NOT NULL,
  value DECIMAL NOT NULL,
  change_percent DECIMAL NOT NULL,
  icon TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Educational Content Table
CREATE TABLE IF NOT EXISTS educational_content (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructor TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  rating DECIMAL,
  access_tier TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price TEXT NOT NULL,
  description TEXT NOT NULL,
  features JSONB NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE
);
