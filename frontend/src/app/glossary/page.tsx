import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Glossary — Learn Investment Terms in Plain English",
  description: "Simple explanations of Kenyan investment terms — from MMF and T-bill to NAV and CDS. Many terms include Kiswahili translation.",
};

// Static glossary — matches seed_kb.py and can be extended
const GLOSSARY_TERMS = [
  {
    term: "Money Market Fund (MMF)",
    kiswahili: "Mfuko wa Masoko ya Pesa",
    definition: "A type of investment fund that pools your money with other investors and puts it into very safe, short-term savings instruments — like Treasury Bills and bank deposits. You can withdraw your money quickly (usually same day or next day). Returns are usually 8–14% per year. Great for emergency savings or money you might need soon.",
    example: "CIC, Britam, and Sanlam all offer MMFs you can invest in via M-Pesa from as little as KES 1,000.",
    tags: ["savings", "beginner"],
  },
  {
    term: "Treasury Bill (T-Bill)",
    kiswahili: "Dhamana ya Serikali (Muda Mfupi)",
    definition: "A short-term loan to the Kenyan government. You lend the government money for 91, 182, or 364 days, and they pay you back with interest. T-Bills are considered the safest investment in Kenya because the government guarantees them. Current yields: ~16–17% per year.",
    example: "Buy 91-day T-bills through the CBK DhowCSD platform (dhowcsd.centralbank.go.ke). Minimum: KES 50,000.",
    tags: ["government", "safe", "beginner"],
  },
  {
    term: "Treasury Bond",
    kiswahili: "Dhamana ya Serikali (Muda Mrefu)",
    definition: "Like a T-Bill but for longer periods — 2 to 30 years. The government pays you interest every 6 months (called a 'coupon'). Infrastructure Bonds (IFBs) are a special type that is tax-free for Kenyan residents, making them very attractive.",
    example: "A 5-year bond at 13.5% means you earn 13.5% of your investment every year in interest.",
    tags: ["government", "long-term"],
  },
  {
    term: "SACCO",
    kiswahili: "Chama cha Akiba na Mikopo",
    definition: "A Savings and Credit Co-operative — a member-owned financial group. You save regularly, earn dividends, and can borrow at low interest rates (usually 1% per month, much cheaper than a bank loan). SACCOs are regulated by SASRA. They're especially useful if you want to buy land or a house.",
    example: "Stima SACCO, Harambee SACCO, and Mwalimu National SACCO are some of Kenya's largest SACCOs.",
    tags: ["savings", "community", "beginner"],
  },
  {
    term: "REIT",
    kiswahili: "Uwekezaji wa Pamoja wa Mali Isiyohamishika",
    definition: "A Real Estate Investment Trust. You buy a small 'share' of a building or property portfolio. Instead of needing millions to buy a house, you can invest a small amount and earn rental income. REITs are listed on the NSE and are easy to buy and sell.",
    example: "Acorn REIT (ASSR) invests in student accommodation. You earn regular dividends without owning a physical property.",
    tags: ["real estate", "intermediate"],
  },
  {
    term: "NAV",
    kiswahili: "Thamani Halisi ya Kitengo",
    definition: "Net Asset Value. For a fund (like an MMF), this is the price of one 'unit' or share of the fund. If a fund's NAV goes up, your investment is worth more.",
    example: "If you own 1,000 units of a fund with NAV of KES 10.50, your investment is worth KES 10,500.",
    tags: ["funds"],
  },
  {
    term: "CDS Account",
    kiswahili: "Akaunti ya Hisa (Mfumo wa Kuhifadhi Hisa)",
    definition: "Central Depository System account. This is a special account you need to buy and hold shares on the NSE (Nairobi Securities Exchange). You open it through a CMA-licensed stockbroker. Think of it like a bank account, but for stocks.",
    example: "To buy Safaricom shares, you first open a CDS account with a licensed broker like Faida Investment Bank.",
    tags: ["stocks", "nse"],
  },
  {
    term: "DhowCSD",
    kiswahili: "Jukwaa la CBK la Dhamana",
    definition: "The Central Bank of Kenya's online platform for buying government securities directly. You can buy Treasury Bills and Bonds here without going through a broker, which saves on fees.",
    example: "Visit dhowcsd.centralbank.go.ke to create an account and buy your first T-Bill with KES 50,000.",
    tags: ["government", "platform"],
  },
  {
    term: "Dividend",
    kiswahili: "Mgawanyo wa Faida",
    definition: "Money paid to you as a shareholder from a company's profits. If you own Safaricom shares, Safaricom may pay you a dividend every year — your share of the company's profits.",
    example: "If Equity Group pays a dividend of KES 3 per share and you own 1,000 shares, you receive KES 3,000.",
    tags: ["stocks", "income"],
  },
  {
    term: "CMA",
    kiswahili: "Mamlaka ya Masoko ya Mitaji",
    definition: "Capital Markets Authority — the Kenyan government body that licenses and regulates stockbrokers, fund managers, REITs, and other investment companies. If a company is not on the CMA list, do not invest with them.",
    example: "Check if a broker is licensed at licensees.cma.or.ke before investing.",
    tags: ["regulation", "safety"],
  },
  {
    term: "SASRA",
    kiswahili: "Mamlaka ya Usimamizi wa SACCOs",
    definition: "Sacco Societies Regulatory Authority — the body that regulates SACCOs in Kenya. Only deposit money in a SASRA-registered SACCO.",
    example: "Verify your SACCO at sasra.go.ke before joining.",
    tags: ["regulation", "sacco"],
  },
  {
    term: "Diversification",
    kiswahili: "Utofauti wa Uwekezaji",
    definition: "Spreading your money across different types of investments so that if one loses value, you don't lose everything. The old saying: 'Don't put all your eggs in one basket.'",
    example: "Instead of putting KES 100,000 only in stocks, you might put KES 40,000 in an MMF, KES 40,000 in T-bills, and KES 20,000 in stocks.",
    tags: ["strategy", "beginner"],
  },
  {
    term: "Inflation",
    kiswahili: "Mfumuko wa Bei",
    definition: "The general rise in prices over time. If inflation is 5% and your savings earn 4%, you're actually losing purchasing power. This is why keeping money under a mattress is risky — its value shrinks every year.",
    example: "Kenya's inflation was about 4.4% in early 2026. A T-Bill yielding 16.9% beats inflation by a wide margin.",
    tags: ["economics", "beginner"],
  },
  {
    term: "CBR (Central Bank Rate)",
    kiswahili: "Kiwango cha Riba cha Benki Kuu",
    definition: "The interest rate set by the Central Bank of Kenya. It influences what banks charge for loans and what savings accounts pay. When CBR goes up, T-bill and bond yields typically go up too.",
    example: "When CBK raised the CBR to 10% in 2024, T-bill yields rose to near 17%.",
    tags: ["economics"],
  },
  {
    term: "Unit Trust / Collective Investment Scheme (CIS)",
    kiswahili: "Mfuko wa Uwekezaji wa Pamoja",
    definition: "A fund where many investors pool their money together, managed by a professional fund manager. You buy 'units' of the fund. Types include equity funds (invest in stocks), bond funds, and balanced funds. All CIS in Kenya are regulated by CMA.",
    example: "CIC Equity Fund pools many investors' money to buy a diversified portfolio of NSE stocks.",
    tags: ["funds", "beginner"],
  },
];

const ALL_TAGS = Array.from(new Set(GLOSSARY_TERMS.flatMap(t => t.tags))).sort();

export default async function GlossaryPage({ searchParams }: { searchParams: { q?: string; tag?: string } }) {
  const query = searchParams.q?.toLowerCase() ?? "";
  const tag   = searchParams.tag ?? "";

  const filtered = GLOSSARY_TERMS.filter(t => {
    const matchesSearch = !query ||
      t.term.toLowerCase().includes(query) ||
      t.definition.toLowerCase().includes(query) ||
      t.kiswahili?.toLowerCase().includes(query);
    const matchesTag = !tag || t.tags.includes(tag);
    return matchesSearch && matchesTag;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--clr-smoke)" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(160deg, var(--clr-earth-d), var(--clr-earth))",
        padding: "36px 20px 40px",
      }} className="grain">
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,36px)", color: "var(--clr-sand)", marginBottom: "8px" }}>
            Learn the basics
          </h1>
          <p style={{ color: "rgba(245,237,216,0.7)", fontSize: "15px", marginBottom: "20px" }}>
            Plain-language definitions for every investment term you'll encounter in Kenya. No jargon.
          </p>

          {/* Search */}
          <form method="GET" style={{ position: "relative", maxWidth: "420px" }}>
            <i className="fas fa-magnifying-glass" style={{
              position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
              color: "var(--clr-muted)", fontSize: "14px",
            }} />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search terms… e.g. 'SACCO' or 'bond'"
              style={{
                width: "100%", padding: "11px 14px 11px 40px",
                background: "rgba(255,255,255,0.95)",
                border: "none", borderRadius: "var(--radius)",
                fontSize: "14px", fontFamily: "var(--font-body)", outline: "none",
              }}
            />
          </form>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 20px" }}>
        {/* Tag filter pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
          <a href="/glossary" style={{
            padding: "5px 12px", borderRadius: "99px", fontSize: "12px",
            background: !tag ? "var(--clr-earth)" : "var(--clr-surface)",
            color: !tag ? "var(--clr-sand)" : "var(--clr-muted)",
            border: `1.5px solid ${!tag ? "var(--clr-earth)" : "var(--clr-border)"}`,
            fontWeight: !tag ? 600 : 400, textDecoration: "none", transition: "all 0.15s",
          }}>
            All
          </a>
          {ALL_TAGS.map(t => (
            <a key={t} href={`/glossary?tag=${t}${query ? `&q=${query}` : ""}`} style={{
              padding: "5px 12px", borderRadius: "99px", fontSize: "12px",
              background: tag === t ? "var(--clr-earth)" : "var(--clr-surface)",
              color: tag === t ? "var(--clr-sand)" : "var(--clr-muted)",
              border: `1.5px solid ${tag === t ? "var(--clr-earth)" : "var(--clr-border)"}`,
              fontWeight: tag === t ? 600 : 400, textDecoration: "none",
              textTransform: "capitalize", transition: "all 0.15s",
            }}>
              {t}
            </a>
          ))}
        </div>

        <p style={{ fontSize: "13px", color: "var(--clr-muted)", marginBottom: "20px" }}>
          {filtered.length} term{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Terms */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--clr-muted)" }}>
            <i className="fas fa-book-open" style={{ fontSize: "36px", marginBottom: "12px", display: "block", color: "var(--clr-border)" }} />
            <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--clr-charcoal)", marginBottom: "6px" }}>
              No terms found
            </p>
            <p style={{ fontSize: "14px" }}>Try a different search or <a href="/glossary" style={{ color: "var(--clr-earth)" }}>view all terms</a>.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }} className="stagger">
            {filtered.map((t) => (
              <div key={t.term} style={{
                background: "var(--clr-surface)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--clr-border)",
                padding: "20px",
                boxShadow: "var(--shadow-sm)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "6px" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "19px", color: "var(--clr-earth)", margin: 0 }}>
                    {t.term}
                  </h3>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {t.tags.map(tag => (
                      <a key={tag} href={`/glossary?tag=${tag}`} style={{
                        background: "var(--clr-sand)", color: "var(--clr-earth-d)",
                        fontSize: "10px", fontWeight: 600,
                        padding: "2px 8px", borderRadius: "99px",
                        textDecoration: "none", textTransform: "capitalize",
                      }}>
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>

                {t.kiswahili && (
                  <p style={{ fontSize: "12px", color: "var(--clr-gold)", fontStyle: "italic", marginBottom: "10px", fontWeight: 500 }}>
                    <i className="fas fa-language mr-1" /> {t.kiswahili}
                  </p>
                )}

                <p style={{ fontSize: "14px", color: "var(--clr-charcoal)", lineHeight: 1.7, marginBottom: "10px" }}>
                  {t.definition}
                </p>

                {t.example && (
                  <div style={{
                    background: "var(--clr-sand)", borderRadius: "var(--radius-sm)",
                    padding: "10px 14px", fontSize: "13px",
                    color: "var(--clr-earth-d)", lineHeight: 1.5,
                    borderLeft: "3px solid var(--clr-gold)",
                  }}>
                    <strong style={{ fontSize: "11px", fontWeight: 700, display: "block", marginBottom: "3px", letterSpacing: "0.05em" }}>
                      EXAMPLE
                    </strong>
                    {t.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ask AI CTA */}
        <div style={{
          marginTop: "32px", padding: "20px 24px",
          background: "var(--clr-surface)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--clr-border)", textAlign: "center",
        }}>
          <p style={{ color: "var(--clr-muted)", fontSize: "14px", marginBottom: "12px" }}>
            Can't find what you're looking for?
          </p>
          <a href="/chat" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "var(--clr-earth)", color: "var(--clr-sand)",
            padding: "10px 20px", borderRadius: "var(--radius)",
            fontWeight: 600, fontSize: "14px", textDecoration: "none",
          }}>
            <i className="fas fa-comments" /> Ask our AI assistant
          </a>
        </div>
      </div>
    </div>
  );
}
