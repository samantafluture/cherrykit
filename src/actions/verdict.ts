import minimist from "minimist";
import { getExperiment, setVerdict } from "../tracker/experiments.js";
import type { Verdict } from "../types/index.js";

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

const verdict = args.verdict as Verdict;
if (!["build", "pivot", "kill"].includes(verdict)) {
  console.error("--verdict must be one of: build, pivot, kill");
  process.exit(1);
}

const reasoning = args.reasoning;
if (!reasoning) {
  console.error("Missing required argument: --reasoning");
  process.exit(1);
}

const updated = setVerdict(experiment.id, verdict, String(reasoning));
console.log(JSON.stringify(updated, null, 2));
