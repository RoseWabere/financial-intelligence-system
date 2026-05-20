-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums - for better data integrity and readability
CREATE TYPE risk_enum AS ENUM ('low', 'medium', 'high');
CREATE TYPE provider_type_enum AS ENUM ('broker', 'fund_manager', 'sacco', 'bank', 'government');
CREATE TYPE reg_status_enum AS ENUM ('verified', 'unverified', 'flagged');
CREATE TYPE investment_category_enum AS ENUM ('bond', 'tbill', 'stock', 'etf', 'reit', 'mmf', 'sacco_shares', 'unit_trust', 'forex', 'crypto');
CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high');
CREATE TYPE channel_enum AS ENUM ('web', 'whatsapp');
CREATE TYPE role_enum AS ENUM ('user', 'assistant');

-- schema
CREATE SCHEMA IF NOT EXISTS fintel;

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age_bracket VARCHAR(20),
    income_bracket VARCHAR(20),
    risk_profile risk_enum,
    goals JSONB DEFAULT '[]',
    investment_horizon_years INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Providers
CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type provider_type_enum NOT NULL,
    regulated_by VARCHAR(50),
    regulation_status reg_status_enum DEFAULT 'unverified',
    fees_text VARCHAR(255),
    beginner_friendly BOOLEAN DEFAULT false,
    website VARCHAR(255),
    phone VARCHAR(50),
    description TEXT,
    extra JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Investments
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES providers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category investment_category_enum NOT NULL,
    risk_level risk_level_enum,
    expected_return_min FLOAT,
    expected_return_max FLOAT,
    min_investment_kes INT,
    maturity_date DATE,
    coupon_rate FLOAT,
    regulator VARCHAR(50),
    where_to_buy TEXT,
    description TEXT,
    is_scam_flagged BOOLEAN DEFAULT false,
    scam_reason TEXT,
    extra JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stock prices (daily, keep 90 days)
CREATE TABLE stock_prices (
    id BIGSERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    price_date DATE NOT NULL,
    open FLOAT,
    high FLOAT,
    low FLOAT,
    close FLOAT,
    volume BIGINT,
    source VARCHAR(50) DEFAULT 'yahoo_finance',
    UNIQUE(ticker, price_date)
);
CREATE INDEX idx_stock_ticker_date ON stock_prices(ticker, price_date DESC);

-- Macro indicators
CREATE TABLE macro_indicators (
    id SERIAL PRIMARY KEY,
    indicator VARCHAR(100) NOT NULL,
    value FLOAT NOT NULL,
    unit VARCHAR(20) DEFAULT '%',
    recorded_date DATE NOT NULL,
    source VARCHAR(100),
    extra JSONB DEFAULT '{}'
);

-- Knowledge chunks with expiry and full‑text
CREATE TABLE knowledge_chunks (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    source VARCHAR(255),
    category VARCHAR(100),
    last_updated DATE DEFAULT CURRENT_DATE,
    valid_until DATE,   -- expiry date
    embedding vector(384),
    extra JSONB DEFAULT '{}'
);
-- Add full‑text search column
ALTER TABLE knowledge_chunks ADD COLUMN content_tsv tsvector
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;
CREATE INDEX idx_kb_fts ON knowledge_chunks USING GIN(content_tsv);
-- Vector index (IVFFlat, lists=100)
CREATE INDEX idx_kb_vector ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Glossary
CREATE TABLE glossary (
    term VARCHAR(255) PRIMARY KEY,
    definition TEXT NOT NULL,
    kiswahili_term VARCHAR(255),
    example TEXT,
    related_terms JSONB DEFAULT '[]'
);

-- News articles (prune after 30 days)
CREATE TABLE news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    summary TEXT,
    source VARCHAR(255),
    url VARCHAR(1024) UNIQUE,
    published_at TIMESTAMPTZ,
    tags JSONB DEFAULT '[]',
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_news_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_vector ON news_articles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Chat sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    channel channel_enum DEFAULT 'web',
    whatsapp_number VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages (keep last 50 per session)
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role role_enum NOT NULL,
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    confidence FLOAT,
    flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_msg_session ON chat_messages(session_id, created_at DESC);

-- Query logs
CREATE TABLE query_logs (
    id BIGSERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    channel VARCHAR(20) DEFAULT 'web',
    category_tag VARCHAR(100),
    response_confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto‑prune old news (optional: use cron job instead)
CREATE OR REPLACE FUNCTION prune_old_news() RETURNS trigger AS $$
BEGIN
    DELETE FROM news_articles WHERE published_at < NOW() - INTERVAL '30 days';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_prune_news AFTER INSERT ON news_articles
    EXECUTE FUNCTION prune_old_news();