import type Database from "better-sqlite3";

export function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS experiments (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      slug            TEXT NOT NULL UNIQUE,
      product_type    TEXT NOT NULL,
      one_liner       TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'draft',
      verdict         TEXT,
      verdict_reasoning TEXT,
      headline        TEXT NOT NULL,
      subheadline     TEXT NOT NULL,
      pain_points     TEXT,
      benefits        TEXT,
      accent_color    TEXT DEFAULT '#6366f1',
      survey_questions TEXT,
      ad_spend        REAL DEFAULT 0,
      started_at      TEXT,
      ended_at        TEXT,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS signups (
      id              TEXT PRIMARY KEY,
      experiment_id   TEXT NOT NULL REFERENCES experiments(id),
      email           TEXT NOT NULL,
      utm_source      TEXT,
      utm_medium      TEXT,
      utm_campaign    TEXT,
      utm_content     TEXT,
      signed_up_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_signups_experiment
      ON signups(experiment_id);
    CREATE INDEX IF NOT EXISTS idx_signups_source
      ON signups(experiment_id, utm_source);

    CREATE TABLE IF NOT EXISTS survey_responses (
      id              TEXT PRIMARY KEY,
      experiment_id   TEXT NOT NULL REFERENCES experiments(id),
      signup_id       TEXT REFERENCES signups(id),
      question_key    TEXT NOT NULL,
      response_text   TEXT NOT NULL,
      responded_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_survey_experiment
      ON survey_responses(experiment_id);

    CREATE TABLE IF NOT EXISTS daily_metrics (
      id              TEXT PRIMARY KEY,
      experiment_id   TEXT NOT NULL REFERENCES experiments(id),
      date            TEXT NOT NULL,
      unique_visitors INTEGER DEFAULT 0,
      page_views      INTEGER DEFAULT 0,
      signups         INTEGER DEFAULT 0,
      UNIQUE(experiment_id, date)
    );
  `);
}
