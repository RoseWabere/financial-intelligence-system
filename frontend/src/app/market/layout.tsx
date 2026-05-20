import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Data — NSE Prices & CBK Rates",
  description: "Live Nairobi Securities Exchange (NSE) stock prices, CBK base rate, T-bill yields and Kenya inflation — updated every 15 minutes.",
};

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
