"use client";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { recommendApi } from "@/lib/api";
import type { RecommendationResponse, UserProfile } from "@/types";
import { AllocationChart } from "@/components/plan/AllocationChart";
import { SkeletonCard } from "@/components/ui";

type Scenario = "conservative" | "balanced" | "growth";

const scenarios: { key: Scenario; label: string; icon: string; desc: string }[] = [
  { key: "conservative", label: "Play it safe",  icon: "fa-shield",       desc: "Prioritise stability. Lower returns, much lower risk." },
  { key: "balanced",     label: "Balanced",      icon: "fa-scale-balanced",desc: "A mix of stability and growth. Good starting point." },
  { key: "growth",       label: "Grow faster",   icon: "fa-rocket",       desc: "More equities for long-term upside. Accepts more short-term swings." },
];

const goals = [
  { key: "retirement",   label: "Retirement",   icon: "fa-umbrella-beach" },
  { key: "house",        label: "Buy a home",   icon: "fa-house" },
  { key: "education",    label: "Education",    icon: "fa-graduation-cap" },
  { key: "emergency",    label: "Emergency fund",icon: "fa-kit-medical" },
  { key: "real_estate",  label: "Real estate",  icon: "fa-building" },
  { key: "business",     label: "Business",     icon: "fa-briefcase" },
];

export default function PlanPage() {
  const [step, setStep]       = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<RecommendationResponse | null>(null);
  const [scenario, setScenario] = useState<Scenario>("balanced");

  // Form state
  const [income, setIncome]     = useState("");
  const [age, setAge]           = useState("");
  const [risk, setRisk]         = useState<"low"|"medium"|"high">("medium");
  const [horizon, setHorizon]   = useState("5");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["retirement"]);
  const [hasDebt, setHasDebt]   = useState(false);

  const toggleGoal = (k: string) => setSelectedGoals(prev =>
    prev.includes(k) ? prev.filter(g => g !== k) : [...prev, k]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!income || !age) { toast.error("Please fill in your income and age."); return; }
    if (selectedGoals.length === 0) { toast.error("Select at least one goal."); return; }

    setLoading(true);
    try {
      const profile: UserProfile = {
        income_kes_monthly: parseInt(income),
        risk, goals: selectedGoals,
        horizon_years: parseInt(horizon),
        age: parseInt(age),
        has_debt: hasDebt,
      };
      const data = await recommendApi.get(profile as unknown as Record<string, unknown>);
      setResult(data);
      setStep("result");
    } catch {
      toast.error("Could not generate your plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px",
    background: "var(--clr-smoke)",
    border: "1.5px solid var(--clr-border)",
    borderRadius: "var(--radius)",
    fontSize: "15px", fontFamily: "var(--font-body)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "13px", fontWeight: 600,
    color: "var(--clr-charcoal)", marginBottom: "6px", display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--clr-smoke)", padding: "32px 20px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {step === "form" && (
          <div>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,38px)", color: "var(--clr-earth)", marginBottom: "8px" }}>
                Build your investment plan
              </h1>
              <p style={{ color: "var(--clr-muted)", fontSize: "15px", lineHeight: 1.6 }}>
                Answer a few simple questions. We'll create a personalised allocation plan — completely free.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Income */}
              <div>
                <label style={labelStyle}>
                  <i className="fas fa-wallet mr-2" style={{ color: "var(--clr-gold)" }} />
                  Monthly take-home income (KES)
                </label>
                <input type="number" value={income} onChange={e => setIncome(e.target.value)}
                  placeholder="e.g. 45000" style={fieldStyle} min={1} required />
                <p style={{ fontSize: "12px", color: "var(--clr-muted)", marginTop: "4px" }}>
                  Your actual monthly income after tax — no one else will see this.
                </p>
              </div>

              {/* Age */}
              <div>
                <label style={labelStyle}>
                  <i className="fas fa-calendar-days mr-2" style={{ color: "var(--clr-gold)" }} />
                  Your age
                </label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  placeholder="e.g. 29" style={fieldStyle} min={18} max={80} required />
              </div>

              {/* Goals */}
              <div>
                <label style={labelStyle}>
                  <i className="fas fa-bullseye mr-2" style={{ color: "var(--clr-gold)" }} />
                  What are you saving for? (pick all that apply)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {goals.map(({ key, label, icon }) => {
                    const active = selectedGoals.includes(key);
                    return (
                      <button type="button" key={key} onClick={() => toggleGoal(key)} style={{
                        padding: "8px 14px", borderRadius: "99px",
                        border: `1.5px solid ${active ? "var(--clr-earth)" : "var(--clr-border)"}`,
                        background: active ? "var(--clr-earth)" : "var(--clr-surface)",
                        color: active ? "var(--clr-sand)" : "var(--clr-charcoal)",
                        fontSize: "13px", fontWeight: active ? 600 : 400,
                        cursor: "pointer", transition: "all 0.2s",
                        display: "flex", alignItems: "center", gap: "6px",
                      }}>
                        <i className={`fas ${icon} text-xs`} /> {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Investment horizon */}
              <div>
                <label style={labelStyle}>
                  <i className="fas fa-hourglass-half mr-2" style={{ color: "var(--clr-gold)" }} />
                  How long can you leave your money invested?
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[["1","Less than 2 years"],["3","3–5 years"],["7","5–10 years"],["15","10+ years"]].map(([val, label]) => (
                    <button type="button" key={val} onClick={() => setHorizon(val)} style={{
                      padding: "8px 16px", borderRadius: "99px",
                      border: `1.5px solid ${horizon === val ? "var(--clr-earth)" : "var(--clr-border)"}`,
                      background: horizon === val ? "var(--clr-earth)" : "var(--clr-surface)",
                      color: horizon === val ? "var(--clr-sand)" : "var(--clr-charcoal)",
                      fontSize: "13px", fontWeight: horizon === val ? 600 : 400,
                      cursor: "pointer", transition: "all 0.2s",
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk */}
              <div>
                <label style={labelStyle}>
                  <i className="fas fa-gauge mr-2" style={{ color: "var(--clr-gold)" }} />
                  How would you feel if your investment dropped 10% temporarily?
                </label>
                {[
                  ["low",    "I'd be very worried — I prefer safe, steady returns", "fa-shield"],
                  ["medium", "I'd be okay — some ups and downs are fine", "fa-scale-balanced"],
                  ["high",   "No problem — I'm in it for long-term growth", "fa-rocket"],
                ].map(([val, label, icon]) => (
                  <button type="button" key={val} onClick={() => setRisk(val as "low"|"medium"|"high")} style={{
                    width: "100%", marginBottom: "8px",
                    padding: "12px 16px", borderRadius: "var(--radius)",
                    border: `1.5px solid ${risk === val ? "var(--clr-earth)" : "var(--clr-border)"}`,
                    background: risk === val ? "rgba(44,74,46,0.05)" : "var(--clr-surface)",
                    textAlign: "left", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "10px",
                    transition: "all 0.2s",
                  }}>
                    <i className={`fas ${icon}`} style={{ color: risk === val ? "var(--clr-earth)" : "var(--clr-muted)", width: "16px" }} />
                    <span style={{ fontSize: "14px", color: "var(--clr-charcoal)", fontWeight: risk === val ? 600 : 400 }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* Debt */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" id="debt" checked={hasDebt} onChange={e => setHasDebt(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--clr-earth)", cursor: "pointer" }} />
                <label htmlFor="debt" style={{ fontSize: "14px", color: "var(--clr-charcoal)", cursor: "pointer" }}>
                  I currently have high-interest loans (BNPL, bank loan, chama debt)
                </label>
              </div>

              <button type="submit" disabled={loading} style={{
                background: "var(--clr-earth)",
                color: "var(--clr-sand)",
                border: "none", borderRadius: "var(--radius)",
                padding: "16px", fontSize: "16px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "var(--shadow)",
              }}>
                {loading ? <><i className="fas fa-circle-notch fa-spin" /> Building your plan…</> : <><i className="fas fa-chart-pie" /> Show my plan</>}
              </button>
            </form>
          </div>
        )}

        {step === "result" && result && (
          <div>
            <button onClick={() => setStep("form")} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--clr-earth)", fontSize: "14px", marginBottom: "20px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <i className="fas fa-arrow-left" /> Adjust my details
            </button>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,34px)", color: "var(--clr-earth)", marginBottom: "6px" }}>
              Your investment plan
            </h1>
            <p style={{ color: "var(--clr-muted)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 }}>
              {result.explanation}
            </p>

            {/* Scenario selector */}
            <p style={{ fontSize: "12px", color: "var(--clr-muted)", fontWeight: 600, marginBottom: "10px", letterSpacing: "0.05em" }}>
              SEE DIFFERENT APPROACHES
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
              {scenarios.map(({ key, label, icon, desc }) => (
                <button key={key} onClick={() => setScenario(key)} style={{
                  flex: 1, minWidth: "140px",
                  padding: "12px", borderRadius: "var(--radius)",
                  border: `1.5px solid ${scenario === key ? "var(--clr-earth)" : "var(--clr-border)"}`,
                  background: scenario === key ? "var(--clr-earth)" : "var(--clr-surface)",
                  color: scenario === key ? "var(--clr-sand)" : "var(--clr-charcoal)",
                  cursor: "pointer", transition: "all 0.2s", textAlign: "center",
                }}>
                  <i className={`fas ${icon} block mb-1`} />
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{label}</div>
                  <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}>{desc}</div>
                </button>
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "var(--clr-muted)", marginTop: "-20px", marginBottom: "20px" }}>
              <i className="fas fa-circle-info mr-1" />
              These are educational illustrations — not personalised advice. Mix-and-match based on your situation.
            </p>

            {/* Chart */}
            <div style={{
              background: "var(--clr-surface)", borderRadius: "var(--radius-lg)",
              border: "1px solid var(--clr-border)", padding: "20px", marginBottom: "20px",
            }}>
              <AllocationChart plan={result.plan} scenario={scenario} />
            </div>

            {/* Plan items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }} className="stagger">
              {result.plan.map((item, i) => (
                <div key={i} style={{
                  background: "var(--clr-surface)", borderRadius: "var(--radius)",
                  border: "1px solid var(--clr-border)", padding: "16px",
                  display: "flex", gap: "14px", alignItems: "flex-start",
                }}>
                  <div style={{
                    minWidth: "52px", height: "52px", borderRadius: "var(--radius-sm)",
                    background: "var(--clr-sand)", display: "flex",
                    flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: "var(--clr-earth)", lineHeight: 1 }}>
                      {item.allocation_pct}%
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--clr-charcoal)", marginBottom: "3px" }}>
                      {item.category.replace(" (Emergency Buffer)", "")}
                    </h4>
                    <p style={{ fontSize: "13px", color: "var(--clr-muted)", marginBottom: "6px", lineHeight: 1.5 }}>
                      {item.rationale.split(" (")[0]}
                    </p>
                    {item.example_products.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {item.example_products.slice(0, 2).map(p => (
                          <span key={p} style={{
                            background: "var(--clr-sand)", fontSize: "11px",
                            padding: "2px 8px", borderRadius: "99px", color: "var(--clr-earth)", fontWeight: 500,
                          }}>{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{
              background: "linear-gradient(135deg, var(--clr-earth-d), var(--clr-earth))",
              borderRadius: "var(--radius-lg)", padding: "20px", color: "var(--clr-sand)",
            }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--clr-gold)", marginBottom: "12px" }}>
                <i className="fas fa-list-check mr-2" /> Your next steps
              </h3>
              {result.recommended_actions.map((action, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "10px" }}>
                  <span style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "var(--clr-gold)", color: "var(--clr-earth-d)",
                    fontSize: "11px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{i + 1}</span>
                  <p style={{ fontSize: "14px", margin: 0, lineHeight: 1.5, color: "rgba(245,237,216,0.85)" }}>{action}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "12px", color: "var(--clr-muted)", textAlign: "center", marginTop: "20px" }}>
              {result.disclaimer}
            </p>
          </div>
        )}

        {loading && step === "result" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
