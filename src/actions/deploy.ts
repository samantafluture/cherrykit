import minimist from "minimist";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getExperiment,
  updateExperiment,
} from "../tracker/experiments.js";
import { generatePage } from "../generator/page.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

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

// 1. Generate page files
const outputDir = generatePage(experiment);

// 2. Build Astro (if astro.config exists in the output)
try {
  execSync("npx astro build", { cwd: outputDir, stdio: "inherit" });
} catch {
  console.error("Astro build failed — serving raw template files instead");
}

// 3. Update experiment status
if (experiment.status === "draft") {
  updateExperiment(experiment.id, {
    status: "live",
    started_at: new Date().toISOString(),
  });
}

console.log(
  JSON.stringify({
    success: true,
    experiment: experiment.slug,
    output: outputDir,
    status: "live",
  })
);
