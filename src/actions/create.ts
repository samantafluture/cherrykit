import minimist from "minimist";
import { createExperiment } from "../tracker/experiments.js";
import { getSurveyQuestions } from "../generator/survey.js";
import { generatePage } from "../generator/page.js";
import type { ProductType } from "../types/index.js";

const args = minimist(process.argv.slice(2));

function required(key: string): string {
  const val = args[key];
  if (!val) {
    console.error(`Missing required argument: --${key}`);
    process.exit(1);
  }
  return String(val);
}

const productType = required("type") as ProductType;

const experiment = createExperiment({
  name: required("name"),
  slug: required("slug"),
  product_type: productType,
  one_liner: required("one-liner"),
  target_audience: required("audience"),
  headline: required("headline"),
  subheadline: required("subheadline"),
  pain_points: args["pain-points"] ? JSON.parse(args["pain-points"]) : undefined,
  benefits: args["benefits"] ? JSON.parse(args["benefits"]) : undefined,
  accent_color: args["accent-color"],
  survey_questions: getSurveyQuestions(productType),
});

const outputDir = generatePage(experiment);

console.log(
  JSON.stringify({ ...experiment, _page_output: outputDir }, null, 2)
);
