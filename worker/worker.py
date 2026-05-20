"""
Worker process — APScheduler cron jobs for data ingestion + data retention.

  Every 15 min  → NSE stock prices
  Every 30 min  → News ingestion
  Daily 06:00   → CBK macro indicators
  Daily 07:00   → CMA providers
  Daily 02:00   → Data pruning (retention policies)
"""
import logging
import os
import sys

from apscheduler.schedulers.blocking import BlockingScheduler
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings
from app.scrapers import cbk_scraper, cma_scraper, news_scraper, yahoo_finance

# ============================================================
# Logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
log = logging.getLogger("worker")

# ============================================================
# DB

engine = create_engine(settings.DATABASE_URL_SYNC, pool_pre_ping=True)
Session = sessionmaker(bind=engine)

# ============================================================
# Retention Policies (CONFIG-DRIVEN)

RETENTION_POLICIES = {
    "news_articles": {"days": 30},
    "stock_prices": {"days": 90},
    "chat_messages": {"keep_last": 50},
    "knowledge_chunks": {"expiry_field": "valid_until"},
}

# ============================================================
# Jobs


def job_stocks():
    with Session() as s:
        n = yahoo_finance.fetch_and_upsert(s, days_back=2)
    log.info("stocks done rows=%d", n)


def job_news():
    with Session() as s:
        n = news_scraper.run_all(s)
    log.info("news done written=%d", n)


def job_cbk():
    with Session() as s:
        n = cbk_scraper.fetch_and_store(s)
    log.info("cbk done written=%d", n)


def job_cma():
    with Session() as s:
        n = cma_scraper.upsert_providers(s)
    log.info("cma done upserted=%d", n)


# ============================================================
# Retention Engine


def prune_old_data():
    with Session() as s:
        try:
            total_deleted = 0

            # --- News ---
            if "news_articles" in RETENTION_POLICIES:
                days = RETENTION_POLICIES["news_articles"]["days"]
                result = s.execute(text(f"""
                    DELETE FROM news_articles
                    WHERE published_at < NOW() - INTERVAL '{days} days'
                """))
                total_deleted += result.rowcount or 0

            # --- Stock Prices ---
            if "stock_prices" in RETENTION_POLICIES:
                days = RETENTION_POLICIES["stock_prices"]["days"]
                result = s.execute(text(f"""
                    DELETE FROM stock_prices
                    WHERE price_date < CURRENT_DATE - INTERVAL '{days} days'
                """))
                total_deleted += result.rowcount or 0

            # --- Chat Messages ---
            if "chat_messages" in RETENTION_POLICIES:
                keep_last = RETENTION_POLICIES["chat_messages"]["keep_last"]
                result = s.execute(text(f"""
                    DELETE FROM chat_messages
                    WHERE id NOT IN (
                        SELECT id FROM (
                            SELECT id,
                                   ROW_NUMBER() OVER (
                                       PARTITION BY session_id
                                       ORDER BY created_at DESC
                                   ) AS rn
                            FROM chat_messages
                        ) t
                        WHERE rn <= {keep_last}
                    )
                """))
                total_deleted += result.rowcount or 0

            # --- Knowledge Chunks ---
            if "knowledge_chunks" in RETENTION_POLICIES:
                field = RETENTION_POLICIES["knowledge_chunks"]["expiry_field"]
                result = s.execute(text(f"""
                    DELETE FROM knowledge_chunks
                    WHERE {field} IS NOT NULL
                      AND {field} < CURRENT_DATE
                """))
                total_deleted += result.rowcount or 0

            s.commit()
            log.info("prune completed | rows_deleted=%d", total_deleted)

        except Exception as e:
            s.rollback()
            log.exception("prune failed: %s", e)


# ============================================================
# Scheduler


if __name__ == "__main__":
    scheduler = BlockingScheduler(timezone="Africa/Nairobi")

    scheduler.add_job(job_stocks, "interval", minutes=15, id="stocks")
    scheduler.add_job(job_news,   "interval", minutes=30, id="news")
    scheduler.add_job(job_cbk,    "cron", hour=6, minute=0, id="cbk")
    scheduler.add_job(job_cma,    "cron", hour=7, minute=0, id="cma")

    # Retention system
    scheduler.add_job(prune_old_data, "cron", hour=2, minute=0, id="prune")

    # Warm start
    job_cbk()
    job_stocks()
    job_news()

    log.info("scheduler_started timezone=Africa/Nairobi")
    scheduler.start()