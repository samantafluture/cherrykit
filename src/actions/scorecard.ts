import minimist from "minimist";
import { getExperiment } from "../tracker/experiments.js";
import { generateScorecard } from "../analyzer/scorecard.js";

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

const scorecard = generateScorecard(experiment.id);
console.log(JSON.stringify(scorecard, null, 2));
