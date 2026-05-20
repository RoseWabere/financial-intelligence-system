import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import OfflineBar from "@/components/layout/OfflineBar";

export const metadata: Metadata = {
  title: { default: "Pesa Yako | Kenya Financial Intelligence", template: "%s | Pesa Yako" },
  description: "Trusted, plain-language investment guidance for Kenyan retail investors. Find regulated brokers, SACCOs, bonds, and get a personalised investment plan.",
  keywords: ["Kenya investment", "NSE", "SACCO", "Treasury Bills", "MMF", "CMA", "financial literacy Kenya"],
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "Pesa Yako",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OfflineBar />
        <Navbar />
        <main>{children}</main>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              background: "var(--clr-charcoal)",
              color: "#fff",
              border: "none",
            },
          }}
        />
      </body>
    </html>
  );
}
