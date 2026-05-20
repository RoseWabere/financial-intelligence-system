"use client";
import { useEffect, useState } from "react";
import { marketApi } from "@/lib/api";
import type { StockQuote, MacroIndicator } from "@/types";
import { SkeletonCard, ErrorBanner, Card } from "@/components/ui";

const TICKER_NAMES: Record<string, string> = {
  "SCOM.NR": "Safaricom",
  "EQTY.NR": "Equity Group",
  "KCB.NR":  "KCB Group",
  "COOP.NR": "Co-op Bank",
  "ABSA.NR": "ABSA Kenya",
  "EABL.NR": "EA Breweries",
  "BAT.NR":  "BAT Kenya",
  "JUB.NR":  "Jubilee Holdings",
};

const INDICATOR_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  cbr:               { label: "CBK Base Rate (CBR)", icon: "fa-percent",         color: "var(--clr-earth)" },
  inflation_cpi:     { label: "Inflation (CPI)",      icon: "fa-arrow-trend-up",  color: "var(--clr-clay)" },
  tbill_91d_yield:   { label: "91-day T-Bill Yield",  icon: "fa-landmark-flag",   color: "var(--clr-gold)" },
  tbill_182d_yield:  { label: "182-day T-Bill Yield", icon: "fa-landmark-flag",   color: "var(--clr-gold)" },
  tbill_364d_yield:  { label: "364-day T-Bill Yield", icon: "fa-landmark-flag",   color: "var(--clr-gold)" },
};

function StockRow({ quote }: { quote: StockQuote }) {
  const change = quote.open ? ((quote.close - quote.open) / quote.open) * 100 : 0;
  const up = change >= 0;
  const name = TICKER_NAMES[quote.ticker] ?? quote.ticker;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px",
      borderBottom: "1px solid var(--clr-border)",
      transition: "background 0.15s",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--clr-charcoal)" }}>{name}</div>
        <div style={{ fontSize: "11px", color: "var(--clr-muted)", marginTop: "1px" }}>{quote.ticker}</div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, color: "var(--clr-charcoal)" }}>
          {quote.close.toFixed(2)}
        </div>
        <div style={{
          fontSize: "12px", fontWeight: 600,
          color: up ? "#16A34A" : "var(--clr-clay)",
          display: "flex", alignItems: "center", gap: "3px", justifyContent: "flex-end",
        }}>
          <i className={`fas ${up ? "fa-caret-up" : "fa-caret-down"}`} />
          {Math.abs(change).toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

function MacroCard({ indicator }: { indicator: MacroIndicator }) {
  const meta = INDICATOR_LABELS[indicator.indicator];
  if (!meta) return null;

  return (
    <Card style={{ textAlign: "center" }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "10px",
        background: "var(--clr-sand)", margin: "0 auto 12px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <i className={`fas ${meta.icon}`} style={{ color: meta.color, fontSize: "16px" }} />
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "28px", fontWeight: 700,
        color: meta.color, lineHeight: 1,
        marginBottom: "4px",
      }}>
        {indicator.value.toFixed(1)}{indicator.unit}
      </div>
      <div style={{ fontSize: "12px", color: "var(--clr-muted)", lineHeight: 1.4 }}>
        {meta.label}
      </div>
      {indicator.recorded_date && (
        <div style={{ fontSize: "10px", color: "var(--clr-border)", marginTop: "6px" }}>
          as of {indicator.recorded_date}
        </div>
      )}
    </Card>
  );
}

export default function MarketPage() {
  const [stocks, setStocks]   = useState<StockQuote[]>([]);
  const [macro,  setMacro]    = useState<MacroIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    Promise.all([marketApi.stocks(), marketApi.macro()])
      .then(([s, m]) => {
        setStocks(s);
        setMacro(m);
        setLastUpdated(new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }));
      })
      .catch(() => setError("Could not load market data. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  const keyMacro = macro.filter(m => INDICATOR_LABELS[m.indicator]);
  // Deduplicate — keep latest per indicator
  const seenIndicators = new Set<string>();
  const uniqueMacro = keyMacro.filter(m => {
    if (seenIndicators.has(m.indicator)) return false;
    seenIndicators.add(m.indicator);
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--clr-smoke)" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(160deg, var(--clr-earth-d), var(--clr-earth))",
        padding: "36px 20px 40px",
      }} className="grain">
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,36px)", color: "var(--clr-sand)", marginBottom: "6px" }}>
                Market Data
              </h1>
              <p style={{ color: "rgba(245,237,216,0.7)", fontSize: "14px" }}>
                NSE stock prices and CBK macro indicators — updated every 15 minutes.
              </p>
            </div>
            {lastUpdated && (
              <div style={{ fontSize: "11px", color: "rgba(245,237,216,0.5)", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="fas fa-clock" /> Last updated {lastUpdated}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
        {error && <ErrorBanner message={error} />}

        {/* Macro indicators */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--clr-earth)", marginBottom: "14px" }}>
            <i className="fas fa-gauge-high mr-2" style={{ color: "var(--clr-gold)" }} />
            Key Economic Indicators
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }} className="stagger">
            {loading
              ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : uniqueMacro.map((m, i) => <MacroCard key={i} indicator={m} />)
            }
          </div>
          <p style={{ fontSize: "11px", color: "var(--clr-muted)", marginTop: "10px" }}>
            <i className="fas fa-circle-info mr-1" />
            Sources: Central Bank of Kenya (CBK), Kenya National Bureau of Statistics (KNBS)
          </p>
        </div>

        {/* NSE stocks */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--clr-earth)" }}>
              <i className="fas fa-arrow-trend-up mr-2" style={{ color: "var(--clr-gold)" }} />
              NSE Tracked Stocks
            </h2>
            <a href="https://live.mystocks.co.ke" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "12px", color: "var(--clr-earth)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              Full NSE <i className="fas fa-arrow-up-right-from-square text-xs" />
            </a>
          </div>

          <div style={{
            background: "var(--clr-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--clr-border)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}>
            {/* Table header */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 16px",
              background: "var(--clr-sand)",
              borderBottom: "1px solid var(--clr-border)",
              fontSize: "11px", fontWeight: 600, color: "var(--clr-muted)",
              letterSpacing: "0.06em",
            }}>
              <span>COMPANY</span>
              <span>PRICE (KES) / CHANGE</span>
            </div>

            {loading
              ? Array(6).fill(0).map((_, i) => (
                  <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid var(--clr-border)" }}>
                    <div className="skeleton" style={{ height: "14px", width: "50%", marginBottom: "6px" }} />
                    <div className="skeleton" style={{ height: "12px", width: "30%" }} />
                  </div>
                ))
              : stocks.length === 0
                ? <div style={{ padding: "40px", textAlign: "center", color: "var(--clr-muted)", fontSize: "14px" }}>
                    <i className="fas fa-chart-bar" style={{ fontSize: "28px", marginBottom: "10px", display: "block", color: "var(--clr-border)" }} />
                    No stock data yet — the worker fetches prices every 15 minutes.
                  </div>
                : stocks.map(q => <StockRow key={q.ticker} quote={q} />)
            }
          </div>

          <p style={{ fontSize: "11px", color: "var(--clr-muted)", marginTop: "10px" }}>
            <i className="fas fa-triangle-exclamation mr-1" style={{ color: "var(--clr-gold)" }} />
            Prices are delayed ~15 minutes. Not a recommendation to buy or sell. Source: Yahoo Finance.
          </p>
        </div>

        {/* T-bill opportunity callout */}
        <div style={{
          marginTop: "32px",
          background: "linear-gradient(135deg, var(--clr-earth-d), var(--clr-earth))",
          borderRadius: "var(--radius-lg)", padding: "20px 24px",
          display: "flex", gap: "16px", alignItems: "flex-start",
          color: "var(--clr-sand)",
        }}>
          <i className="fas fa-lightbulb" style={{ color: "var(--clr-gold)", fontSize: "22px", marginTop: "2px", flexShrink: 0 }} />
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", color: "var(--clr-gold)", marginBottom: "5px" }}>
              Did you know?
            </h3>
            <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(245,237,216,0.8)", margin: 0 }}>
              Kenya's 91-day Treasury Bill currently yields around <strong style={{ color: "var(--clr-gold)" }}>16–17% per year</strong> — 
              guaranteed by the government. That's higher than most savings accounts. 
              Minimum: KES 50,000 via the CBK DhowCSD platform.
            </p>
            <a href="https://dhowcsd.centralbank.go.ke" target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                marginTop: "10px", fontSize: "12px", fontWeight: 600,
                color: "var(--clr-gold)", textDecoration: "none",
              }}>
              Invest via DhowCSD <i className="fas fa-arrow-up-right-from-square text-xs" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
