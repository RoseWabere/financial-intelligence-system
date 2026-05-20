from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.models import Investment, Provider
from app.schemas.schemas import InvestmentOut, ProviderOut

router = APIRouter(prefix="/api", tags=["directory"])


@router.get("/providers", response_model=list[ProviderOut])
async def list_providers(
    type: str | None = Query(None),
    regulated_by: str | None = Query(None),
    beginner_friendly: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Provider)
    if type:
        q = q.where(Provider.type == type)
    if regulated_by:
        q = q.where(Provider.regulated_by == regulated_by)
    if beginner_friendly is not None:
        q = q.where(Provider.beginner_friendly == beginner_friendly)
    q = q.where(Provider.regulation_status != "flagged")
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/investments", response_model=list[InvestmentOut])
async def list_investments(
    category: str | None = Query(None),
    risk_level: str | None = Query(None),
    max_min_investment: int | None = Query(None),
    regulated_by: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Investment).options(selectinload(Investment.provider))
    q = q.where(Investment.is_scam_flagged == False)  # noqa: E712
    if category:
        q = q.where(Investment.category == category)
    if risk_level:
        q = q.where(Investment.risk_level == risk_level)
    if max_min_investment:
        q = q.where(Investment.min_investment_kes <= max_min_investment)
    if regulated_by:
        q = q.where(Investment.regulator == regulated_by)
    result = await db.execute(q)
    return result.scalars().all()
