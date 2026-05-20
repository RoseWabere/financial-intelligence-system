import type { Investment } from "@/types";
import { RegBadge, RiskBadge, Card } from "@/components/ui";

const categoryIcons: Record<string, string> = {
  mmf:          "fa-droplet",
  bond:         "fa-landmark",
  tbill:        "fa-landmark-flag",
  stock:        "fa-arrow-trend-up",
  sacco_shares: "fa-people-group",
  reit:         "fa-building",
  unit_trust:   "fa-layer-group",
  etf:          "fa-chart-bar",
};

const categoryLabels: Record<string, string> = {
  mmf:          "Money Market Fund",
  bond:         "Government Bond",
  tbill:        "Treasury Bill",
  stock:        "NSE Stock",
  sacco_shares: "SACCO",
  reit:         "REIT",
  unit_trust:   "Unit Trust",
  etf:          "ETF",
};

export function InvestmentCard({ inv }: { inv: Investment }) {
  if (inv.is_scam_flagged) return null;

  return (
    <Card style={{ position: "relative", overflow: "hidden" }}>
      {/* Category icon watermark */}
      <i className={`fas ${categoryIcons[inv.category] ?? "fa-coins"}`} style={{
        position: "absolute", right: "16px", top: "16px",
        fontSize: "32px", color: "var(--clr-border)", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
        <span style={{
          background: "var(--clr-sand)", color: "var(--clr-earth-d)",
          fontSize: "11px", fontWeight: 600,
          padding: "3px 8px", borderRadius: "99px",
        }}>
          {categoryLabels[inv.category] ?? inv.category}
        </span>
        <RiskBadge level={inv.risk_level} />
        <RegBadge status={inv.provider?.regulation_status ?? "unverified"} regulator={inv.regulator} />
      </div>

      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", color: "var(--clr-charcoal)", marginBottom: "4px" }}>
        {inv.name}
      </h3>

      {inv.provider && (
        <p style={{ fontSize: "12px", color: "var(--clr-muted)", marginBottom: "10px" }}>
          <i className="fas fa-building mr-1" /> {inv.provider.name}
        </p>
      )}

      {inv.description && (
        <p style={{ fontSize: "13px", color: "var(--clr-muted)", lineHeight: 1.5, marginBottom: "12px" }}>
          {inv.description}
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "13px" }}>
        {inv.expected_return_min !== null && (
          <div>
            <span style={{ color: "var(--clr-muted)", fontSize: "11px", display: "block" }}>Expected return</span>
            <strong style={{ color: "var(--clr-earth)" }}>
              {inv.expected_return_min}–{inv.expected_return_max}% p.a.
            </strong>
          </div>
        )}
        {inv.min_investment_kes !== null && (
          <div>
            <span style={{ color: "var(--clr-muted)", fontSize: "11px", display: "block" }}>Min. investment</span>
            <strong style={{ color: "var(--clr-charcoal)" }}>
              KES {inv.min_investment_kes.toLocaleString()}
            </strong>
          </div>
        )}
      </div>

      {inv.where_to_buy && (
        <div style={{
          marginTop: "12px", paddingTop: "10px",
          borderTop: "1px solid var(--clr-border)",
          fontSize: "12px", color: "var(--clr-muted)",
          display: "flex", alignItems: "flex-start", gap: "6px",
        }}>
          <i className="fas fa-location-dot" style={{ marginTop: "2px", color: "var(--clr-gold)", flexShrink: 0 }} />
          {inv.where_to_buy}
        </div>
      )}
    </Card>
  );
}
