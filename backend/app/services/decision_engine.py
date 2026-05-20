"""
Rule-based financial decision engine.

Returns:
- A primary recommended plan (backward compatible)
- Alternative plans (Conservative, Balanced, Growth)
- Clear explanation and suggested actions

All outputs are educational examples, not financial advice.
"""

from __future__ import annotations

from app.schemas.schemas import (
    AllocationItem,
    RecommendationResponse,
    UserProfile,
    PlanOption,
)


# ======================================================────
# Helper: classify income tier

def _income_tier(income_kes: int) -> str:
    if income_kes < 30_000:
        return "low"
    if income_kes < 100_000:
        return "medium"
    return "high"


# ======================================================────
# Helper: build allocation list
# Converts tuples into AllocationItem objects

def _build_allocation(items: list[tuple[str, float, str, list[str]]]) -> list[AllocationItem]:
    return [
        AllocationItem(
            category=cat,
            allocation_pct=round(pct),
            rationale=rat,
            example_products=examples,
        )
        for cat, pct, rat, examples in items
    ]


# ======================================================────
# Main recommendation function

def recommend(profile: UserProfile) -> RecommendationResponse:
    tier = _income_tier(profile.income_kes_monthly)
    risk = profile.risk
    horizon = profile.horizon_years
    goals = [g.lower() for g in profile.goals]
    has_debt = profile.has_debt

    # ── Emergency buffer rule (applies to all scenarios) ──────
    if tier == "low" or has_debt:
        emergency_pct = 50
        emergency_label = "Money Market Fund (Emergency Buffer)"
        emergency_reason = "Prioritise liquidity due to low income or existing debt."
    else:
        emergency_pct = 20
        emergency_label = "Money Market Fund"
        emergency_reason = "Standard liquidity buffer for flexibility."

    # ======================================================
    # Scenario 1: Conservative
    # Focus: capital preservation and liquidity
    
    cons_remaining = 100 - emergency_pct
    cons_items = [
        (emergency_label, emergency_pct, emergency_reason,
         ["CIC Money Market Fund", "Sanlam MMF"])
    ]

    # Bonds allocation
    bond_pct = min(cons_remaining * 0.6, 40)
    cons_items.append((
        "Government Bonds / T-bills",
        bond_pct,
        "Low-risk government securities for stable returns.",
        ["CBK 91-day T-bill", "Treasury Bond"]
    ))
    cons_remaining -= bond_pct

    # SACCO if relevant
    if "house" in goals or "land" in goals or tier in ("low", "medium"):
        sacco_pct = min(cons_remaining * 0.4, 20)
        cons_items.append((
            "SACCO Shares / Deposits",
            sacco_pct,
            "Access to low-interest loans and stable savings.",
            ["Stima SACCO", "Harambee SACCO"]
        ))
        cons_remaining -= sacco_pct

    # Remaining goes to MMF
    cons_items.append((
        "Additional Money Market Fund",
        cons_remaining,
        "Maintain liquidity for short-term needs.",
        ["Britam MMF", "Old Mutual MMF"]
    ))

    conservative_plan = _build_allocation(cons_items)

    # ======================================================
    # Scenario 2: Balanced
    # Focus: mix of growth and stability
    
    bal_remaining = 100 - emergency_pct
    bal_items = [
        (emergency_label, emergency_pct, emergency_reason,
         ["CIC MMF", "Sanlam MMF"])
    ]

    # Bonds
    bond_pct = min(bal_remaining * 0.3, 30)
    bal_items.append((
        "Government Bonds / T-bills",
        bond_pct,
        "Stable core of the portfolio.",
        ["CBK 182-day T-bill", "Treasury Bond"]
    ))
    bal_remaining -= bond_pct

    # Equities (only if horizon allows)
    if horizon >= 3:
        eq_pct = min(bal_remaining * 0.4, 30)
        bal_items.append((
            "NSE Equities / Unit Trusts",
            eq_pct,
            "Growth potential over the medium term.",
            ["Safaricom (SCOM)", "CIC Equity Fund"]
        ))
        bal_remaining -= eq_pct

    # SACCO
    sacco_pct = min(bal_remaining * 0.3, 20)
    bal_items.append((
        "SACCO Shares",
        sacco_pct,
        "Supports savings and loan access.",
        ["Mwalimu SACCO", "Stima SACCO"]
    ))
    bal_remaining -= sacco_pct

    # Remaining MMF
    bal_items.append((
        "Money Market Fund",
        bal_remaining,
        "Liquidity and stability.",
        ["Old Mutual MMF", "Sanlam MMF"]
    ))

    balanced_plan = _build_allocation(bal_items)

    # ======================================================
    # Scenario 3: Growth
    # Focus: long-term capital appreciation
    
    gro_remaining = 100 - emergency_pct
    gro_items = [
        (emergency_label, emergency_pct, emergency_reason,
         ["CIC MMF", "Britam MMF"])
    ]

    # Equities
    eq_pct = min(gro_remaining * 0.5, 50)
    gro_items.append((
        "NSE Equities / Unit Trusts",
        eq_pct,
        "Higher expected returns over long horizons.",
        ["Equity Group (EQTY)", "KCB Group"]
    ))
    gro_remaining -= eq_pct

    # REITs
    reit_pct = min(gro_remaining * 0.25, 15)
    gro_items.append((
        "REITs",
        reit_pct,
        "Real estate exposure with liquidity.",
        ["Acorn REIT", "Fahari REIT"]
    ))
    gro_remaining -= reit_pct

    # Bonds
    bond_pct = min(gro_remaining * 0.3, 20)
    gro_items.append((
        "Government Bonds",
        bond_pct,
        "Adds stability and diversification.",
        ["Infrastructure Bond"]
    ))
    gro_remaining -= bond_pct

    # Remaining MMF
    gro_items.append((
        "Money Market Fund",
        gro_remaining,
        "Cash buffer and flexibility.",
        ["CIC MMF", "Britam MMF"]
    ))

    growth_plan = _build_allocation(gro_items)

    # ======================================================
    # Combine all scenarios
    # ======================================================
    scenarios = [
        ("Conservative", conservative_plan,
         "Prioritises safety and liquidity. Suitable for short-term goals or low risk."),
        ("Balanced", balanced_plan,
         "Balances growth and stability for medium-term goals."),
        ("Growth", growth_plan,
         "Targets long-term capital appreciation with higher volatility."),
    ]

    # ======================================================
    # Select primary plan based on user profile
    
    if risk == "low" or horizon < 3:
        primary_index = 0
    elif risk == "medium":
        primary_index = 1
    else:
        primary_index = 2

    primary_name, primary_plan, _ = scenarios[primary_index]

    # Convert scenarios into structured response objects
    alternative_plans = [
        PlanOption(name=name, plan=plan, rationale=rationale)
        for name, plan, rationale in scenarios
    ]

    # ======================================================
    # Explanation text
    
    explanation = (
        f"Based on your {tier}-income level (KES {profile.income_kes_monthly:,}/month), "
        f"{risk} risk appetite, and {horizon}-year horizon, "
        f"the {primary_name.lower()} approach is the most suitable starting point. "
        f"Alternative strategies are provided for comparison."
    )

    # ======================================================
    # Recommended actions
    
    actions = [
        "Open a CBK DhowCSD account to invest in Treasury bills and bonds.",
        "Join a regulated SACCO to build savings and access affordable credit.",
        "Start with a Money Market Fund via mobile platforms such as M-Pesa.",
    ]

    # ======================================================
    # Final response
    # ======================================================
    return RecommendationResponse(
        plan=primary_plan,
        alternative_plans=alternative_plans,
        explanation=explanation,
        recommended_actions=actions,
        sources=["CBK", "CMA", "SASRA", "NSE"],
    )