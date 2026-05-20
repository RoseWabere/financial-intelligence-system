import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        earth: { 
          // DEFAULT: "#0F766E",   // teal (was green)
          // light: "#14B8A6",
          // dark: "#0B5E57"

          DEFAULT: "#15803D",  // balanced green (equivalent weight to #0F766E)
          light:   "#22C55E",
          dark:    "#14532D"
        },
        gold:  { 
          // DEFAULT: "#F59E0B",   // amber (kept meaning)
          // light: "#FBBF24",
          // dark: "#B45309"

          DEFAULT: "#D4A017",  // refined gold (less orange, more premium)
          light:   "#E6C200",
          dark:    "#A17C12"
        },
        sand:  { 
          DEFAULT: "#F9FAFB",   // clean background
          dark: "#E5E7EB"
        },
        clay:  "#EF4444",       // now proper "danger" red
        smoke: "#F3F4F6",       // subtle background layer
      },

      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },

      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },

      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },

      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;