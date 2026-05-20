"""
SQLAlchemy models for the Kenya Financial Intelligence System.
All monetary amounts in KES unless stated.
"""
import uuid
from datetime import date, datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


def utcnow():
    return datetime.now(timezone.utc)


# ===========================================================
# Users
# ===========================================================
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(20), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)

    # Profile — stored as coarse brackets, not exact values
    age_bracket = Column(String(20))              # e.g. "18-25", "26-35"
    income_bracket = Column(String(20))           # e.g. "10-30k", "30-100k"
    risk_profile = Column(Enum("low", "medium", "high", name="risk_enum"))
    goals = Column(JSONB, default=list)           # ["retirement","education","house"]
    investment_horizon_years = Column(Integer)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")


# ===========================================================
# Providers & Investments
# ===========================================================
class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    type = Column(
        Enum("broker", "fund_manager", "sacco", "bank", "government", name="provider_type_enum"),
        nullable=False,
    )
    regulated_by = Column(String(50))   # "CMA", "CBK", "SSRA"
    regulation_status = Column(
        Enum("verified", "unverified", "flagged", name="reg_status_enum"),
        default="unverified",
    )
    fees_text = Column(String(255))
    beginner_friendly = Column(Boolean, default=False)
    website = Column(String(255))
    phone = Column(String(50))
    description = Column(Text)
    extra = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    investments = relationship("Investment", back_populates="provider")


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    name = Column(String(255), nullable=False)
    category = Column(
        Enum("bond", "tbill", "stock", "etf", "reit", "mmf", "sacco_shares",
             "unit_trust", "forex", "crypto", name="investment_category_enum"),
        nullable=False,
    )
    risk_level = Column(Enum("low", "medium", "high", name="risk_level_enum"))
    expected_return_min = Column(Float)     # % per annum
    expected_return_max = Column(Float)
    min_investment_kes = Column(Integer)
    maturity_date = Column(Date, nullable=True)
    coupon_rate = Column(Float, nullable=True)
    regulator = Column(String(50))
    where_to_buy = Column(Text)
    description = Column(Text)
    is_scam_flagged = Column(Boolean, default=False)
    scam_reason = Column(Text, nullable=True)
    extra = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    provider = relationship("Provider", back_populates="investments")


# ===========================================================
# Market Data
# ===========================================================
class StockPrice(Base):
    """Daily OHLCV for tracked NSE tickers."""
    __tablename__ = "stock_prices"
    __table_args__ = (UniqueConstraint("ticker", "price_date"),)

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ticker = Column(String(20), nullable=False, index=True)
    price_date = Column(Date, nullable=False)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(BigInteger)
    source = Column(String(50), default="yahoo_finance")


class MacroIndicator(Base):
    """CBK rates, inflation, CBR, etc."""
    __tablename__ = "macro_indicators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    indicator = Column(String(100), nullable=False)   # "CBR", "inflation_cpi", "tbill_91d_yield"
    value = Column(Float, nullable=False)
    unit = Column(String(20), default="%")
    recorded_date = Column(Date, nullable=False)
    source = Column(String(100))
    extra = Column(JSONB, default=dict)


# ===========================================================
# Knowledge Base (RAG)
# ===========================================================
class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    source = Column(String(255))
    category = Column(String(100))     # "glossary", "product_guide", "regulation", "news"
    last_updated = Column(Date, default=date.today)
    embedding = Column(Vector(384))    # all-MiniLM-L6-v2 → 384 dims
    extra = Column(JSONB, default=dict)
    valid_until = Column(Date, nullable=True)  # auto-set to 1 year from now on insert


class GlossaryTerm(Base):
    __tablename__ = "glossary"

    term = Column(String(255), primary_key=True)
    definition = Column(Text, nullable=False)
    kiswahili_term = Column(String(255), nullable=True)
    example = Column(Text, nullable=True)
    related_terms = Column(JSONB, default=list)


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(512), nullable=False)
    summary = Column(Text)
    source = Column(String(255))
    url = Column(String(1024), unique=True)
    published_at = Column(DateTime(timezone=True))
    tags = Column(JSONB, default=list)        # ["bonds", "forex", "CBK"]
    embedding = Column(Vector(384), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


# ===========================================================
# Chat / WhatsApp
# ===========================================================
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    channel = Column(Enum("web", "whatsapp", name="channel_enum"), default="web")
    whatsapp_number = Column(String(30), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship(
        "ChatMessage", back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(Enum("user", "assistant", name="role_enum"), nullable=False)
    content = Column(Text, nullable=False)
    sources = Column(JSONB, default=list)       # citations used
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    flagged = Column(Boolean, default=False)
    flag_reason = Column(String(255), nullable=True)

    session = relationship("ChatSession", back_populates="messages")


# ===========================================================
# Query Analytics
# ===========================================================
class QueryLog(Base):
    """Tracks popular questions to guide KB prioritisation."""
    __tablename__ = "query_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    query_text = Column(Text, nullable=False)
    channel = Column(String(20), default="web")
    category_tag = Column(String(100), nullable=True)   # "broker_query", "faq", "advice"
    response_confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
