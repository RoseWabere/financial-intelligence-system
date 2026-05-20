import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment Directory — Verified Kenyan Providers & Products",
  description: "Browse CMA-licensed brokers, SASRA-registered SACCOs, Money Market Funds, Treasury Bills, REITs and more — all verified and regulated.",
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
