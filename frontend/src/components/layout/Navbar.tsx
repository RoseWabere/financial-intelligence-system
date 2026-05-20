"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/chat",      icon: "fa-comments",       label: "Ask Anything" },
  { href: "/plan",      icon: "fa-chart-pie",       label: "My Plan" },
  { href: "/directory", icon: "fa-building-columns", label: "Providers" },
  { href: "/market",    icon: "fa-arrow-trend-up",  label: "Market" },
  { href: "/glossary",  icon: "fa-book-open",       label: "Learn" },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{ background: "var(--clr-earth)", boxShadow: "var(--shadow)" }}
        className="fixed top-0 left-0 right-0 z-50 h-14">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span style={{ fontFamily: "var(--font-display)", color: "var(--clr-gold)", fontWeight: 700, fontSize: "20px" }}>
              Hela<span style={{ color: "var(--clr-sand)" }}>Flow</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, icon, label }) => {
              const active = path.startsWith(href);
              return (
                <Link key={href} href={href}
                  style={{
                    color: active ? "var(--clr-gold)" : "rgba(245,237,216,0.7)",
                    background: active ? "rgba(201,149,42,0.12)" : "transparent",
                    borderRadius: "var(--radius-sm)",
                    padding: "5px 12px",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    transition: "all 0.2s",
                  }}
                  className="flex items-center gap-2 hover:text-sand">
                  <i className={`fas ${icon} text-xs`} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden p-2"
            style={{ color: "var(--clr-sand)" }}>
            <i className={`fas ${open ? "fa-xmark" : "fa-bars"} text-lg`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 pt-14"
          style={{ background: "rgba(26,46,28,0.97)" }}
          onClick={() => setOpen(false)}>
          <div className="flex flex-col p-6 gap-2 stagger">
            {links.map(({ href, icon, label }) => (
              <Link key={href} href={href}
                style={{ color: "var(--clr-sand)", fontSize: "20px", padding: "12px 0" }}
                className="flex items-center gap-3 border-b border-white/10">
                <i className={`fas ${icon}`} style={{ color: "var(--clr-gold)", width: "20px" }} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Spacer for fixed nav */}
      <div className="h-14" />
    </>
  );
}
