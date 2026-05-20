"""Initial schema — all tables + pgvector extension

Revision ID: 0001
Revises:
Create Date: 2026-04-11
"""
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")

    op.execute("CREATE SCHEMA IF NOT EXISTS fintel")

    # --- Enums ---
    op.execute("CREATE TYPE risk_enum AS ENUM ('low', 'medium', 'high')")
    op.execute("CREATE TYPE provider_type_enum AS ENUM ('broker', 'fund_manager', 'sacco', 'bank', 'government')")
    op.execute("CREATE TYPE reg_status_enum AS ENUM ('verified', 'unverified', 'flagged')")
    op.execute("CREATE TYPE investment_category_enum AS ENUM ('bond', 'tbill', 'stock', 'etf', 'reit', 'mmf', 'sacco_shares', 'unit_trust', 'forex', 'crypto')")
    op.execute("CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high')")
    op.execute("CREATE TYPE channel_enum AS ENUM ('web', 'whatsapp')")
    op.execute("CREATE TYPE role_enum AS ENUM ('user', 'assistant')")

    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("email", sa.String(255), unique=True, nullable=True),
        sa.Column("phone", sa.String(20), unique=True, nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("age_bracket", sa.String(20)),
        sa.Column("income_bracket", sa.String(20)),
        sa.Column("risk_profile", sa.Enum("low", "medium", "high", name="risk_enum"), nullable=True),
        sa.Column("goals", sa.JSON, server_default="[]"),
        sa.Column("investment_horizon_years", sa.Integer),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # --- providers ---
    op.create_table(
        "providers",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("type", sa.Enum("broker", "fund_manager", "sacco", "bank", "government", name="provider_type_enum"), nullable=False),
        sa.Column("regulated_by", sa.String(50)),
        sa.Column("regulation_status", sa.Enum("verified", "unverified", "flagged", name="reg_status_enum"), server_default="unverified"),
        sa.Column("fees_text", sa.String(255)),
        sa.Column("beginner_friendly", sa.Boolean, server_default="false"),
        sa.Column("website", sa.String(255)),
        sa.Column("phone", sa.String(50)),
        sa.Column("description", sa.Text),
        sa.Column("extra", sa.JSON, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # --- investments ---
    op.create_table(
        "investments",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("provider_id", sa.Integer, sa.ForeignKey("providers.id"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.Enum("bond", "tbill", "stock", "etf", "reit", "mmf", "sacco_shares", "unit_trust", "forex", "crypto", name="investment_category_enum"), nullable=False),
        sa.Column("risk_level", sa.Enum("low", "medium", "high", name="risk_level_enum")),
        sa.Column("expected_return_min", sa.Float),
        sa.Column("expected_return_max", sa.Float),
        sa.Column("min_investment_kes", sa.Integer),
        sa.Column("maturity_date", sa.Date),
        sa.Column("coupon_rate", sa.Float),
        sa.Column("regulator", sa.String(50)),
        sa.Column("where_to_buy", sa.Text),
        sa.Column("description", sa.Text),
        sa.Column("is_scam_flagged", sa.Boolean, server_default="false"),
        sa.Column("scam_reason", sa.Text),
        sa.Column("extra", sa.JSON, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # --- stock_prices ---
    op.create_table(
        "stock_prices",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("ticker", sa.String(20), nullable=False, index=True),
        sa.Column("price_date", sa.Date, nullable=False),
        sa.Column("open", sa.Float),
        sa.Column("high", sa.Float),
        sa.Column("low", sa.Float),
        sa.Column("close", sa.Float),
        sa.Column("volume", sa.BigInteger),
        sa.Column("source", sa.String(50), server_default="yahoo_finance"),
        sa.UniqueConstraint("ticker", "price_date"),
    )

    # --- macro_indicators ---
    op.create_table(
        "macro_indicators",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("indicator", sa.String(100), nullable=False),
        sa.Column("value", sa.Float, nullable=False),
        sa.Column("unit", sa.String(20), server_default="%"),
        sa.Column("recorded_date", sa.Date, nullable=False),
        sa.Column("source", sa.String(100)),
        sa.Column("extra", sa.JSON, server_default="{}"),
    )

    # --- knowledge_chunks with vector + FTS ---
    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("source", sa.String(255)),
        sa.Column("category", sa.String(100)),
        sa.Column("last_updated", sa.Date, server_default=sa.text("CURRENT_DATE")),
        sa.Column("valid_until", sa.Date, nullable=True),
        sa.Column("embedding", Vector(384)),
        sa.Column("extra", sa.JSON, server_default="{}"),
    )

    op.execute("""
        ALTER TABLE knowledge_chunks
        ADD COLUMN content_tsv tsvector
        GENERATED ALWAYS AS (
            to_tsvector('english', coalesce(content, ''))
        ) STORED;
    """)

    op.execute(
        "CREATE INDEX ON knowledge_chunks USING ivfflat "
        "(embedding vector_cosine_ops) WITH (lists = 100)"
    )

    op.create_index(
        "idx_knowledge_chunks_fts",
        "knowledge_chunks",
        ["content_tsv"],
        postgresql_using="gin"
    )

    # --- glossary ---
    op.create_table(
        "glossary",
        sa.Column("term", sa.String(255), primary_key=True),
        sa.Column("definition", sa.Text, nullable=False),
        sa.Column("kiswahili_term", sa.String(255)),
        sa.Column("example", sa.Text),
        sa.Column("related_terms", sa.JSON, server_default="[]"),
    )

    # --- news_articles ---
    op.create_table(
        "news_articles",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("summary", sa.Text),
        sa.Column("source", sa.String(255)),
        sa.Column("url", sa.String(1024), unique=True),
        sa.Column("published_at", sa.DateTime(timezone=True)),
        sa.Column("tags", sa.JSON, server_default="[]"),
        sa.Column("embedding", Vector(384)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # --- chat_sessions ---
    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("channel", sa.Enum("web", "whatsapp", name="channel_enum"), server_default="web"),
        sa.Column("whatsapp_number", sa.String(30)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # --- chat_messages ---
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("session_id", sa.UUID(as_uuid=True), sa.ForeignKey("chat_sessions.id"), nullable=False),
        sa.Column("role", sa.Enum("user", "assistant", name="role_enum"), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("sources", sa.JSON, server_default="[]"),
        sa.Column("confidence", sa.Float),
        sa.Column("flagged", sa.Boolean, server_default="false"),
        sa.Column("flag_reason", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # --- query_logs ---
    op.create_table(
        "query_logs",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("query_text", sa.Text, nullable=False),
        sa.Column("channel", sa.String(20), server_default="web"),
        sa.Column("category_tag", sa.String(100)),
        sa.Column("response_confidence", sa.Float),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_index("idx_knowledge_chunks_fts", table_name="knowledge_chunks")

    for table in [
        "query_logs",
        "chat_messages",
        "chat_sessions",
        "news_articles",
        "glossary",
        "knowledge_chunks",
        "macro_indicators",
        "stock_prices",
        "investments",
        "providers",
        "users",
    ]:
        op.drop_table(table)

    for enum in [
        "risk_enum",
        "provider_type_enum",
        "reg_status_enum",
        "investment_category_enum",
        "risk_level_enum",
        "channel_enum",
        "role_enum",
    ]:
        op.execute(f"DROP TYPE IF EXISTS {enum}")