import { getExperiment } from "../tracker/experiments.js";
import { getSignupCount, getSignupsBySource } from "../tracker/signups.js";
import { getSurveyResponseRate } from "../tracker/surveys.js";
import { getTotalMetrics } from "../tracker/metrics.js";
import type {
  Scorecard,
  SignalStrength,
  DataConfidence,
} from "../types/index.js";

function classifySignupRate(rate: number): SignalStrength {
  if (rate >= 15) return "strong";
  if (rate >= 5) return "promising";
  return "weak";
}

function classifySurveyRate(rate: number): SignalStrength {
  if (rate >= 40) return "strong";
  if (rate >= 20) return "promising";
  return "weak";
}

function classifyCostEfficiency(
  costPerSignup: number | null
): SignalStrength | "unknown" {
  if (costPerSignup === null) return "unknown";
  if (costPerSignup <= 2) return "strong";
  if (costPerSignup <= 5) return "promising";
  return "weak";
}

function classifyConfidence(visitors: number): DataConfidence {
  if (visitors >= 200) return "high";
  if (visitors >= 100) return "medium";
  return "low";
}

export function generateScorecard(experimentId: string): Scorecard {
  const experiment = getExperiment(experimentId);
  if (!experiment) throw new Error(`Experiment not found: ${experimentId}`);

  const metrics = getTotalMetrics(experimentId);
  const signupCount = getSignupCount(experimentId);
  const surveyRate = getSurveyResponseRate(experimentId);
  const sourceBreakdown = getSignupsBySource(experimentId);

  const signupRate =
    metrics.total_visitors > 0
      ? (signupCount / metrics.total_visitors) * 100
      : 0;

  const costPerSignup =
    experiment.ad_spend > 0 && signupCount > 0
      ? experiment.ad_spend / signupCount
      : null;

  // Find best/worst sources
  const sources = Object.entries(sourceBreakdown).sort(
    ([, a], [, b]) => b - a
  );
  const bestSource = sources[0]?.[0] ?? "none";
  const worstSource = sources[sources.length - 1]?.[0] ?? "none";

  // Calculate days active
  let daysActive = 0;
  if (experiment.started_at) {
    const start = new Date(experiment.started_at);
    const end = experiment.ended_at
      ? new Date(experiment.ended_at)
      : new Date();
    daysActive = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    experiment_id: experiment.id,
    experiment_name: experiment.name,
    status: experiment.status,
    metrics: {
      total_visitors: metrics.total_visitors,
      total_signups: signupCount,
      signup_rate: Math.round(signupRate * 100) / 100,
      survey_response_rate: Math.round(surveyRate * 100) / 100,
      cost_per_signup: costPerSignup
        ? Math.round(costPerSignup * 100) / 100
        : null,
      best_source: bestSource,
      worst_source: worstSource,
    },
    signals: {
      signup_rate: classifySignupRate(signupRate),
      survey_rate: classifySurveyRate(surveyRate),
      cost_efficiency: classifyCostEfficiency(costPerSignup),
    },
    data_confidence: classifyConfidence(metrics.total_visitors),
    days_active: daysActive,
  };
}
