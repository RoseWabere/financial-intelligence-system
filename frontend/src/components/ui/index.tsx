import { ReactNode } from "react";

// ── Skeleton ──────────────────────────────────────────────────
export function SkeletonLine({ w = "100%", h = "16px" }: { w?: string; h?: string }) {
  return <div className="skeleton" style={{ width: w, height: h, marginBottom: "8px" }} />;
}

export function SkeletonCard() {
  return (
    <div style={{
      background: "var(--clr-surface)", borderRadius: "var(--radius-lg)",
      padding: "20px", border: "1px solid var(--clr-border)"
    }}>
      <SkeletonLine w="60%" h="20px" />
      <SkeletonLine w="40%" h="14px" />
      <SkeletonLine w="100%" h="14px" />
      <SkeletonLine w="80%" h="14px" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: "14px", width: i === lines - 1 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}

// ── Regulation badge ──────────────────────────────────────────
export function RegBadge({ status, regulator }: {
  status: "verified" | "unverified" | "flagged";
  regulator?: string | null;
}) {
  if (status === "flagged") return (
    <span style={{
      background: "#FEE2E2", color: "var(--clr-clay)",
      fontSize: "11px", fontWeight: 600,
      padding: "3px 8px", borderRadius: "99px",
      display: "inline-flex", alignItems: "center", gap: "4px",
    }}>
      <i className="fas fa-triangle-exclamation" /> POSSIBLY RISKY
    </span>
  );
  if (status === "verified") return (
    <span style={{
      background: "#DCFCE7", color: "var(--clr-earth)",
      fontSize: "11px", fontWeight: 600,
      padding: "3px 8px", borderRadius: "99px",
      display: "inline-flex", alignItems: "center", gap: "4px",
    }}>
      <i className="fas fa-circle-check" /> {regulator ? `Verified · ${regulator}` : "Verified"}
    </span>
  );
  return (
    <span style={{ fontSize: "11px", color: "var(--clr-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <i className="fas fa-circle-question" /> Unverified
    </span>
  );
}

// ── Risk badge ────────────────────────────────────────────────
const riskColors = {
  low:    { bg: "#DCFCE7", fg: "#166534" },
  medium: { bg: "#FEF9C3", fg: "#854D0E" },
  high:   { bg: "#FEE2E2", fg: "#991B1B" },
};

export function RiskBadge({ level }: { level: "low" | "medium" | "high" | null }) {
  if (!level) return null;
  const { bg, fg } = riskColors[level];
  return (
    <span style={{
      background: bg, color: fg,
      fontSize: "11px", fontWeight: 600, textTransform: "capitalize",
      padding: "3px 8px", borderRadius: "99px",
    }}>
      {level} risk
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, className = "", style = {} }: {
  children: ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={{
      background: "var(--clr-surface)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--clr-border)",
      boxShadow: "var(--shadow-sm)",
      padding: "20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────
export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,32px)", color: "var(--clr-earth)", marginBottom: "6px" }}>
        {title}
      </h2>
      {sub && <p style={{ color: "var(--clr-muted)", fontSize: "15px" }}>{sub}</p>}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({ icon, title, body }: { icon: string; title: string; body?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--clr-muted)" }}>
      <i className={`fas ${icon}`} style={{ fontSize: "36px", marginBottom: "16px", display: "block", color: "var(--clr-border)" }} />
      <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--clr-charcoal)", marginBottom: "8px" }}>{title}</p>
      {body && <p style={{ fontSize: "14px" }}>{body}</p>}
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius)",
      padding: "12px 16px", marginBottom: "16px",
      display: "flex", alignItems: "center", gap: "8px",
      color: "#991B1B", fontSize: "14px",
    }}>
      <i className="fas fa-circle-exclamation" style={{ flexShrink: 0 }} />
      {message}
    </div>
  );
}
