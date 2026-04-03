import minimist from "minimist";
import { getExperiment } from "../tracker/experiments.js";
import { generateAdCopyTemplate } from "../generator/ad-copy.js";

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

const template = generateAdCopyTemplate(experiment);
console.log(JSON.stringify(template, null, 2));
