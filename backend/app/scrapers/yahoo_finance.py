"""
Yahoo Finance scraper for NSE tickers.
Fetches daily OHLCV and upserts into stock_prices table.

NSE tickers on Yahoo Finance use the .NR suffix:
  SCOM.NR (Safaricom), EQTY.NR (Equity Group), KCB.NR etc.
"""
from __future__ import annotations

import logging
from datetime import date, timedelta

import yfinance as yf
from sqlalchemy import text
from sqlalchemy.orm import Session

log = logging.getLogger(__name__)

NSE_TICKERS = [
    "SCOM.NR", "EQTY.NR", "KCB.NR",
    "COOP.NR", "ABSA.NR", "EABL.NR", "BAT.NR", "JUB.NR",
]


def fetch_and_upsert(db_session: Session, days_back: int = 5) -> int:
    start = (date.today() - timedelta(days=days_back)).isoformat()
    end = date.today().isoformat()
    rows_written = 0

    for ticker in NSE_TICKERS:
        try:
            df = yf.download(ticker, start=start, end=end, progress=False, auto_adjust=True)
            if df.empty:
                log.warning("no_data ticker=%s", ticker)
                continue

            for price_date, row in df.iterrows():
                stmt = text("""
                    INSERT INTO stock_prices (ticker, price_date, open, high, low, close, volume, source)
                    VALUES (:ticker, :price_date, :open, :high, :low, :close, :volume, :source)
                    ON CONFLICT (ticker, price_date) DO UPDATE
                    SET open=EXCLUDED.open, high=EXCLUDED.high, low=EXCLUDED.low,
                        close=EXCLUDED.close, volume=EXCLUDED.volume
                """)
                db_session.execute(stmt, {
                    "ticker": ticker,
                    "price_date": price_date.date(),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"]),
                    "source": "yahoo_finance",
                })
                rows_written += 1

            db_session.commit()
            log.info("fetched ticker=%s rows=%d", ticker, len(df))
        except Exception as exc:
            log.error("failed ticker=%s error=%s", ticker, exc)
            db_session.rollback()

    return rows_written
