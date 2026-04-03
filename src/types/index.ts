// ── Product types ──────────────────────────────────────────────
export type ProductType = "app" | "kdp" | "notion" | "etsy" | "saas";

export type ExperimentStatus =
  | "draft"
  | "live"
  | "collecting"
  | "analyzing"
  | "decided";

export type Verdict = "build" | "pivot" | "kill";

// ── Experiment ─────────────────────────────────────────────────
export interface Experiment {
  id: string;
  name: string;
  slug: string;
  product_type: ProductType;
  one_liner: string;
  target_audience: string;
  status: ExperimentStatus;
  verdict: Verdict | null;
  verdict_reasoning: string | null;
  headline: string;
  subheadline: string;
  pain_points: string[]; // stored as JSON TEXT in SQLite
  benefits: string[]; // stored as JSON TEXT in SQLite
  accent_color: string;
  survey_questions: SurveyQuestion[]; // stored as JSON TEXT in SQLite
  ad_spend: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExperimentInput {
  name: string;
  slug: string;
  product_type: ProductType;
  one_liner: string;
  target_audience: string;
  headline: string;
  subheadline: string;
  pain_points?: string[];
  benefits?: string[];
  accent_color?: string;
  survey_questions?: SurveyQuestion[];
}

// ── Signup ──────────────────────────────────────────────────────
export interface Signup {
  id: string;
  experiment_id: string;
  email: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  signed_up_at: string;
}

export interface SignupData {
  email: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

// ── Survey ──────────────────────────────────────────────────────
export interface SurveyQuestion {
  key: string;
  text: string;
  type?: "text" | "select";
  options?: string[];
}

export interface SurveyResponse {
  id: string;
  experiment_id: string;
  signup_id: string | null;
  question_key: string;
  response_text: string;
  responded_at: string;
}

export interface SurveyResponseInput {
  experiment_id: string;
  signup_id?: string;
  question_key: string;
  response_text: string;
}

// ── Daily Metrics ───────────────────────────────────────────────
export interface DailyMetrics {
  id: string;
  experiment_id: string;
  date: string;
  unique_visitors: number;
  page_views: number;
  signups: number;
}

export interface DailyMetricsInput {
  date: string;
  unique_visitors: number;
  page_views: number;
  signups: number;
}

export interface AggregatedMetrics {
  total_visitors: number;
  total_page_views: number;
  total_signups: number;
  signup_rate: number;
  days_tracked: number;
}

// ── Scorecard ───────────────────────────────────────────────────
export type SignalStrength = "strong" | "promising" | "weak";
export type DataConfidence = "high" | "medium" | "low";

export interface Scorecard {
  experiment_id: string;
  experiment_name: string;
  status: string;
  metrics: {
    total_visitors: number;
    total_signups: number;
    signup_rate: number;
    survey_response_rate: number;
    cost_per_signup: number | null;
    best_source: string;
    worst_source: string;
  };
  signals: {
    signup_rate: SignalStrength;
    survey_rate: SignalStrength;
    cost_efficiency: SignalStrength | "unknown";
  };
  data_confidence: DataConfidence;
  days_active: number;
}

export interface Comparison {
  experiments: Scorecard[];
  recommendation: string;
}

// ── Ad Copy ─────────────────────────────────────────────────────
export interface AdVariant {
  headline: string;
  body: string;
  cta: string;
  url: string;
  targeting_notes: string;
}

export interface CommunityPost {
  platform: string;
  post_title: string;
  post_body: string;
  posting_notes: string;
}

export interface AdCopyOutput {
  experiment_id: string;
  generated_at: string;
  platforms: {
    reddit: { variants: AdVariant[] };
    meta: { variants: AdVariant[] };
    google: { variants: AdVariant[] };
    organic: { variants: CommunityPost[] };
  };
}
