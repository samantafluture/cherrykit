import { getDb } from "../db/connection.js";
import { newId } from "../db/id.js";
import type { SurveyResponse, SurveyResponseInput } from "../types/index.js";

export function recordSurveyResponse(
  data: SurveyResponseInput
): SurveyResponse {
  const db = getDb();
  const now = new Date().toISOString();
  const id = newId();

  db.prepare(
    `INSERT INTO survey_responses
      (id, experiment_id, signup_id, question_key, response_text, responded_at)
     VALUES
      (@id, @experiment_id, @signup_id, @question_key, @response_text, @responded_at)`
  ).run({
    id,
    experiment_id: data.experiment_id,
    signup_id: data.signup_id ?? null,
    question_key: data.question_key,
    response_text: data.response_text,
    responded_at: now,
  });

  return db
    .prepare("SELECT * FROM survey_responses WHERE id = ?")
    .get(id) as SurveyResponse;
}

export function getSurveyResponses(
  experimentId: string
): SurveyResponse[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM survey_responses WHERE experiment_id = ? ORDER BY responded_at"
    )
    .all(experimentId) as SurveyResponse[];
}

export function getSurveyResponseRate(experimentId: string): number {
  const db = getDb();

  const signupCount = (
    db
      .prepare(
        "SELECT COUNT(*) as count FROM signups WHERE experiment_id = ?"
      )
      .get(experimentId) as { count: number }
  ).count;

  if (signupCount === 0) return 0;

  // Count unique respondents (distinct signup_id or distinct responded_at for anonymous)
  const respondentCount = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT COALESCE(signup_id, id)) as count
         FROM survey_responses WHERE experiment_id = ?`
      )
      .get(experimentId) as { count: number }
  ).count;

  return (respondentCount / signupCount) * 100;
}
