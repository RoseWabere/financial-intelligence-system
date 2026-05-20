"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPwd, setShowPwd]       = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { toast.error("Please fill in both fields."); return; }
    setLoading(true);
    try {
      await authApi.login(identifier, password);
      toast.success("Welcome back!");
      router.push("/chat");
    } catch {
      toast.error("Incorrect email/phone or password.");
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
    outline: "none", transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--clr-smoke)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "var(--clr-earth)", margin: "0 auto 12px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fas fa-seedling" style={{ color: "var(--clr-gold)", fontSize: "22px" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", color: "var(--clr-earth)", marginBottom: "4px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "var(--clr-muted)" }}>Sign in to your Pesa Yako account</p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--clr-surface)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--clr-border)", padding: "28px",
          boxShadow: "var(--shadow)",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-charcoal)", marginBottom: "6px", display: "block" }}>
                Email or phone number
              </label>
              <input
                type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
                placeholder="you@example.com or 0712345678"
                style={fieldStyle} autoComplete="username"
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-charcoal)", marginBottom: "6px", display: "block" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  style={{ ...fieldStyle, paddingRight: "44px" }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--clr-muted)", fontSize: "14px", padding: "4px",
                }}>
                  <i className={`fas ${showPwd ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              background: "var(--clr-earth)", color: "var(--clr-sand)",
              border: "none", borderRadius: "var(--radius)",
              padding: "13px", fontSize: "15px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              marginTop: "4px",
            }}>
              {loading ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-arrow-right-to-bracket" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--clr-border)", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "var(--clr-muted)" }}>
              Don't have an account?{" "}
              <Link href="/auth/register" style={{ color: "var(--clr-earth)", fontWeight: 600, textDecoration: "none" }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Guest option */}
        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--clr-muted)", marginTop: "16px" }}>
          No account needed to{" "}
          <Link href="/chat" style={{ color: "var(--clr-earth)", fontWeight: 600, textDecoration: "none" }}>
            ask a question
          </Link>{" "}
          or{" "}
          <Link href="/plan" style={{ color: "var(--clr-earth)", fontWeight: 600, textDecoration: "none" }}>
            build a plan
          </Link>.
        </p>
      </div>
    </div>
  );
}
