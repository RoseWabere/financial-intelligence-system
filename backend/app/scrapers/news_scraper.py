"""
Kenya finance news scraper — NewsAPI + Business Daily RSS.
Chunks summaries and generates embeddings for RAG.
"""
from __future__ import annotations
import logging
from datetime import datetime, timezone

import feedparser
import requests
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import NewsArticle
from app.services.embedding_service import embedding_service

log = logging.getLogger(__name__)

RSS_FEEDS = [
    "https://businessdailyafrica.com/feed",
    "https://www.nation.africa/kenya/business/feed",
]

NEWSAPI_KEYWORDS = [
    "Kenya bonds", "CBK interest rate", "NSE Kenya",
    "SACCO Kenya", "M-Pesa investment",
]

TAGS_MAP = {
    "bond": "bonds", "t-bill": "tbills", "treasury": "bonds",
    "sacco": "sacco", "money market": "mmf", "nse": "nse",
    "inflation": "macro", "cbk": "cbk", "mpesa": "mpesa",
    "forex": "forex", "reit": "reit", "stock": "stocks",
}


def _tags(text: str) -> list[str]:
    t = text.lower()
    return list({v for k, v in TAGS_MAP.items() if k in t})


def _upsert(session: Session, title: str, summary: str, source: str,
            url: str, published_at: datetime) -> bool:
    if session.execute(select(NewsArticle).where(NewsArticle.url == url)).scalar_one_or_none():
        return False
    try:
        emb = embedding_service.encode_single(f"{title}. {summary}"[:512])
    except Exception:
        emb = None
    session.add(NewsArticle(
        title=title[:512], summary=summary[:2000], source=source,
        url=url, published_at=published_at,
        tags=_tags(title + " " + summary), embedding=emb,
    ))
    return True


def fetch_rss(session: Session) -> int:
    written = 0
    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:20]:
                url = entry.get("link", "")
                if not url:
                    continue
                title = entry.get("title", "")
                summary = entry.get("summary", entry.get("description", ""))[:2000]
                try:
                    from email.utils import parsedate_to_datetime
                    pub = parsedate_to_datetime(entry.get("published", ""))
                except Exception:
                    pub = datetime.now(timezone.utc)
                if _upsert(session, title, summary, feed.feed.get("title", feed_url), url, pub):
                    written += 1
            session.commit()
        except Exception as exc:
            log.error("rss_failed feed=%s err=%s", feed_url, exc)
            session.rollback()
    return written


def fetch_newsapi(session: Session) -> int:
    if not settings.NEWS_API_KEY:
        return 0
    written = 0
    for kw in NEWSAPI_KEYWORDS:
        try:
            resp = requests.get(
                "https://newsapi.org/v2/everything",
                params={"q": kw, "language": "en", "sortBy": "publishedAt",
                        "pageSize": 10, "apiKey": settings.NEWS_API_KEY},
                timeout=15,
            )
            resp.raise_for_status()
            for a in resp.json().get("articles", []):
                url = a.get("url", "")
                if not url:
                    continue
                pub_str = a.get("publishedAt", "").replace("Z", "+00:00")
                try:
                    pub = datetime.fromisoformat(pub_str)
                except Exception:
                    pub = datetime.now(timezone.utc)
                if _upsert(session, a.get("title",""), a.get("description","")[:2000],
                           a.get("source",{}).get("name","NewsAPI"), url, pub):
                    written += 1
            session.commit()
        except Exception as exc:
            log.error("newsapi_failed kw=%s err=%s", kw, exc)
            session.rollback()
    return written


def run_all(session: Session) -> int:
    return fetch_rss(session) + fetch_newsapi(session)
