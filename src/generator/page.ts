import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Experiment } from "../types/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(__dirname, "../../templates/landing");
const DIST_DIR = path.resolve(__dirname, "../../dist");

export function generatePage(experiment: Experiment): string {
  const outputDir = path.join(DIST_DIR, experiment.slug);

  // Copy template to dist/{slug}
  fs.cpSync(TEMPLATE_DIR, outputDir, { recursive: true });

  // Write experiment.json for the Astro template to consume
  const experimentJson = {
    id: experiment.id,
    name: experiment.name,
    slug: experiment.slug,
    product_type: experiment.product_type,
    one_liner: experiment.one_liner,
    headline: experiment.headline,
    subheadline: experiment.subheadline,
    pain_points: experiment.pain_points,
    benefits: experiment.benefits,
    accent_color: experiment.accent_color,
    survey_questions: experiment.survey_questions,
    api_url: `https://validate.samantafluture.com/api/validate/${experiment.id}`,
  };

  fs.writeFileSync(
    path.join(outputDir, "experiment.json"),
    JSON.stringify(experimentJson, null, 2)
  );

  return outputDir;
}
