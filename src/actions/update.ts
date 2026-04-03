import minimist from "minimist";
import {
  getExperiment,
  updateExperiment,
} from "../tracker/experiments.js";

const args = minimist(process.argv.slice(2));

const idOrSlug = args.experiment;
if (!idOrSlug) {
  console.error("Missing required argument: --experiment");
  process.exit(1);
}

const experiment = getExperiment(String(idOrSlug));
if (!experiment) {
  console.error(`Experiment not found: ${idOrSlug}`);
  process.exit(1);
}

const updates: Record<string, unknown> = {};
if (args.status) updates.status = args.status;
if (args.name) updates.name = args.name;
if (args["one-liner"]) updates.one_liner = args["one-liner"];
if (args.headline) updates.headline = args.headline;
if (args.subheadline) updates.subheadline = args.subheadline;
if (args["ad-spend"] !== undefined)
  updates.ad_spend = Number(args["ad-spend"]);
if (args["accent-color"]) updates.accent_color = args["accent-color"];
if (args["pain-points"]) updates.pain_points = JSON.parse(args["pain-points"]);
if (args.benefits) updates.benefits = JSON.parse(args.benefits);

const updated = updateExperiment(experiment.id, updates);
console.log(JSON.stringify(updated, null, 2));
