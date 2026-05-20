from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.models import MacroIndicator, StockPrice
from app.schemas.schemas import MacroIndicatorOut, StockQuote

router = APIRouter(prefix="/api/market", tags=["market"])

NSE_TICKERS = [
    "SCOM.NR",   # Safaricom
    "EQTY.NR",   # Equity Group
    "KCB.NR",    # KCB Group
    "COOP.NR",   # Co-op Bank
    "ABSA.NR",   # ABSA Kenya
]


@router.get("/stocks", response_model=list[StockQuote])
async def latest_stock_prices(
    ticker: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Latest daily OHLCV for tracked NSE tickers."""
    subq = (
        select(StockPrice.ticker, StockPrice.price_date.label("max_date"))
        .group_by(StockPrice.ticker)
    )

    q = select(StockPrice)
    if ticker:
        q = q.where(StockPrice.ticker == ticker.upper())
    # Get only the most recent date per ticker
    result = await db.execute(q.order_by(StockPrice.price_date.desc()).limit(50))
    rows = result.scalars().all()

    # Deduplicate: one row per ticker (latest)
    seen = set()
    out = []
    for r in rows:
        if r.ticker not in seen:
            seen.add(r.ticker)
            out.append(StockQuote(
                ticker=r.ticker,
                price_date=r.price_date,
                close=r.close,
                open=r.open,
                high=r.high,
                low=r.low,
                volume=r.volume,
                source=r.source,
            ))
    return out


@router.get("/macro", response_model=list[MacroIndicatorOut])
async def macro_indicators(db: AsyncSession = Depends(get_db)):
    """Latest macro indicators: CBR, inflation, T-bill yields."""
    result = await db.execute(
        select(MacroIndicator)
        .order_by(MacroIndicator.recorded_date.desc())
        .limit(20)
    )
    return result.scalars().all()
