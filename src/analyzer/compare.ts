import { generateScorecard } from "./scorecard.js";
import type { Comparison } from "../types/index.js";

export function compareExperiments(ids: string[]): Comparison {
  const experiments = ids.map((id) => generateScorecard(id));

  return {
    experiments,
    recommendation: "", // Populated by Claude Code during skill interaction
  };
}
