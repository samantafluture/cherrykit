import { getDb } from "../db/connection.js";
import { newId } from "../db/id.js";
import type {
  Experiment,
  CreateExperimentInput,
  Verdict,
} from "../types/index.js";

function rowToExperiment(row: Record<string, unknown>): Experiment {
  return {
    ...(row as unknown as Experiment),
    pain_points: row.pain_points ? JSON.parse(row.pain_points as string) : [],
    benefits: row.benefits ? JSON.parse(row.benefits as string) : [],
    survey_questions: row.survey_questions
      ? JSON.parse(row.survey_questions as string)
      : [],
  };
}

export function createExperiment(input: CreateExperimentInput): Experiment {
  const db = getDb();
  const now = new Date().toISOString();
  const id = newId();

  const stmt = db.prepare(`
    INSERT INTO experiments
      (id, name, slug, product_type, one_liner, target_audience,
       headline, subheadline, pain_points, benefits, accent_color,
       survey_questions, created_at, updated_at)
    VALUES
      (@id, @name, @slug, @product_type, @one_liner, @target_audience,
       @headline, @subheadline, @pain_points, @benefits, @accent_color,
       @survey_questions, @created_at, @updated_at)
  `);

  stmt.run({
    id,
    name: input.name,
    slug: input.slug,
    product_type: input.product_type,
    one_liner: input.one_liner,
    target_audience: input.target_audience,
    headline: input.headline,
    subheadline: input.subheadline,
    pain_points: JSON.stringify(input.pain_points ?? []),
    benefits: JSON.stringify(input.benefits ?? []),
    accent_color: input.accent_color ?? "#6366f1",
    survey_questions: JSON.stringify(input.survey_questions ?? []),
    created_at: now,
    updated_at: now,
  });

  return getExperiment(id)!;
}

export function getExperiment(idOrSlug: string): Experiment | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM experiments WHERE id = ? OR slug = ?")
    .get(idOrSlug, idOrSlug) as Record<string, unknown> | undefined;
  return row ? rowToExperiment(row) : null;
}

export function listExperiments(filters?: {
  status?: string;
  product_type?: string;
}): Experiment[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (filters?.status) {
    conditions.push("status = @status");
    params.status = filters.status;
  }
  if (filters?.product_type) {
    conditions.push("product_type = @product_type");
    params.product_type = filters.product_type;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM experiments ${where} ORDER BY created_at DESC`)
    .all(params) as Record<string, unknown>[];
  return rows.map(rowToExperiment);
}

export function updateExperiment(
  id: string,
  updates: Partial<Experiment>
): Experiment {
  const db = getDb();
  const now = new Date().toISOString();

  const allowed = [
    "name",
    "slug",
    "one_liner",
    "target_audience",
    "status",
    "headline",
    "subheadline",
    "accent_color",
    "ad_spend",
    "started_at",
    "ended_at",
  ];

  const jsonFields = ["pain_points", "benefits", "survey_questions"];

  const sets: string[] = ["updated_at = @updated_at"];
  const params: Record<string, unknown> = { id, updated_at: now };

  for (const key of allowed) {
    if (key in updates) {
      sets.push(`${key} = @${key}`);
      params[key] = (updates as Record<string, unknown>)[key];
    }
  }

  for (const key of jsonFields) {
    if (key in updates) {
      sets.push(`${key} = @${key}`);
      params[key] = JSON.stringify(
        (updates as Record<string, unknown>)[key]
      );
    }
  }

  db.prepare(
    `UPDATE experiments SET ${sets.join(", ")} WHERE id = @id`
  ).run(params);

  return getExperiment(id)!;
}

export function setVerdict(
  id: string,
  verdict: Verdict,
  reasoning: string
): Experiment {
  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE experiments
     SET verdict = @verdict, verdict_reasoning = @reasoning,
         status = 'decided', ended_at = @now, updated_at = @now
     WHERE id = @id`
  ).run({ id, verdict, reasoning, now });

  return getExperiment(id)!;
}
