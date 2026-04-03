import minimist from "minimist";
import { getExperiment } from "../tracker/experiments.js";
import { recordDailyMetrics } from "../tracker/metrics.js";

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

const date = args.date;
if (!date) {
  console.error("Missing required argument: --date");
  process.exit(1);
}

recordDailyMetrics(experiment.id, {
  date: String(date),
  unique_visitors: Number(args.visitors ?? 0),
  page_views: Number(args["page-views"] ?? 0),
  signups: Number(args.signups ?? 0),
});

console.log(
  JSON.stringify({
    success: true,
    experiment: experiment.slug,
    date: String(date),
  })
);
