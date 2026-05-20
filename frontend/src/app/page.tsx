import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hela Flow — Trusted Investment Guidance for Kenyans",
};

const features = [
  { icon: "fa-comments",        title: "Ask Anything",       body: "Get simple and clear answers to any investment question - no jargon.", href: "/chat",      cta: "Start asking" },
  { icon: "fa-chart-pie",       title: "Your Plan",          body: "Tell us your income and goals. Get a personalised allocation plan.", href: "/plan",      cta: "Build my plan" },
  { icon: "fa-building-columns",title: "Verified Providers", body: "Find CMA-licensed brokers, SASRA-registered SACCOs, and MMFs.", href: "/directory", cta: "Browse providers" },
  { icon: "fa-arrow-trend-up",  title: "Live Market Data",   body: "NSE stock prices and CBK rates: updated every 15 minutes.", href: "/market",    cta: "View market" },
];

const stats = [
  { value: "~38%", label: "Financial literacy rate in Kenya" },
  { value: "60+",  label: "NSE-listed companies" },
  { value: "10k+", label: "Registered SACCOs" },
  { value: "16.9%",label: "Current 91-day T-bill yield" },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(160deg, var(--clr-earth-d) 0%, var(--clr-earth) 60%, var(--clr-earth-l) 100%)",
        padding: "80px 20px 100px",
        position: "relative", overflow: "hidden",
      }} className="grain">
        {/* Decorative circle */}
        <div style={{
          position: "absolute", right: "-80px", top: "-80px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "rgba(201,149,42,0.07)", pointerEvents: "none",
        }} />

        <div className="max-w-3xl mx-auto text-center stagger">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(201,149,42,0.15)", borderRadius: "10px",
            padding: "4px 14px", marginBottom: "24px",
            fontSize: "12px", fontWeight: 600, color: "var(--clr-gold)",
            letterSpacing: "0.08em",
          }}>
            <i className="fas fa-shield-check" /> REGULATED DATA · CMA · CBK · SASRA
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px,7vw,64px)",
            fontWeight: 700,
            color: "var(--clr-sand)",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}>
            Your money,<br />
            <span style={{ color: "var(--clr-gold)" }}>working for you.</span>
          </h1>

          <p style={{
            fontSize: "clamp(15px,2.5vw,18px)",
            color: "rgba(245,237,216,0.75)",
            lineHeight: 1.7,
            maxWidth: "520px",
            margin: "0 auto 36px",
          }}>
            Plain-language investment guidance for every Kenyan — from KES 1,000 in an MMF
            to your first Treasury Bill. Trusted. Regulated. No jargon.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/chat" style={{
              background: "var(--clr-gold)", color: "var(--clr-earth-d)",
              padding: "14px 28px", borderRadius: "var(--radius)",
              fontWeight: 700, fontSize: "15px", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 20px rgba(201,149,42,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}>
              <i className="fas fa-comments" /> Ask a question
            </Link>
            <Link href="/plan" style={{
              background: "transparent",
              border: "1.5px solid rgba(245,237,216,0.4)",
              color: "var(--clr-sand)",
              padding: "14px 28px", borderRadius: "var(--radius)",
              fontWeight: 600, fontSize: "15px", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: "8px",
              transition: "border-color 0.2s",
            }}>
              <i className="fas fa-chart-pie" /> Build my plan
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────── */}
      <section style={{
        background: "var(--clr-gold)", padding: "20px",
        display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "32px",
      }}>
        {stats.map(({ value, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "var(--clr-earth-d)" }}>
              {value}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(26,46,28,0.7)", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={{ padding: "64px 20px", background: "var(--clr-smoke)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(26px,5vw,36px)",
            color: "var(--clr-earth)",
            textAlign: "center", marginBottom: "8px",
          }}>
            Everything in one place
          </h2>
          <p style={{ textAlign: "center", color: "var(--clr-muted)", marginBottom: "48px", fontSize: "15px" }}>
            Built mainly for the Kenyan market.
          </p>

          <div className="stagger" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px",
          }}>
            {features.map(({ icon, title, body, href, cta }) => (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--clr-surface)",
                  border: "1px solid var(--clr-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
                  height: "100%",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  cursor: "pointer",
                }} className="hover:shadow-md">
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: "var(--clr-sand)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    marginBottom: "14px",
                  }}>
                    <i className={`fas ${icon}`} style={{ color: "var(--clr-earth)", fontSize: "18px" }} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--clr-earth)", marginBottom: "8px" }}>{title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--clr-muted)", lineHeight: 1.6, marginBottom: "16px" }}>{body}</p>
                  <span style={{ fontSize: "13px", color: "var(--clr-gold)", fontWeight: 600 }}>
                    {cta} <i className="fas fa-arrow-right text-xs" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────── */}
      <section style={{ background: "var(--clr-sand-d)", padding: "32px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--clr-muted)", fontWeight: 500, letterSpacing: "0.06em", marginBottom: "16px" }}>
          DATA SOURCED FROM OFFICIAL REGULATORS
        </p>
        <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
          {["CMA Kenya", "Central Bank of Kenya", "SASRA", "Nairobi Securities Exchange"].map(r => (
            <span key={r} style={{
              padding: "6px 14px", borderRadius: "99px",
              border: "1px solid var(--clr-border)",
              fontSize: "12px", color: "var(--clr-earth)", fontWeight: 600,
              background: "white",
            }}>
              <i className="fas fa-circle-check mr-1" style={{ color: "var(--clr-gold)" }} /> {r}
            </span>
          ))}
        </div>
        <p style={{ fontSize: "11px", color: "var(--clr-muted)", marginTop: "20px" }}>
          Not licensed financial advice. Consult a CMA-licensed advisor for personalised guidance.
        </p>
      </section>
    </div>
  );
}
