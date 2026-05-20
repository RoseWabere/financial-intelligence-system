"use client";
import { useState, useRef, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";
import { ChatBubble, TypingIndicator } from "@/components/chat/ChatBubble";

const SUGGESTIONS = [
  "What's the best MMF for KES 5,000?",
  "How do I buy a Treasury Bill in Kenya?",
  "Is Harambee SACCO safe to join?",
  "Explain NSE blue-chip stocks simply",
  "What is an Infrastructure Bond?",
  "How do REITs work in Kenya?",
];

export default function ChatPage() {
  const { messages, send, loading, clear, isOnline } = useChat();
  const [input, setInput]   = useState("");
  const bottomRef           = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setInput("");
    try {
      await send(text);
    } catch (err: unknown) {
      if ((err as { isRateLimit?: boolean })?.isRateLimit) {
        toast.error("Too many messages — please wait a moment.");
      }
    }
    inputRef.current?.focus();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const empty = messages.length === 0;

  return (
    <div style={{ height: "calc(100vh - 56px)", display: "flex", flexDirection: "column", background: "var(--clr-smoke)" }}>
      {/* Header */}
      <div style={{
        background: "var(--clr-surface)", borderBottom: "1px solid var(--clr-border)",
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--clr-earth)", margin: 0 }}>
            Ask Anything
          </h1>
          <p style={{ fontSize: "12px", color: "var(--clr-muted)", margin: 0 }}>
            Powered by Kenya financial data + AI
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} style={{
            fontSize: "12px", color: "var(--clr-muted)", background: "none",
            border: "1px solid var(--clr-border)", borderRadius: "var(--radius-sm)",
            padding: "5px 10px", cursor: "pointer",
          }}>
            <i className="fas fa-rotate-left mr-1" /> New chat
          </button>
        )}
      </div>

      {/* Offline notice */}
      {!isOnline && (
        <div style={{
          background: "#FEF3C7", borderBottom: "1px solid #FDE68A",
          padding: "8px 20px", fontSize: "12px", color: "#92400E",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <i className="fas fa-wifi-slash" /> No internet — replies may be unavailable
        </div>
      )}

      {/* Messages */}
      <div className="chat-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {empty ? (
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "var(--clr-earth)", margin: "0 auto 16px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className="fas fa-seedling" style={{ color: "var(--clr-gold)", fontSize: "24px" }} />
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", color: "var(--clr-earth)", fontSize: "22px", marginBottom: "8px" }}>
                Habari! How can I help?
              </h2>
              <p style={{ color: "var(--clr-muted)", fontSize: "14px", lineHeight: 1.6 }}>
                Ask me about investments, SACCOs, bonds, stocks — anything about growing your money in Kenya.
              </p>
            </div>

            <p style={{ fontSize: "12px", color: "var(--clr-muted)", fontWeight: 600, marginBottom: "10px", letterSpacing: "0.05em" }}>
              TRY ASKING
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleSend(s)} style={{
                  background: "var(--clr-surface)", border: "1px solid var(--clr-border)",
                  borderRadius: "var(--radius)", padding: "12px 16px",
                  textAlign: "left", cursor: "pointer", fontSize: "14px",
                  color: "var(--clr-charcoal)", transition: "border-color 0.2s, background 0.2s",
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <i className="fas fa-circle-arrow-right" style={{ color: "var(--clr-gold)", flexShrink: 0 }} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            {messages.map((msg, i) => (
              <ChatBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        background: "var(--clr-surface)", borderTop: "1px solid var(--clr-border)",
        padding: "12px 20px",
      }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: "720px", margin: "0 auto", display: "flex", gap: "8px" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about bonds, MMFs, SACCOs, stocks…"
            disabled={loading}
            maxLength={500}
            style={{
              flex: 1,
              background: "var(--clr-smoke)",
              border: "1.5px solid var(--clr-border)",
              borderRadius: "var(--radius)",
              padding: "12px 16px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
              fontFamily: "var(--font-body)",
            }}
          />
          <button type="submit" disabled={loading || !input.trim()} style={{
            background: input.trim() ? "var(--clr-earth)" : "var(--clr-border)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "12px 20px",
            cursor: input.trim() ? "pointer" : "default",
            transition: "background 0.2s",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            {loading ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-paper-plane" />}
          </button>
        </form>
        <p style={{ fontSize: "11px", color: "var(--clr-muted)", textAlign: "center", marginTop: "6px", maxWidth: "720px", margin: "6px auto 0" }}>
          Educational guidance only — not licensed financial advice. Always verify with{" "}
          <a href="https://cma.or.ke" target="_blank" rel="noopener" style={{ color: "var(--clr-earth)" }}>CMA</a> or{" "}
          <a href="https://centralbank.go.ke" target="_blank" rel="noopener" style={{ color: "var(--clr-earth)" }}>CBK</a>.
        </p>
      </div>
    </div>
  );
}
