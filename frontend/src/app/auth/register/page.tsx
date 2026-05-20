"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

const RISK_OPTIONS = [
  { value: "low",    label: "I prefer safe, steady returns", icon: "fa-shield" },
  { value: "medium", label: "Some ups and downs are fine", icon: "fa-scale-balanced" },
  { value: "high",   label: "I'm in it for long-term growth", icon: "fa-rocket" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  // Step 1 fields
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");

  // Step 2 fields
  const [riskProfile, setRisk]  = useState("medium");
  const [ageBracket, setAge]    = useState("");
  const [incomeBracket, setIncome] = useState("");

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px",
    background: "var(--clr-smoke)",
    border: "1.5px solid var(--clr-border)",
    borderRadius: "var(--radius)",
    fontSize: "15px", fontFamily: "var(--font-body)", outline: "none",
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!email && !phone) { toast.error("Enter an email address or phone number."); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (step === 1) { setStep(2); return; }

    setLoading(true);
    try {
      await authApi.register({ email: email || undefined, phone: phone || undefined, password, risk_profile: riskProfile, age_bracket: ageBracket, income_bracket: incomeBracket });
      toast.success("Account created! Welcome to Pesa Yako.");
      router.push("/plan");
    } catch {
      toast.error("Could not create account. That email/phone may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--clr-smoke)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px",
            background: "var(--clr-earth)", margin: "0 auto 10px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fas fa-seedling" style={{ color: "var(--clr-gold)", fontSize: "20px" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--clr-earth)", marginBottom: "4px" }}>
            Create your account
          </h1>
          <p style={{ fontSize: "13px", color: "var(--clr-muted)" }}>Free. No credit card needed.</p>
        </div>

        {/* Step progress */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: "3px", borderRadius: "99px",
              background: s <= step ? "var(--clr-earth)" : "var(--clr-border)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        <div style={{
          background: "var(--clr-surface)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--clr-border)", padding: "28px",
          boxShadow: "var(--shadow)",
        }}>
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {step === 1 && (
              <>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-muted)", marginBottom: "-4px" }}>STEP 1 OF 2 — YOUR ACCOUNT</p>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-charcoal)", marginBottom: "6px", display: "block" }}>
                    Email address
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" style={fieldStyle} />
                </div>
                <div style={{ textAlign: "center", fontSize: "12px", color: "var(--clr-muted)" }}>— or —</div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-charcoal)", marginBottom: "6px", display: "block" }}>
                    Phone number (Kenyan)
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="0712345678" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-charcoal)", marginBottom: "6px", display: "block" }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      style={{ ...fieldStyle, paddingRight: "44px" }}
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                      position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--clr-muted)", fontSize: "14px",
                    }}>
                      <i className={`fas ${showPwd ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-muted)", marginBottom: "-4px" }}>STEP 2 OF 2 — YOUR PROFILE</p>
                <p style={{ fontSize: "13px", color: "var(--clr-muted)", marginBottom: "4px" }}>
                  This helps us give you better advice. You can change it later.
                </p>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-charcoal)", marginBottom: "8px", display: "block" }}>
                    How do you feel about investment risk?
                  </label>
                  {RISK_OPTIONS.map(({ value, label, icon }) => (
                    <button type="button" key={value} onClick={() => setRisk(value)} style={{
                      width: "100%", marginBottom: "8px",
                      padding: "11px 14px", borderRadius: "var(--radius)",
                      border: `1.5px solid ${riskProfile === value ? "var(--clr-earth)" : "var(--clr-border)"}`,
                      background: riskProfile === value ? "rgba(44,74,46,0.05)" : "var(--clr-surface)",
                      textAlign: "left", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "10px",
                      transition: "all 0.2s",
                    }}>
                      <i className={`fas ${icon}`} style={{ color: riskProfile === value ? "var(--clr-earth)" : "var(--clr-muted)", width: "16px" }} />
                      <span style={{ fontSize: "13px", color: "var(--clr-charcoal)", fontWeight: riskProfile === value ? 600 : 400 }}>{label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-charcoal)", marginBottom: "6px", display: "block" }}>
                    Age bracket (optional)
                  </label>
                  <select value={ageBracket} onChange={e => setAge(e.target.value)} style={{ ...fieldStyle }}>
                    <option value="">Prefer not to say</option>
                    {["18-25","26-35","36-45","46-55","56+"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-charcoal)", marginBottom: "6px", display: "block" }}>
                    Monthly income bracket (optional)
                  </label>
                  <select value={incomeBracket} onChange={e => setIncome(e.target.value)} style={{ ...fieldStyle }}>
                    <option value="">Prefer not to say</option>
                    {["under 20k","20-50k","50-100k","100k+"].map(b => <option key={b} value={b}>KES {b}/month</option>)}
                  </select>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} style={{
              background: "var(--clr-earth)", color: "var(--clr-sand)",
              border: "none", borderRadius: "var(--radius)",
              padding: "13px", fontSize: "15px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              marginTop: "4px",
            }}>
              {loading
                ? <><i className="fas fa-circle-notch fa-spin" /> Creating account…</>
                : step === 1
                  ? <><i className="fas fa-arrow-right" /> Continue</>
                  : <><i className="fas fa-check" /> Create my account</>
              }
            </button>

            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--clr-muted)", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px",
                justifyContent: "center",
              }}>
                <i className="fas fa-arrow-left" /> Go back
              </button>
            )}
          </form>

          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--clr-border)", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "var(--clr-muted)" }}>
              Already have an account?{" "}
              <Link href="/auth/login" style={{ color: "var(--clr-earth)", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p style={{ fontSize: "11px", color: "var(--clr-muted)", textAlign: "center", marginTop: "14px", lineHeight: 1.5 }}>
          By creating an account you agree that Pesa Yako provides educational guidance only — not licensed financial advice.
          We never sell your personal data.
        </p>
      </div>
    </div>
  );
}
