"""
Seed script — loads a starter knowledge base into knowledge_chunks.
Run once after migrations: python scripts/seed_kb.py

Covers: MMFs, T-bills, Bonds, SACCOs, REITs, NSE basics, glossary.
"""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.models import GlossaryTerm, KnowledgeChunk, Provider, Investment
from app.services.embedding_service import embedding_service

engine = create_engine(os.environ["DATABASE_URL_SYNC"])
Session = sessionmaker(bind=engine)

KNOWLEDGE_CHUNKS = [
    {
        "content": (
            "A Money Market Fund (MMF) in Kenya is a CMA-regulated collective investment scheme "
            "that pools investor funds into short-term, low-risk instruments like Treasury Bills, "
            "commercial paper, and bank deposits. MMFs typically yield 8–14% per annum and offer "
            "daily liquidity — you can withdraw funds the same day or next business day. "
            "Minimum investment is often as low as KES 1,000. Examples: CIC MMF, Sanlam MMF, "
            "Britam MMF, GenAfrica MMF, Old Mutual MMF."
        ),
        "source": "CMA Kenya / Fund Manager Brochures",
        "category": "product_guide",
    },
    {
        "content": (
            "Kenya Treasury Bills (T-bills) are short-term government debt instruments issued by "
            "the Central Bank of Kenya (CBK) on behalf of the government. They come in 91-day, "
            "182-day, and 364-day tenors. As of April 2026, yields are approximately: "
            "91-day: 16.9%, 182-day: 16.4%, 364-day: 15.9%. "
            "Minimum investment is KES 50,000. You buy them via the CBK DhowCSD platform "
            "(dhowcsd.centralbank.go.ke) or through a licensed bank or broker. "
            "T-bills are considered the safest investment in Kenya — backed by the government."
        ),
        "source": "Central Bank of Kenya",
        "category": "product_guide",
    },
    {
        "content": (
            "Treasury Bonds in Kenya are medium-to-long-term government securities with maturities "
            "ranging from 2 to 30 years. They pay a fixed coupon (interest) semi-annually. "
            "Coupon rates have ranged from 12–16% in recent years. Minimum investment: KES 50,000. "
            "Infrastructure Bonds (IFBs) are tax-exempt for resident individuals — meaning the "
            "interest income is not subject to withholding tax, making them very attractive. "
            "Buy via CBK DhowCSD platform directly or through Nairobi Securities Exchange brokers."
        ),
        "source": "Central Bank of Kenya",
        "category": "product_guide",
    },
    {
        "content": (
            "SACCOs (Savings and Credit Co-operative Organisations) are member-owned financial "
            "cooperatives regulated by SASRA (Sacco Societies Regulatory Authority). "
            "They offer savings accounts, share capital deposits, and loans at subsidised rates "
            "(typically 1% per month = 12% p.a. on reducing balance — much lower than bank loans). "
            "Members can borrow up to 3× their deposits. Popular SACCOs in Kenya include: "
            "Stima SACCO, Harambee SACCO, Mwalimu National SACCO, Kenya National Police SACCO, "
            "Unaitas. SACCOs are excellent for goal-based saving (home, education, land)."
        ),
        "source": "SASRA Kenya",
        "category": "product_guide",
    },
    {
        "content": (
            "REITs (Real Estate Investment Trusts) in Kenya are CMA-regulated investment vehicles "
            "that allow investors to own fractional shares of income-generating real estate. "
            "Listed on the NSE. Two main Kenyan REITs: "
            "1) Acorn Student Accommodation REIT (ASSR) — invests in purpose-built student housing. "
            "2) Fahari I-REIT (FAHR) — commercial real estate. "
            "REITs must distribute at least 80% of net income as dividends. "
            "They provide real estate exposure with stock market liquidity. "
            "Minimum investment: one unit (priced at NSE market rate)."
        ),
        "source": "CMA Kenya / NSE",
        "category": "product_guide",
    },
    {
        "content": (
            "The Nairobi Securities Exchange (NSE) is Kenya's main stock exchange, established in 1954. "
            "It lists over 60 companies across sectors including banking, telecom, energy, and manufacturing. "
            "Major listed companies: Safaricom (SCOM) — Kenya's largest by market cap, "
            "Equity Group (EQTY), KCB Group (KCB), Co-operative Bank (COOP), "
            "East African Breweries (EABL). "
            "The NSE 20 Share Index and NSE All Share Index (NASI) track market performance. "
            "To invest, open a CDS (Central Depository System) account through a CMA-licensed broker."
        ),
        "source": "Nairobi Securities Exchange",
        "category": "product_guide",
    },
    {
        "content": (
            "How to start investing in Kenya with KES 1,000–10,000:\n"
            "1. Emergency fund first — keep 3 months of expenses in an MMF (accessible via M-Pesa).\n"
            "2. MMF: Open a CIC, Sanlam, or Britam MMF account online. Deposit via M-Pesa. "
            "Earns ~10–14% p.a. fully liquid.\n"
            "3. SACCO: Join a workplace or community SACCO. Contribute monthly to build shares "
            "and qualify for low-interest loans.\n"
            "4. When you have KES 50,000+: invest in 91-day T-bills via CBK DhowCSD.\n"
            "5. Long-term (5+ years): Consider NSE equities via a CMA-licensed broker or "
            "a unit trust equity fund."
        ),
        "source": "Kenya Financial Literacy Guide",
        "category": "educational",
    },
    {
        "content": (
            "M-Akiba is a mobile government bond in Kenya that allows Kenyans to invest "
            "in Treasury Bonds directly via M-Pesa with as little as KES 3,000. "
            "It was issued by the Kenyan government to democratise government securities access. "
            "Interest is paid every 6 months directly to your M-Pesa. Tax-free for Kenyan residents. "
            "Check the CBK or M-Pesa app for current availability and rates."
        ),
        "source": "CBK / Safaricom M-Pesa",
        "category": "product_guide",
    },
    {
        "content": (
            "Beware of investment scams in Kenya. Common red flags:\n"
            "- Promises of returns above 20% per month (legitimate investments yield 10–16% per YEAR).\n"
            "- Pyramid or Multi-Level Marketing (MLM) schemes where returns depend on recruiting others.\n"
            "- Unregulated entities (not listed on CMA or SASRA websites).\n"
            "- Pressure to invest quickly without time to research.\n"
            "- Requests for M-Pesa payments to personal numbers instead of company accounts.\n"
            "Always verify a provider at: licensees.cma.or.ke (brokers, funds) or sasra.go.ke (SACCOs)."
        ),
        "source": "CMA Kenya / SASRA Investor Education",
        "category": "regulation",
    },
    {
        "content": (
            "Unit Trusts (also called Collective Investment Schemes / CIS) in Kenya are "
            "CMA-regulated pooled investment funds managed by licensed fund managers. "
            "Types available: Equity Funds, Bond Funds, Balanced Funds, Money Market Funds. "
            "Leading managers: CIC Asset Management, Britam Asset Managers, Old Mutual Investment, "
            "Sanlam Investments, GenAfrica Asset Managers, Zimele Asset Management. "
            "Unit trusts are ideal for investors who want diversification without picking individual stocks. "
            "Returns vary by fund type: equity funds 10–25% p.a. long-term; bond funds 12–16% p.a."
        ),
        "source": "CMA Kenya",
        "category": "product_guide",
    },
]

GLOSSARY = [
    ("NAV", "Net Asset Value — the per-unit value of a fund, calculated as total assets minus liabilities divided by number of units.", "Thamani Halisi ya Kitengo"),
    ("Yield", "The income return on an investment, expressed as a percentage of cost or market value.", "Mapato"),
    ("Liquidity", "The ease with which an asset can be converted to cash without significant loss in value. MMFs are highly liquid; real estate is illiquid.", "Uwezo wa Kubadilisha Kuwa Pesa"),
    ("Diversification", "Spreading investments across different asset types to reduce risk.", "Utofauti wa Uwekezaji"),
    ("CDS Account", "Central Depository System account — required to hold NSE-listed shares electronically in Kenya.", "Akaunti ya Hisa"),
    ("DhowCSD", "The CBK's online platform for retail investors to buy Treasury Bills and Bonds directly.", "Jukwaa la CBK la Dhamana"),
    ("Coupon Rate", "The annual interest rate paid by a bond, expressed as a percentage of face value.", "Kiwango cha Riba ya Dhamana"),
    ("Risk Profile", "An assessment of an investor's willingness and ability to accept investment losses.", "Kiwango cha Uvumilivu wa Hatari"),
    ("SASRA", "Sacco Societies Regulatory Authority — the Kenyan government body that regulates and supervises SACCOs.", "Mamlaka ya Usimamizi wa SACCOs"),
    ("CMA", "Capital Markets Authority — Kenya's regulator for capital markets, including brokers, fund managers, and REITs.", "Mamlaka ya Masoko ya Mitaji"),
]

SEED_PROVIDERS = [
    {"name": "CIC Asset Management", "type": "fund_manager", "regulated_by": "CMA", "regulation_status": "verified", "beginner_friendly": True, "website": "https://cic.co.ke"},
    {"name": "Britam Asset Managers", "type": "fund_manager", "regulated_by": "CMA", "regulation_status": "verified", "beginner_friendly": True, "website": "https://britam.com"},
    {"name": "Sanlam Investments Kenya", "type": "fund_manager", "regulated_by": "CMA", "regulation_status": "verified", "beginner_friendly": True, "website": "https://sanlaminvestments.com"},
    {"name": "Old Mutual Investment Group", "type": "fund_manager", "regulated_by": "CMA", "regulation_status": "verified", "beginner_friendly": True, "website": "https://oldmutual.co.ke"},
    {"name": "Faida Investment Bank", "type": "broker", "regulated_by": "CMA", "regulation_status": "verified", "beginner_friendly": True, "website": "https://faidainvestment.com"},
    {"name": "Sterling Capital", "type": "broker", "regulated_by": "CMA", "regulation_status": "verified", "beginner_friendly": False, "website": "https://sterlingcapital.co.ke"},
    {"name": "Stima SACCO", "type": "sacco", "regulated_by": "SASRA", "regulation_status": "verified", "beginner_friendly": True, "website": "https://stimasacco.com"},
    {"name": "Harambee SACCO", "type": "sacco", "regulated_by": "SASRA", "regulation_status": "verified", "beginner_friendly": True, "website": "https://harambeesacco.com"},
    {"name": "Mwalimu National SACCO", "type": "sacco", "regulated_by": "SASRA", "regulation_status": "verified", "beginner_friendly": True, "website": "https://mwalimu.co.ke"},
    {"name": "Central Bank of Kenya", "type": "government", "regulated_by": "CBK", "regulation_status": "verified", "beginner_friendly": True, "website": "https://centralbank.go.ke"},
]

SEED_INVESTMENTS = [
    {"name": "91-Day Treasury Bill", "category": "tbill", "risk_level": "low", "expected_return_min": 16.5, "expected_return_max": 17.5, "min_investment_kes": 50000, "regulator": "CBK", "where_to_buy": "CBK DhowCSD (dhowcsd.centralbank.go.ke)", "description": "Short-term government security. Safest investment in Kenya."},
    {"name": "182-Day Treasury Bill", "category": "tbill", "risk_level": "low", "expected_return_min": 16.0, "expected_return_max": 17.0, "min_investment_kes": 50000, "regulator": "CBK", "where_to_buy": "CBK DhowCSD", "description": "6-month government T-bill."},
    {"name": "Infrastructure Bond (IFB)", "category": "bond", "risk_level": "low", "expected_return_min": 13.5, "expected_return_max": 15.5, "min_investment_kes": 50000, "regulator": "CBK", "where_to_buy": "CBK DhowCSD or NSE broker", "description": "Tax-exempt bond funding infrastructure. Semi-annual coupon payments."},
    {"name": "CIC Money Market Fund", "category": "mmf", "risk_level": "low", "expected_return_min": 10.0, "expected_return_max": 14.0, "min_investment_kes": 1000, "regulator": "CMA", "where_to_buy": "CIC app or M-Pesa", "description": "Highly liquid MMF. Same-day or next-day withdrawal."},
    {"name": "Britam Money Market Fund", "category": "mmf", "risk_level": "low", "expected_return_min": 9.5, "expected_return_max": 13.5, "min_investment_kes": 1000, "regulator": "CMA", "where_to_buy": "Britam app or online portal", "description": "Liquid MMF by Britam Asset Managers."},
    {"name": "Acorn REIT (ASSR)", "category": "reit", "risk_level": "medium", "expected_return_min": 7.0, "expected_return_max": 12.0, "min_investment_kes": 500, "regulator": "CMA", "where_to_buy": "NSE via CMA-licensed broker", "description": "Student accommodation REIT. Dividend income + capital appreciation."},
    {"name": "Safaricom PLC (SCOM)", "category": "stock", "risk_level": "medium", "expected_return_min": 8.0, "expected_return_max": 20.0, "min_investment_kes": 1000, "regulator": "CMA", "where_to_buy": "NSE via CMA-licensed broker", "description": "Kenya's largest company by market cap. Telecom + M-Pesa fintech."},
    {"name": "SACCO Shares (general)", "category": "sacco_shares", "risk_level": "low", "expected_return_min": 8.0, "expected_return_max": 14.0, "min_investment_kes": 500, "regulator": "SASRA", "where_to_buy": "Join a SASRA-registered SACCO", "description": "Member shares in a SACCO. Earn dividends and access subsidised loans."},
]


def seed(session):
    print("Seeding knowledge chunks...")
    for chunk_data in KNOWLEDGE_CHUNKS:
        emb = embedding_service.encode_single(chunk_data["content"])
        session.add(KnowledgeChunk(embedding=emb, **chunk_data))
    session.commit()
    print(f"  {len(KNOWLEDGE_CHUNKS)} knowledge chunks written")

    print("Seeding glossary...")
    for term, definition, kiswahili in GLOSSARY:
        if not session.get(GlossaryTerm, term):
            session.add(GlossaryTerm(term=term, definition=definition, kiswahili_term=kiswahili))
    session.commit()
    print(f"  {len(GLOSSARY)} glossary terms written")

    print("Seeding providers...")
    for p in SEED_PROVIDERS:
        from sqlalchemy import select
        existing = session.execute(select(Provider).where(Provider.name == p["name"])).scalar_one_or_none()
        if not existing:
            session.add(Provider(**p))
    session.commit()
    print(f"  {len(SEED_PROVIDERS)} providers written")

    print("Seeding investments...")
    for inv in SEED_INVESTMENTS:
        session.add(Investment(**inv))
    session.commit()
    print(f"  {len(SEED_INVESTMENTS)} investments written")

    print("Seed complete.")


if __name__ == "__main__":
    with Session() as s:
        seed(s)
