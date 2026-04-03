import minimist from "minimist";
import { listExperiments } from "../tracker/experiments.js";

const args = minimist(process.argv.slice(2));

const experiments = listExperiments({
  status: args.status,
  product_type: args.type,
});

console.log(JSON.stringify(experiments, null, 2));
