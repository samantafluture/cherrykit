import type { Experiment, AdCopyOutput } from "../types/index.js";

const PLATFORM_CONSTRAINTS = {
  reddit: {
    headline_max: 300,
    body_max: 10000,
    notes: "Conversational, first-person, no corporate tone",
  },
  meta: {
    headline_max: 40,
    body_max: 125,
    notes: "Short headline, benefit-first, emotional hook",
  },
  google: {
    headline_max: 30,
    body_max: 90,
    notes: "Keyword-driven, 30-char headlines, specific CTAs",
  },
};

function buildUtmUrl(
  slug: string,
  source: string,
  medium: string,
  campaign: string
): string {
  const base = `https://validate.samantafluture.com/${slug}`;
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
  });
  return `${base}?${params.toString()}`;
}

export function generateAdCopyTemplate(experiment: Experiment): AdCopyOutput {
  const campaign = `${experiment.slug}_v1`;

  return {
    experiment_id: experiment.id,
    generated_at: new Date().toISOString(),
    platforms: {
      reddit: {
        variants: [
          {
            headline: "",
            body: "",
            cta: "",
            url: buildUtmUrl(experiment.slug, "reddit", "paid", campaign),
            targeting_notes: `Target: ${experiment.target_audience}. ${PLATFORM_CONSTRAINTS.reddit.notes}. Max headline: ${PLATFORM_CONSTRAINTS.reddit.headline_max} chars.`,
          },
        ],
      },
      meta: {
        variants: [
          {
            headline: "",
            body: "",
            cta: "",
            url: buildUtmUrl(experiment.slug, "meta", "paid", campaign),
            targeting_notes: `Target: ${experiment.target_audience}. ${PLATFORM_CONSTRAINTS.meta.notes}. Max headline: ${PLATFORM_CONSTRAINTS.meta.headline_max} chars, body: ${PLATFORM_CONSTRAINTS.meta.body_max} chars.`,
          },
        ],
      },
      google: {
        variants: [
          {
            headline: "",
            body: "",
            cta: "",
            url: buildUtmUrl(experiment.slug, "google", "paid", campaign),
            targeting_notes: `Target: ${experiment.target_audience}. ${PLATFORM_CONSTRAINTS.google.notes}. Max headline: ${PLATFORM_CONSTRAINTS.google.headline_max} chars, body: ${PLATFORM_CONSTRAINTS.google.body_max} chars.`,
          },
        ],
      },
      organic: {
        variants: [
          {
            platform: "",
            post_title: "",
            post_body: "",
            posting_notes: `Target: ${experiment.target_audience}. URL: ${buildUtmUrl(experiment.slug, "organic", "post", campaign)}`,
          },
        ],
      },
    },
  };
}

export { PLATFORM_CONSTRAINTS };
