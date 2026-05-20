"use client";
import { useState } from "react";
import { useInvestments, useProviders } from "@/hooks/useDirectory";
import { InvestmentCard } from "@/components/directory/InvestmentCard";
import { SkeletonCard, EmptyState, ErrorBanner, RegBadge, Card } from "@/components/ui";
import type { Provider } from "@/types";

type Tab = "investments" | "providers";

const categoryFilters = [
  { key: "",             label: "All" },
  { key: "mmf",          label: "Money Market" },
  { key: "bond",         label: "Bonds" },
  { key: "tbill",        label: "T-Bills" },
  { key: "sacco_shares", label: "SACCOs" },
  { key: "stock",        label: "Stocks" },
  { key: "reit",         label: "REITs" },
  { key: "unit_trust",   label: "Unit Trusts" },
];

const riskFilters = [
  { key: "",       label: "Any risk" },
  { key: "low",    label: "Low risk" },
  { key: "medium", label: "Medium risk" },
  { key: "high",   label: "High risk" },
];

const providerTypeFilters = [
  { key: "",             label: "All types" },
  { key: "broker",       label: "Brokers" },
  { key: "fund_manager", label: "Fund Managers" },
  { key: "sacco",        label: "SACCOs" },
  { key: "bank",         label: "Banks" },
];

function ProviderCard({ p }: { p: Provider }) {
  const typeIcons: Record<string, string> = {
    broker:       "fa-handshake",
    fund_manager: "fa-layer-group",
    sacco:        "fa-people-group",
    bank:         "fa-building-columns",
    government:   "fa-landmark-flag",
  };

  return (
    <Card style={{ position: "relative", overflow: "hidden" }}>
      <i className={`fas ${typeIcons[p.type] ?? "fa-building"}`} style={{
        position: "absolute", right: "14px", top: "14px",
        fontSize: "28px", color: "var(--clr-border)", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
        <span style={{
          background: "var(--clr-sand)", color: "var(--clr-earth-d)",
          fontSize: "11px", fontWeight: 600,
          padding: "3px 8px", borderRadius: "99px", textTransform: "capitalize",
        }}>
          {p.type.replace("_", " ")}
        </span>
        <RegBadge status={p.regulation_status} regulator={p.regulated_by} />
        {p.beginner_friendly && (
          <span style={{
            background: "#EFF6FF", color: "#1D4ED8",
            fontSize: "11px", fontWeight: 600,
            padding: "3px 8px", borderRadius: "99px",
          }}>
            <i className="fas fa-star mr-1" style={{ fontSize: "9px" }} />
            Beginner friendly
          </span>
        )}
      </div>

      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", color: "var(--clr-charcoal)", marginBottom: "6px" }}>
        {p.name}
      </h3>

      {p.description && (
        <p style={{ fontSize: "13px", color: "var(--clr-muted)", lineHeight: 1.5, marginBottom: "10px" }}>
          {p.description}
        </p>
      )}

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "12px", color: "var(--clr-muted)" }}>
        {p.fees_text && (
          <span><i className="fas fa-percent mr-1" />{p.fees_text}</span>
        )}
        {p.website && (
          <a href={p.website} target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--clr-earth)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
            <i className="fas fa-arrow-up-right-from-square" style={{ fontSize: "10px" }} />
            Visit website
          </a>
        )}
      </div>
    </Card>
  );
}

export default function DirectoryPage() {
  const [tab, setTab]           = useState<Tab>("investments");
  const [category, setCategory] = useState("");
  const [riskLevel, setRisk]    = useState("");
  const [maxInvest, setMax]     = useState("");
  const [provType, setProvType] = useState("");
  const [beginnerOnly, setBeginner] = useState(false);
  const [search, setSearch]     = useState("");

  const invParams: Record<string, unknown> = {};
  if (category)  invParams.category = category;
  if (riskLevel) invParams.risk_level = riskLevel;
  if (maxInvest) invParams.max_min_investment = parseInt(maxInvest);

  const provParams: Record<string, unknown> = {};
  if (provType)    provParams.type = provType;
  if (beginnerOnly) provParams.beginner_friendly = true;

  const { data: investments, loading: invLoading, error: invError } = useInvestments(invParams);
  const { data: providers,   loading: provLoading, error: provError } = useProviders(provParams);

  const filteredInvestments = investments.filter(inv =>
    !inv.is_scam_flagged &&
    (!search || inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredProviders = providers.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: "99px", fontSize: "12px",
    fontWeight: active ? 600 : 400, cursor: "pointer",
    border: `1.5px solid ${active ? "var(--clr-earth)" : "var(--clr-border)"}`,
    background: active ? "var(--clr-earth)" : "var(--clr-surface)",
    color: active ? "var(--clr-sand)" : "var(--clr-charcoal)",
    transition: "all 0.18s", whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--clr-smoke)" }}>
      {/* Page header */}
      <div style={{
        background: "linear-gradient(160deg, var(--clr-earth-d), var(--clr-earth))",
        padding: "36px 20px 40px",
      }} className="grain">
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,36px)", color: "var(--clr-sand)", marginBottom: "6px" }}>
            Investment Directory
          </h1>
          <p style={{ color: "rgba(245,237,216,0.7)", fontSize: "15px", marginBottom: "20px" }}>
            Every provider and product here is verified against CMA, CBK, or SASRA records.
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: "440px" }}>
            <i className="fas fa-magnifying-glass" style={{
              position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
              color: "var(--clr-muted)", fontSize: "14px",
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or description…"
              style={{
                width: "100%", padding: "11px 14px 11px 40px",
                background: "rgba(255,255,255,0.95)",
                border: "none", borderRadius: "var(--radius)",
                fontSize: "14px", fontFamily: "var(--font-body)", outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
        {/* Tab switcher */}
        <div style={{
          display: "flex", gap: "4px", marginBottom: "24px",
          background: "var(--clr-surface)", borderRadius: "var(--radius)", padding: "4px",
          border: "1px solid var(--clr-border)", width: "fit-content",
        }}>
          {([["investments", "fa-coins", "Investments"], ["providers", "fa-building-columns", "Providers"]] as const).map(([key, icon, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "8px 20px", borderRadius: "calc(var(--radius) - 2px)",
              border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
              background: tab === key ? "var(--clr-earth)" : "transparent",
              color: tab === key ? "var(--clr-sand)" : "var(--clr-muted)",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <i className={`fas ${icon} text-xs`} /> {label}
            </button>
          ))}
        </div>

        {/* Investment filters */}
        {tab === "investments" && (
          <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
              <div style={{ display: "flex", gap: "6px", width: "max-content" }}>
                {categoryFilters.map(({ key, label }) => (
                  <button key={key} onClick={() => setCategory(key)} style={pillStyle(category === key)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              {riskFilters.map(({ key, label }) => (
                <button key={key} onClick={() => setRisk(key)} style={pillStyle(riskLevel === key)}>
                  {label}
                </button>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--clr-muted)", whiteSpace: "nowrap" }}>Max invest (KES)</span>
                <input
                  type="number" value={maxInvest} onChange={e => setMax(e.target.value)}
                  placeholder="50000"
                  style={{
                    width: "100px", padding: "6px 10px",
                    border: "1.5px solid var(--clr-border)", borderRadius: "var(--radius-sm)",
                    fontSize: "12px", fontFamily: "var(--font-body)", outline: "none",
                    background: "var(--clr-surface)",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Provider filters */}
        {tab === "providers" && (
          <div style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {providerTypeFilters.map(({ key, label }) => (
              <button key={key} onClick={() => setProvType(key)} style={pillStyle(provType === key)}>{label}</button>
            ))}
            <button onClick={() => setBeginner(!beginnerOnly)} style={pillStyle(beginnerOnly)}>
              <i className="fas fa-star mr-1 text-xs" /> Beginner friendly
            </button>
          </div>
        )}

        {/* Error */}
        {(invError || provError) && <ErrorBanner message={invError ?? provError ?? ""} />}

        {/* Results count */}
        {!invLoading && !provLoading && (
          <p style={{ fontSize: "13px", color: "var(--clr-muted)", marginBottom: "16px" }}>
            {tab === "investments"
              ? `${filteredInvestments.length} investment${filteredInvestments.length !== 1 ? "s" : ""} found`
              : `${filteredProviders.length} provider${filteredProviders.length !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/* Grid */}
        {tab === "investments" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }} className="stagger">
            {invLoading
              ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : filteredInvestments.length === 0
                ? <div style={{ gridColumn: "1/-1" }}>
                    <EmptyState icon="fa-filter" title="No investments match your filters" body="Try adjusting the category or risk level above." />
                  </div>
                : filteredInvestments.map(inv => <InvestmentCard key={inv.id} inv={inv} />)
            }
          </div>
        )}

        {tab === "providers" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }} className="stagger">
            {provLoading
              ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : filteredProviders.length === 0
                ? <div style={{ gridColumn: "1/-1" }}>
                    <EmptyState icon="fa-building-columns" title="No providers found" body="Try changing the type filter above." />
                  </div>
                : filteredProviders.map(p => <ProviderCard key={p.id} p={p} />)
            }
          </div>
        )}

        {/* Scam notice */}
        <div style={{
          marginTop: "32px", padding: "14px 16px",
          background: "#FEF9C3", border: "1px solid #FDE047",
          borderRadius: "var(--radius)", display: "flex", gap: "10px",
          fontSize: "13px", color: "#713F12",
        }}>
          <i className="fas fa-triangle-exclamation" style={{ flexShrink: 0, marginTop: "2px", color: "#CA8A04" }} />
          <span>
            <strong>Scam alert:</strong> Any investment promising returns above 20% per month is almost certainly a scam.
            Always verify at <a href="https://licensees.cma.or.ke" target="_blank" rel="noopener"
              style={{ color: "#713F12", fontWeight: 600 }}>licensees.cma.or.ke</a> or <a href="https://sasra.go.ke"
              target="_blank" rel="noopener" style={{ color: "#713F12", fontWeight: 600 }}>sasra.go.ke</a>.
          </span>
        </div>
      </div>
    </div>
  );
}
