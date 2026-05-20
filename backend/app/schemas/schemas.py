"""Pydantic v2 schemas — request/response contracts."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any, List, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


# ─────────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr | None = None
    phone: str | None = None
    password: str = Field(min_length=8)
    age_bracket: str | None = None
    income_bracket: str | None = None
    risk_profile: Literal["low", "medium", "high"] | None = None
    goals: list[str] = []
    investment_horizon_years: int | None = None

    @field_validator("email", "phone", mode="before")
    @classmethod
    def at_least_one_contact(cls, v, info):
        return v  # cross-field validated in __init__

    def model_post_init(self, __context: Any) -> None:
        if not self.email and not self.phone:
            raise ValueError("Provide either email or phone")


class UserLogin(BaseModel):
    email: EmailStr | None = None
    phone: str | None = None
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: uuid.UUID
    email: str | None
    phone: str | None
    risk_profile: str | None
    goals: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Providers & Investments
# ─────────────────────────────────────────────────────────────
class ProviderOut(BaseModel):
    id: int
    name: str
    type: str
    regulated_by: str | None
    regulation_status: str
    fees_text: str | None
    beginner_friendly: bool
    website: str | None
    description: str | None

    model_config = {"from_attributes": True}


class InvestmentOut(BaseModel):
    id: int
    name: str
    category: str
    risk_level: str | None
    expected_return_min: float | None
    expected_return_max: float | None
    min_investment_kes: int | None
    regulator: str | None
    where_to_buy: str | None
    description: str | None
    is_scam_flagged: bool
    provider: ProviderOut | None

    model_config = {"from_attributes": True}


class InvestmentFilter(BaseModel):
    category: str | None = None
    risk_level: str | None = None
    max_min_investment: int | None = None
    regulated_by: str | None = None
    beginner_friendly: bool | None = None


# ─────────────────────────────────────────────────────────────
# RAG / Chat
# ─────────────────────────────────────────────────────────────
class ChatMessageIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: uuid.UUID | None = None


class ChatSource(BaseModel):
    title: str
    source: str
    relevance: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[ChatSource] = []
    confidence: float
    session_id: uuid.UUID


# ─────────────────────────────────────────────────────────────
# Recommendation / Decision Engine
# ─────────────────────────────────────────────────────────────
class UserProfile(BaseModel):
    income_kes_monthly: int = Field(gt=0)
    risk: Literal["low", "medium", "high"]
    goals: list[str]
    horizon_years: int = Field(gt=0)
    age: int = Field(gt=0, lt=120)
    has_debt: bool = False


class AllocationItem(BaseModel):
    category: str
    allocation_pct: float
    rationale: str
    example_products: list[str] = []

class PlanOption(BaseModel):
    name: str
    plan: List[AllocationItem]
    rationale: str

class RecommendationResponse(BaseModel):
    plan: List[AllocationItem]  # primary (backward compatibility)
    alternative_plans: List[PlanOption] = []
    explanation: str
    recommended_actions: list[str]
    sources: list[str]
    disclaimer: str = (
        "This is not educational, not licensed financial advice. "
        "Consult a CMA-licensed advisor for personalised guidance."
    )


# ─────────────────────────────────────────────────────────────
# WhatsApp webhook (incoming from Node.js bridge)
# ─────────────────────────────────────────────────────────────
class WhatsAppIncoming(BaseModel):
    from_number: str
    message: str
    timestamp: datetime | None = None
    message_id: str | None = None


class WhatsAppReply(BaseModel):
    to: str
    body: str


# ─────────────────────────────────────────────────────────────
# Market Data
# ─────────────────────────────────────────────────────────────
class StockQuote(BaseModel):
    ticker: str
    price_date: date
    close: float
    open: float | None
    high: float | None
    low: float | None
    volume: int | None
    source: str


class MacroIndicatorOut(BaseModel):
    indicator: str
    value: float
    unit: str
    recorded_date: date
    source: str | None

    model_config = {"from_attributes": True}
