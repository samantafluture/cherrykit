import minimist from "minimist";
import { getExperiment } from "../tracker/experiments.js";
import { compareExperiments } from "../analyzer/compare.js";

const args = minimist(process.argv.slice(2));

const slugs = args.experiments || args._;
if (!slugs || (Array.isArray(slugs) && slugs.length === 0)) {
  console.error(
    "Missing required argument: --experiments slug1 slug2"
  );
  process.exit(1);
}

const slugList = Array.isArray(slugs) ? slugs : [slugs];
const ids: string[] = [];

for (const slug of slugList) {
  const exp = getExperiment(String(slug));
  if (!exp) {
    console.error(`Experiment not found: ${slug}`);
    process.exit(1);
  }
  ids.push(exp.id);
}

const comparison = compareExperiments(ids);
console.log(JSON.stringify(comparison, null, 2));
