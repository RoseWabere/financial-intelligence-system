"""Tests for the rule-based decision engine."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.schemas.schemas import UserProfile
from app.services.decision_engine import recommend


def _p(**kwargs) -> UserProfile:
    d = dict(income_kes_monthly=50000, risk="medium",
             goals=["retirement"], horizon_years=5, age=30, has_debt=False)
    d.update(kwargs)
    return UserProfile(**d)


def test_total_is_100():
    assert sum(i.allocation_pct for i in recommend(_p()).plan) == 100

def test_low_income_mmf_dominant():
    plan = recommend(_p(income_kes_monthly=20000, risk="low")).plan
    mmf = next((i for i in plan if "Money Market" in i.category), None)
    assert mmf and mmf.allocation_pct >= 40

def test_high_risk_long_horizon_has_equity():
    cats = [i.category for i in recommend(_p(risk="high", horizon_years=10, age=25)).plan]
    assert any("Equit" in c or "NSE" in c for c in cats)

def test_house_goal_has_sacco():
    cats = [i.category for i in recommend(_p(goals=["house"])).plan]
    assert any("SACCO" in c for c in cats)

def test_short_horizon_no_equity():
    cats = [i.category for i in recommend(_p(horizon_years=1)).plan]
    assert not any("Equit" in c or "NSE" in c for c in cats)

def test_disclaimer_present():
    assert "not licensed" in recommend(_p()).disclaimer.lower()
