"""
Seeds the knowledge base with initial Kenyan finance content:
glossary terms, product guides, and regulatory explainers.
Run once at setup: python -m app.scrapers.kb_seeder
"""
from __future__ import annotations

import ssl

import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal, engine
from app.models.models import Base, GlossaryTerm, KnowledgeChunk
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)

GLOSSARY = [
    {
        "term": "Money Market Fund (MMF)",
        "definition": (
            "A collective investment scheme that pools money from many investors and "
            "invests in short-term, low-risk instruments like government Treasury Bills, "
            "bank deposits, and commercial paper. In Kenya, MMFs are regulated by the CMA "
            "and typically yield 8–12% per annum. They are highly liquid — you can usually "
            "withdraw within 1–3 business days via M-Pesa or bank transfer."
        ),
        "kiswahili_term": "Mfuko wa Fedha za Muda Mfupi",
        "example": "CIC Money Market Fund, Britam MMF, Sanlam MMF",
    },
    {
        "term": "Treasury Bill (T-Bill)",
        "definition": (
            "A short-term government debt instrument issued by the Central Bank of Kenya (CBK) "
            "on behalf of the Government of Kenya. Available in 91-day, 182-day, and 364-day tenors. "
            "Sold at a discount to face value — the difference is your return. Minimum investment is "
            "KES 50,000. Purchased through CBK's DhowCSD platform or licensed banks/brokers. "
            "Considered virtually risk-free."
        ),
        "kiswahili_term": "Dhamana ya Serikali (Muda Mfupi)",
        "example": "91-day T-bill currently yielding ~11.5% p.a.",
    },
    {
        "term": "Treasury Bond",
        "definition": (
            "A medium-to-long-term government debt instrument issued by CBK, ranging from 2 to 30 years. "
            "Pays a fixed coupon (interest) every 6 months. Minimum investment KES 50,000. "
            "Can be bought through DhowCSD or secondary market (NSE). "
            "Infrastructure bonds (IFBs) offer tax-free coupon income."
        ),
        "kiswahili_term": "Dhamana ya Serikali (Muda Mrefu)",
    },
    {
        "term": "SACCO",
        "definition": (
            "Savings and Credit Cooperative Organisation. A member-owned financial cooperative "
            "where members save regularly and access loans at subsidised rates (typically 1% per month "
            "on reducing balance). SACCOs in Kenya are regulated by SASRA (Sacco Societies Regulatory "
            "Authority). Key benefit: you can borrow up to 3× your savings (shares + deposits). "
            "Dividends on share capital are typically 10–15% p.a."
        ),
        "kiswahili_term": "Chama cha Akiba na Mikopo",
        "example": "Stima SACCO, Harambee SACCO, Kenya Police SACCO",
    },
    {
        "term": "REIT",
        "definition": (
            "Real Estate Investment Trust. A company that owns, operates, or finances income-generating "
            "real estate. In Kenya, REITs are listed on the NSE and regulated by CMA. They allow "
            "ordinary investors to invest in real estate without directly buying property. "
            "There are two types: D-REITs (development) and I-REITs (income/rental). "
            "Listed REITs: Acorn Student Accommodation REIT (ASSR) and Fahari I-REIT (FAHR)."
        ),
        "kiswahili_term": "Uwekezaji wa Mali Isiyohamishika",
    },
    {
        "term": "NSE",
        "definition": (
            "Nairobi Securities Exchange. Kenya's main stock exchange, established in 1954. "
            "Lists over 60 companies across sectors including banking, telecoms, manufacturing, "
            "and agriculture. Key indices: NSE 20 Share Index, NSE 25 Share Index, FTSE NSE Kenya 25. "
            "Trading hours: Mon–Fri, 9:30am–3:00pm EAT. Regulated by CMA."
        ),
        "kiswahili_term": "Soko la Hisa la Nairobi",
    },
    {
        "term": "CMA",
        "definition": (
            "Capital Markets Authority. The statutory body that regulates and develops Kenya's "
            "capital markets. All brokers, fund managers, investment banks, REITs, and unit trusts "
            "must be licensed by CMA. Check CMA's licensee list at licensees.cma.or.ke before "
            "investing with any capital markets firm."
        ),
    },
    {
        "term": "CBK",
        "definition": (
            "Central Bank of Kenya. Issues government securities (T-bills, bonds), sets the Central "
            "Bank Rate (CBR) — Kenya's benchmark interest rate — and regulates commercial banks. "
            "The DhowCSD platform (centralbank.go.ke) allows retail investors to buy T-bills and "
            "bonds directly."
        ),
    },
    {
        "term": "Unit Trust",
        "definition": (
            "A collective investment scheme where investors pool funds managed by a professional "
            "fund manager. Types: equity funds (invest in shares), balanced funds (shares + bonds), "
            "fixed income funds (bonds/T-bills), and money market funds. CMA-regulated. "
            "Lower minimum investment than direct stock market participation — some start at KES 1,000."
        ),
        "kiswahili_term": "Mfuko wa Pamoja",
    },
    {
        "term": "Inflation",
        "definition": (
            "The rate at which the general level of prices for goods and services rises over time, "
            "eroding purchasing power. Kenya's inflation is measured by Kenya National Bureau of "
            "Statistics (KNBS) through the Consumer Price Index (CPI). As of early 2026, Kenya's "
            "inflation is approximately 4–5%. When choosing investments, aim for returns that beat "
            "inflation to grow your real wealth."
        ),
    },
]

KNOWLEDGE_CHUNKS = [
    {
        "content": (
            "How to start investing in Kenya with KES 1,000–10,000: "
            "Begin with a Money Market Fund accessible via M-Pesa — providers like CIC, Britam, "
            "and Sanlam accept as little as KES 100–1,000. This builds the habit of saving while "
            "earning 8–12% p.a. Once you have 3 months' expenses saved, explore Treasury Bills "
            "via CBK DhowCSD (minimum KES 50,000) for higher guaranteed returns."
        ),
        "source": "Kenya Fintel Knowledge Base",
        "category": "product_guide",
    },
    {
        "content": (
            "How to open a CBK DhowCSD account to buy T-bills and bonds: "
            "1. Visit centralbank.go.ke and register for a DhowCSD account online. "
            "2. Provide your national ID/passport and KRA PIN. "
            "3. Link a bank account or M-Pesa number. "
            "4. Bid in the weekly auction (91-day, 182-day, or 364-day T-bills) or "
            "subscribe to an active bond. Minimum investment: KES 50,000. "
            "Competitive bids let you specify your desired rate; non-competitive bids "
            "accept the weighted average rate."
        ),
        "source": "CBK DhowCSD Guide",
        "category": "product_guide",
    },
    {
        "content": (
            "M-Akiba: Kenya's mobile-first government bond. "
            "M-Akiba allows Kenyans to invest in government bonds using M-Pesa with a minimum "
            "of just KES 3,000 — the lowest entry point for government securities in Kenya. "
            "It offers tax-free returns of around 10% p.a. Subscription and trading are done "
            "entirely via M-Pesa *384#. Ideal for low-income investors who cannot afford "
            "the standard KES 50,000 minimum."
        ),
        "source": "CBK / Safaricom M-Akiba",
        "category": "product_guide",
    },
    {
        "content": (
            "Scam alert: Warning signs of fraudulent investment schemes in Kenya. "
            "Be extremely cautious of: (1) Promises of fixed returns above 20–30% per month. "
            "(2) Schemes that require recruiting new members to earn (pyramid/MLM structure). "
            "(3) Companies not listed on CMA's licensee register at licensees.cma.or.ke. "
            "(4) Pressure to invest quickly with 'limited time' offers. "
            "(5) WhatsApp-only groups promising land or forex profits. "
            "Always verify any investment firm with CMA (+254 722 207 767) before committing funds."
        ),
        "source": "CMA Investor Education",
        "category": "regulation",
    },
    {
        "content": (
            "Comparing investment options for a Kenyan earning KES 30,000–60,000/month: "
            "Priority 1 — Emergency fund in MMF (3 months expenses, ~KES 90,000–180,000). "
            "Priority 2 — Join a SACCO to build savings and access cheap loans for housing. "
            "Priority 3 — Buy 91-day T-bills via DhowCSD for safe returns above inflation. "
            "Priority 4 — Once you have KES 200,000+, consider a diversified NSE equity unit trust. "
            "Avoid borrowing to invest in volatile assets like stocks or crypto."
        ),
        "source": "Kenya Fintel Knowledge Base",
        "category": "product_guide",
    },
    {
        "content": (
            "Understanding NSE stock investing for beginners in Kenya: "
            "To buy shares on the NSE, you need: (1) A CDS (Central Depository and Settlement) "
            "account — opened through any CMA-licensed stockbroker. (2) The broker places buy/sell "
            "orders on your behalf. (3) Settlement is T+3 (3 business days). "
            "Popular beginner stocks: Safaricom (SCOM) — Kenya's largest company by market cap; "
            "Equity Group (EQTY) and KCB Group (KCB) — Kenya's largest banks. "
            "Consider equity unit trusts if you cannot monitor individual stocks."
        ),
        "source": "NSE / CMA Investor Guide",
        "category": "product_guide",
    },
    {
        "content": (
            "Kenya Infrastructure Bonds (IFBs): Tax-free investment opportunity. "
            "Infrastructure bonds are a special class of Treasury Bonds issued by the Government "
            "of Kenya to fund infrastructure projects. Key benefit: coupon income is EXEMPT from "
            "withholding tax (unlike regular bonds taxed at 15%). This makes the effective yield "
            "higher than the headline rate. Minimum KES 50,000 via DhowCSD. "
            "Tenors range from 5 to 25 years. Track upcoming IFB auctions on CBK's website."
        ),
        "source": "CBK IFB Documentation",
        "category": "product_guide",
    },
    {
        "content": (
            "SASRA-regulated SACCOs in Kenya: How to verify and join safely. "
            "SASRA (Sacco Societies Regulatory Authority) oversees deposit-taking SACCOs. "
            "Before joining any SACCO: (1) Verify it is SASRA-licensed at sasra.go.ke. "
            "(2) Check its most recent financial report (SACCOs publish annual reports). "
            "(3) Understand the membership requirements — most are employer-based or community-based. "
            "Deposit Protection Fund: SACCO members' deposits are protected up to KES 100,000 "
            "per member per SACCO by the Kenya Deposit Insurance Corporation (KDIC) equivalent for SACCOs."
        ),
        "source": "SASRA Investor Guide",
        "category": "regulation",
    },
]


async def seed_knowledge_base(db: AsyncSession) -> None:
    logger.info("Seeding glossary (%d terms)...", len(GLOSSARY))
    for entry in GLOSSARY:
        existing = await db.get(GlossaryTerm, entry["term"])
        if not existing:
            db.add(GlossaryTerm(
                term=entry["term"],
                definition=entry["definition"],
                kiswahili_term=entry.get("kiswahili_term"),
                example=entry.get("example"),
            ))

    await db.commit()
    logger.info("Seeding knowledge chunks (%d chunks)...", len(KNOWLEDGE_CHUNKS))

    for chunk_data in KNOWLEDGE_CHUNKS:
        embedding = embedding_service.encode_single(chunk_data["content"])
        db.add(KnowledgeChunk(
            content=chunk_data["content"],
            source=chunk_data["source"],
            category=chunk_data["category"],
            embedding=embedding,
        ))

    # Also embed glossary definitions as searchable chunks
    for entry in GLOSSARY:
        text = f"{entry['term']}: {entry['definition']}"
        embedding = embedding_service.encode_single(text)
        db.add(KnowledgeChunk(
            content=text,
            source="Glossary",
            category="glossary",
            embedding=embedding,
            extra={"term": entry["term"]},
        ))

    await db.commit()
    logger.info("Knowledge base seeded successfully.")


async def main():
    logging.basicConfig(level=logging.INFO)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await seed_knowledge_base(db)


if __name__ == "__main__":
    asyncio.run(main())
