"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { AllocationItem } from "@/types";

const PALETTE = ["#2C4A2E", "#C9952A", "#6B7280", "#E8502A", "#8B5E3C", "#4A7C59"];

interface Props {
  plan: AllocationItem[];
  scenario?: "balanced" | "conservative" | "growth";
}

// Derive scenario variants without changing the backend
function applyScenario(plan: AllocationItem[], scenario: "balanced" | "conservative" | "growth"): AllocationItem[] {
  const clone = plan.map(item => ({ ...item }));

  if (scenario === "conservative") {
    // Shift 10% from equity/REIT toward bonds/MMF
    clone.forEach(item => {
      if (item.category.includes("Equit") || item.category.includes("NSE") || item.category.includes("REIT")) {
        item.allocation_pct = Math.max(5, item.allocation_pct - 5);
        item.rationale += " (Conservative: reduced equity exposure)";
      }
      if (item.category.includes("Bond") || item.category.includes("Money Market")) {
        item.allocation_pct = Math.min(60, item.allocation_pct + 5);
        item.rationale += " (Conservative: increased stability)";
      }
    });
  }

  if (scenario === "growth") {
    // Shift 10% toward equities from MMF
    clone.forEach(item => {
      if (item.category.includes("Equit") || item.category.includes("NSE")) {
        item.allocation_pct = Math.min(50, item.allocation_pct + 7);
        item.rationale += " (Growth: higher equity for long-term upside)";
      }
      if (item.category.includes("Money Market") && !item.category.includes("Emergency")) {
        item.allocation_pct = Math.max(5, item.allocation_pct - 7);
      }
    });
  }

  // Normalise to 100%
  const total = clone.reduce((s, i) => s + i.allocation_pct, 0);
  if (total !== 100) clone[0].allocation_pct += (100 - total);
  return clone;
}

export function AllocationChart({ plan, scenario = "balanced" }: Props) {
  const activePlan = scenario === "balanced" ? plan : applyScenario(plan, scenario);

  const data = activePlan.map(item => ({
    name: item.category.replace(" (Emergency Buffer)", "").replace(" / ", "\n"),
    value: item.allocation_pct,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={65} outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [`${v}%`, ""]}
            contentStyle={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              borderRadius: "8px",
              border: "1px solid var(--clr-border)",
              boxShadow: "var(--shadow)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "4px" }}>
        {activePlan.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--clr-muted)" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
            {item.category.replace(" (Emergency Buffer)", "")} — <strong style={{ color: "var(--clr-charcoal)" }}>{item.allocation_pct}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
