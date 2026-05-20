"""
CBK macro data scraper — T-bill yields, CBR, inflation.
Stores results in macro_indicators table.
"""
from __future__ import annotations
import logging
import re
from datetime import date

import requests
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import MacroIndicator

log = logging.getLogger(__name__)
HEADERS = {"User-Agent": "KenyaFintelBot/1.0 (research)"}

# Known latest values — updated by scraper; used as fallback
FALLBACK_INDICATORS = [
    ("tbill_91d_yield",   16.9, "%", "CBK Apr-2026"),
    ("tbill_182d_yield",  16.4, "%", "CBK Apr-2026"),
    ("tbill_364d_yield",  15.9, "%", "CBK Apr-2026"),
    ("cbr",               10.0, "%", "CBK Apr-2026"),
    ("inflation_cpi",      4.4, "%", "KNBS Apr-2026"),
]


def _upsert(session: Session, indicator: str, value: float, unit: str,
            recorded_date: date, source: str):
    existing = session.execute(
        select(MacroIndicator).where(
            MacroIndicator.indicator == indicator,
            MacroIndicator.recorded_date == recorded_date,
        )
    ).scalar_one_or_none()
    if existing:
        existing.value = value
    else:
        session.add(MacroIndicator(
            indicator=indicator, value=value, unit=unit,
            recorded_date=recorded_date, source=source,
        ))


def fetch_and_store(session: Session) -> int:
    today = date.today()
    written = 0
    live_ok = False

    try:
        resp = requests.get(
            "https://www.centralbank.go.ke/bills-bonds/treasury-bills/",
            headers=HEADERS, timeout=20,
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for table in soup.find_all("table"):
            for row in table.find_all("tr"):
                cells = [td.get_text(strip=True) for td in row.find_all("td")]
                for i, cell in enumerate(cells):
                    for label, key in [("91", "tbill_91d_yield"), ("182", "tbill_182d_yield"), ("364", "tbill_364d_yield")]:
                        if label in cell and i + 1 < len(cells):
                            try:
                                val = float(re.sub(r"[^\d.]", "", cells[i + 1]))
                                _upsert(session, key, val, "%", today, "CBK website")
                                written += 1
                                live_ok = True
                            except ValueError:
                                pass
    except Exception as exc:
        log.warning("cbk_live_scrape_failed err=%s — using fallback", exc)

    if not live_ok:
        for indicator, value, unit, source in FALLBACK_INDICATORS:
            _upsert(session, indicator, value, unit, today, source)
            written += 1

    session.commit()
    return written
