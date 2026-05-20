export interface ChatSource {
  title: string;
  source: string;
  relevance: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  confidence?: number;
  isError?: boolean;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  confidence: number;
  session_id: string;
}

export interface Provider {
  id: number;
  name: string;
  type: "broker" | "fund_manager" | "sacco" | "bank" | "government";
  regulated_by: string | null;
  regulation_status: "verified" | "unverified" | "flagged";
  fees_text: string | null;
  beginner_friendly: boolean;
  website: string | null;
  description: string | null;
}

export interface Investment {
  id: number;
  name: string;
  category: "bond" | "tbill" | "stock" | "etf" | "reit" | "mmf" | "sacco_shares" | "unit_trust";
  risk_level: "low" | "medium" | "high" | null;
  expected_return_min: number | null;
  expected_return_max: number | null;
  min_investment_kes: number | null;
  regulator: string | null;
  where_to_buy: string | null;
  description: string | null;
  is_scam_flagged: boolean;
  provider: Provider | null;
}

export interface AllocationItem {
  category: string;
  allocation_pct: number;
  rationale: string;
  example_products: string[];
}

export interface RecommendationResponse {
  plan: AllocationItem[];
  explanation: string;
  recommended_actions: string[];
  sources: string[];
  disclaimer: string;
}

export interface UserProfile {
  income_kes_monthly: number;
  risk: "low" | "medium" | "high";
  goals: string[];
  horizon_years: number;
  age: number;
  has_debt: boolean;
}

export interface StockQuote {
  ticker: string;
  price_date: string;
  close: number;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  source: string;
}

export interface MacroIndicator {
  indicator: string;
  value: number;
  unit: string;
  recorded_date: string;
  source: string | null;
}
