"""
CMA (Capital Markets Authority Kenya) licensees scraper.
Scrapes https://licensees.cma.or.ke/licenses/{id}/ and upserts providers.

License category IDs used:
  4  = Stockbrokers
  6  = Fund Managers
  8  = Collective Investment Schemes (Unit Trusts / MMFs)
  11 = REITs Managers
"""
from __future__ import annotations
import logging
import time

import requests
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import Provider

log = logging.getLogger(__name__)

CMA_CATEGORIES = {
    4: ("broker", "CMA"),
    6: ("fund_manager", "CMA"),
    8: ("fund_manager", "CMA"),
    11: ("fund_manager", "CMA"),
}

HEADERS = {"User-Agent": "KenyaFintelBot/1.0 (research)"}


def scrape_category(category_id: int, provider_type: str, regulated_by: str) -> list[dict]:
    url = f"https://licensees.cma.or.ke/licenses/{category_id}/"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as exc:
        log.error("cma_fetch_failed cat=%d err=%s", category_id, exc)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    entities = []

    for row in soup.select("table tr"):
        cells = row.find_all("td")
        if len(cells) >= 1:
            name = cells[0].get_text(strip=True)
            website = ""
            if len(cells) >= 2:
                link = cells[1].find("a")
                website = link["href"] if link and link.get("href") else ""
            if name and len(name) > 3:
                entities.append({
                    "name": name, "type": provider_type,
                    "regulated_by": regulated_by, "website": website,
                    "regulation_status": "verified",
                })

    # Fallback: list items
    if not entities:
        for li in soup.select("ul li, ol li"):
            name = li.get_text(strip=True)
            if name and len(name) > 3:
                entities.append({
                    "name": name, "type": provider_type,
                    "regulated_by": regulated_by, "website": "",
                    "regulation_status": "verified",
                })

    log.info("scraped_cma cat=%d found=%d", category_id, len(entities))
    return entities


def upsert_providers(db_session: Session) -> int:
    upserted = 0
    for cat_id, (ptype, regulator) in CMA_CATEGORIES.items():
        for e in scrape_category(cat_id, ptype, regulator):
            existing = db_session.execute(
                select(Provider).where(Provider.name == e["name"])
            ).scalar_one_or_none()
            if existing:
                existing.regulation_status = "verified"
            else:
                db_session.add(Provider(**e))
                upserted += 1
        db_session.commit()
        time.sleep(1)
    return upserted
