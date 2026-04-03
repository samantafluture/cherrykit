import { getDb } from "../db/connection.js";
import { newId } from "../db/id.js";
import type {
  DailyMetrics,
  DailyMetricsInput,
  AggregatedMetrics,
} from "../types/index.js";

export function recordDailyMetrics(
  experimentId: string,
  data: DailyMetricsInput
): void {
  const db = getDb();

  // Upsert — replace if same experiment+date
  db.prepare(
    `INSERT INTO daily_metrics
      (id, experiment_id, date, unique_visitors, page_views, signups)
     VALUES (@id, @experiment_id, @date, @unique_visitors, @page_views, @signups)
     ON CONFLICT(experiment_id, date) DO UPDATE SET
       unique_visitors = @unique_visitors,
       page_views = @page_views,
       signups = @signups`
  ).run({
    id: newId(),
    experiment_id: experimentId,
    date: data.date,
    unique_visitors: data.unique_visitors,
    page_views: data.page_views,
    signups: data.signups,
  });
}

export function getMetricsTimeline(
  experimentId: string
): DailyMetrics[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM daily_metrics WHERE experiment_id = ? ORDER BY date"
    )
    .all(experimentId) as DailyMetrics[];
}

export function getTotalMetrics(
  experimentId: string
): AggregatedMetrics {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(unique_visitors), 0) as total_visitors,
         COALESCE(SUM(page_views), 0)      as total_page_views,
         COALESCE(SUM(signups), 0)         as total_signups,
         COUNT(*)                           as days_tracked
       FROM daily_metrics WHERE experiment_id = ?`
    )
    .get(experimentId) as {
    total_visitors: number;
    total_page_views: number;
    total_signups: number;
    days_tracked: number;
  };

  return {
    total_visitors: row.total_visitors,
    total_page_views: row.total_page_views,
    total_signups: row.total_signups,
    signup_rate:
      row.total_visitors > 0
        ? (row.total_signups / row.total_visitors) * 100
        : 0,
    days_tracked: row.days_tracked,
  };
}
