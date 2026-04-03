import { getDb } from "../db/connection.js";
import { newId } from "../db/id.js";
import type { Signup, SignupData } from "../types/index.js";

export function recordSignup(
  experimentId: string,
  data: SignupData
): Signup {
  const db = getDb();
  const now = new Date().toISOString();
  const id = newId();

  // Idempotent — skip duplicate emails for same experiment
  const existing = db
    .prepare(
      "SELECT id FROM signups WHERE experiment_id = ? AND email = ?"
    )
    .get(experimentId, data.email) as { id: string } | undefined;

  if (existing) {
    return db
      .prepare("SELECT * FROM signups WHERE id = ?")
      .get(existing.id) as Signup;
  }

  db.prepare(
    `INSERT INTO signups
      (id, experiment_id, email, utm_source, utm_medium, utm_campaign, utm_content, signed_up_at)
     VALUES
      (@id, @experiment_id, @email, @utm_source, @utm_medium, @utm_campaign, @utm_content, @signed_up_at)`
  ).run({
    id,
    experiment_id: experimentId,
    email: data.email,
    utm_source: data.utm_source ?? null,
    utm_medium: data.utm_medium ?? null,
    utm_campaign: data.utm_campaign ?? null,
    utm_content: data.utm_content ?? null,
    signed_up_at: now,
  });

  return db.prepare("SELECT * FROM signups WHERE id = ?").get(id) as Signup;
}

export function getSignupCount(
  experimentId: string,
  filters?: { source?: string }
): number {
  const db = getDb();

  if (filters?.source) {
    const row = db
      .prepare(
        "SELECT COUNT(*) as count FROM signups WHERE experiment_id = ? AND utm_source = ?"
      )
      .get(experimentId, filters.source) as { count: number };
    return row.count;
  }

  const row = db
    .prepare(
      "SELECT COUNT(*) as count FROM signups WHERE experiment_id = ?"
    )
    .get(experimentId) as { count: number };
  return row.count;
}

export function getSignupsBySource(
  experimentId: string
): Record<string, number> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT COALESCE(utm_source, 'direct') as source, COUNT(*) as count
       FROM signups WHERE experiment_id = ?
       GROUP BY utm_source`
    )
    .all(experimentId) as { source: string; count: number }[];

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.source] = row.count;
  }
  return result;
}
