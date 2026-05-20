import type { ChatMessage } from "@/types";
import { SkeletonText } from "@/components/ui";

export function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: "12px", animation: "fadeUp 0.3s ease" }}>
      {!isUser && (
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: "var(--clr-earth)", color: "var(--clr-gold)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginRight: "8px", marginTop: "2px", fontSize: "13px",
        }}>
          <i className="fas fa-seedling" />
        </div>
      )}

      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div style={{
          background: isUser ? "var(--clr-earth)" : msg.isError ? "#FEF2F2" : "var(--clr-surface)",
          color: isUser ? "var(--clr-sand)" : msg.isError ? "#991B1B" : "var(--clr-charcoal)",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "12px 16px",
          fontSize: "14px",
          lineHeight: "1.6",
          border: isUser ? "none" : msg.isError ? "1px solid #FECACA" : "1px solid var(--clr-border)",
          boxShadow: "var(--shadow-sm)",
        }}>
          {/* Error icon */}
          {msg.isError && <i className="fas fa-circle-exclamation mr-2" />}

          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>

          {/* Low confidence nudge */}
          {msg.confidence !== undefined && msg.confidence < 0.5 && !msg.isError && (
            <div style={{
              marginTop: "10px", paddingTop: "8px",
              borderTop: "1px dashed var(--clr-border)",
              fontSize: "12px", color: "var(--clr-muted)",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <i className="fas fa-database" />
              Low confidence — please verify with <strong style={{ color: "var(--clr-earth)" }}>CMA</strong> or <strong style={{ color: "var(--clr-earth)" }}>CBK</strong> official sources.
            </div>
          )}

          {/* Sources */}
          {msg.sources && msg.sources.length > 0 && !msg.isError && (
            <div style={{
              marginTop: "10px", paddingTop: "8px",
              borderTop: "1px solid var(--clr-border)",
              fontSize: "11px", color: "var(--clr-muted)",
              display: "flex", flexWrap: "wrap", gap: "4px",
              alignItems: "center",
            }}>
              <i className="fas fa-book-open" style={{ marginRight: "2px" }} />
              {[...new Set(msg.sources.map(s => s.source))].map((src, i) => (
                <span key={i} style={{
                  background: "var(--clr-sand)", padding: "1px 6px",
                  borderRadius: "99px", fontSize: "10px",
                }}>
                  {src}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Confidence bar (assistant only) */}
        {!isUser && msg.confidence !== undefined && !msg.isError && (
          <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "60px", height: "3px", background: "var(--clr-border)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{
                width: `${msg.confidence * 100}%`,
                height: "100%",
                background: msg.confidence > 0.7 ? "var(--clr-earth)" : msg.confidence > 0.5 ? "var(--clr-gold)" : "var(--clr-clay)",
                borderRadius: "99px",
                transition: "width 0.8s ease",
              }} />
            </div>
            <span style={{ fontSize: "10px", color: "var(--clr-muted)" }}>
              {Math.round(msg.confidence * 100)}% confident
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        background: "var(--clr-earth)", color: "var(--clr-gold)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px",
      }}>
        <i className="fas fa-seedling" />
      </div>
      <div style={{
        background: "var(--clr-surface)", border: "1px solid var(--clr-border)",
        borderRadius: "18px 18px 18px 4px", padding: "14px 18px",
      }}>
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}
