# Rapid Validation Kit — Implementation Backlog

**Version:** 1.0
**Date:** March 29, 2026
**Status:** Approved
**Companion docs:** rapid-validation-kit-prd.md, TDD.md

---

## Scope Decisions

- **Repo:** All code lives inside the `cherrykit` repo
- **Existing code:** Fresh setup for both Astro and Fastify (no prior code to reuse)
- **Testing:** Minimal / manual only for V1 (no test framework)
- **Deployment:** Local-first V1 — VPS deploy scripts are a follow-up phase

---

## Execution Order and Dependencies

```
Phase 0 (Scaffolding)
  └─→ Phase 1 (Data Layer)
        ├─→ Phase 2 (Tracker)
        │     ├─→ Phase 3 (Analyzer)
        │     ├─→ Phase 6 (Fastify API)
        │     └─→ Phase 7 (Action Scripts) ←── depends on 3, 4, 6
        └─→ Phase 4 (Generator)
              └─→ Phase 5 (Astro Template)
All ──→ Phase 8 (SKILL.md + Integration)
```

Phases 2 and 4 can be built in parallel. Phase 5 can be built in parallel with Phase 3/6. Phase 7 ties everything together, and Phase 8 is the final integration pass.

---

## Phase 0 — Project Scaffolding

> Set up the monorepo structure, tooling, and dependencies so every subsequent phase has a clean foundation.

### Task 0.1 — Initialize pnpm and TypeScript config

- `pnpm init` at repo root
- Install TypeScript, tsx, `@types/node`
- Create `tsconfig.json` with strict mode, ES2022 target, NodeNext module resolution
- Add `.gitignore` (node_modules, dist, data/*.db)

### Task 0.2 — Create project directory structure

```
cherrykit/
├── src/
│   ├── db/              # Database setup and migrations
│   ├── types/           # Shared TypeScript interfaces
│   ├── tracker/         # CRUD modules
│   ├── generator/       # Page, survey, ad-copy generators
│   ├── analyzer/        # Scorecard and comparison logic
│   ├── api/             # Fastify endpoints
│   └── actions/         # CLI action scripts (entry points)
├── templates/
│   └── landing/         # Astro landing page template
├── data/                # SQLite DB location (gitignored)
├── dist/                # Built landing pages (gitignored)
├── docs/                # PRD, TDD, backlog
└── SKILL.md             # Claude Code skill definition
```

### Task 0.3 — Install core dependencies

- `better-sqlite3` + `@types/better-sqlite3`
- `ulid` for ID generation
- `fastify`, `@fastify/cors`, `@fastify/rate-limit`
- `astro` (installed inside `templates/landing/`)
- `minimist` + `@types/minimist` for CLI arg parsing

---

## Phase 1 — Data Layer

> Types, database initialization, and migrations. Everything else builds on this.

### Task 1.1 — Define TypeScript types (`src/types/`)

- `experiment.ts` — `Experiment`, `CreateExperimentInput`, `ProductType`, `ExperimentStatus`, `Verdict`
- `signup.ts` — `Signup`, `SignupData`
- `survey.ts` — `SurveyQuestion`, `SurveyResponse`, `SurveyResponseInput`
- `metrics.ts` — `DailyMetrics`, `DailyMetricsInput`, `AggregatedMetrics`
- `scorecard.ts` — `Scorecard`, `SignalStrength`, `Comparison`
- `ad-copy.ts` — `AdCopyOutput`, `AdVariant`, `CommunityPost`
- `index.ts` — barrel export

### Task 1.2 — Database initialization (`src/db/`)

- `connection.ts` — singleton `getDb()` that opens/creates `data/rvk.db`, enables WAL mode, enables foreign keys
- `migrate.ts` — runs all CREATE TABLE statements from the TDD (experiments, signups, survey_responses, daily_metrics) with `IF NOT EXISTS`
- `index.ts` — exports `getDb()` which auto-runs migrations on first call

### Task 1.3 — ULID helper (`src/db/id.ts`)

- Export `generateId()` wrapping `ulid()` for consistent ID generation across all modules

---

## Phase 2 — Tracker Module

> CRUD operations that action scripts and the API will call. Pure data logic, no I/O beyond SQLite.

### Task 2.1 — Experiment CRUD (`src/tracker/experiments.ts`)

- `createExperiment(input)` — validates required fields, generates ULID, sets `created_at`/`updated_at`, inserts, returns full record
- `getExperiment(idOrSlug)` — looks up by ID first, falls back to slug
- `listExperiments(filters?)` — optional filtering by `status` and/or `product_type`, ordered by `created_at DESC`
- `updateExperiment(id, updates)` — partial update, bumps `updated_at`
- `setVerdict(id, verdict, reasoning)` — sets verdict + reasoning, updates status to "decided", sets `ended_at`

### Task 2.2 — Signup handler (`src/tracker/signups.ts`)

- `recordSignup(experimentId, data)` — deduplicates by email+experiment, captures all UTM params
- `getSignupCount(experimentId, filters?)` — count with optional source filter
- `getSignupsBySource(experimentId)` — grouped counts by `utm_source`

### Task 2.3 — Survey handler (`src/tracker/surveys.ts`)

- `recordSurveyResponse(data)` — stores individual question response linked to experiment and optionally to signup
- `getSurveyResponses(experimentId)` — all responses for an experiment
- `getSurveyResponseRate(experimentId)` — distinct respondents / total signups

### Task 2.4 — Metrics handler (`src/tracker/metrics.ts`)

- `recordDailyMetrics(experimentId, data)` — upsert (INSERT OR REPLACE on experiment_id+date unique constraint)
- `getMetricsTimeline(experimentId)` — ordered by date ASC
- `getTotalMetrics(experimentId)` — SUM of visitors, page_views, signups across all days

---

## Phase 3 — Analyzer Module

> Reads tracker data, computes scorecards and comparisons. Outputs structured JSON for Claude Code to interpret.

### Task 3.1 — Scorecard generator (`src/analyzer/scorecard.ts`)

- `generateScorecard(experimentId)` — pulls total metrics, signup count, survey rate, ad spend from tracker
- Computes: signup_rate, survey_response_rate, cost_per_signup, best/worst source
- Classifies each metric as "strong" / "promising" / "weak" using PRD thresholds
- Sets data_confidence based on visitor count (high: 200+, medium: 100-199, low: <100)
- Returns typed `Scorecard` object

### Task 3.2 — Comparison (`src/analyzer/compare.ts`)

- `compareExperiments(slugsOrIds)` — generates scorecard for each, returns array
- Sorts by signup_rate descending
- `recommendation` field left as empty string (Claude Code fills this in during skill interaction)

---

## Phase 4 — Generator Module

> Creates experiment assets: survey config, ad copy template, and page files.

### Task 4.1 — Survey generator (`src/generator/survey.ts`)

- `generateSurveyQuestions(productType, targetAudience)` — returns default questions for the given product type
- Contains the full `DEFAULT_SURVEYS` map for all 5 product types (app, kdp, notion, etsy, saas)
- Returns `SurveyQuestion[]` that gets stored as JSON in the experiment record

### Task 4.2 — Ad copy template generator (`src/generator/ad-copy.ts`)

- `generateAdCopyTemplate(experiment)` — builds the `AdCopyOutput` structure with:
  - UTM-tagged URLs per platform (reddit, meta, google, organic)
  - Platform-specific constraints (character limits, tone rules)
  - Empty variant arrays (Claude Code fills the actual copy)
- Pure data formatting — no LLM calls

### Task 4.3 — Page generator (`src/generator/page.ts`)

- `generatePageFiles(experiment)` — writes `experiment.json` into the Astro template directory
- Copies the template to a working directory `dist/{slug}-build/`
- Contains product-type config map (CTA text, hero visual class, survey Q3)
- Does NOT run `astro build` — that's the deploy action's job

---

## Phase 5 — Astro Landing Page Template

> The reusable Astro project that gets data-injected per experiment.

### Task 5.1 — Astro project setup (`templates/landing/`)

- `pnpm init` + install `astro` inside `templates/landing/`
- `astro.config.mjs` — static output mode, base path configurable via env
- `package.json` with `build` script

### Task 5.2 — Base layout (`templates/landing/src/layouts/Base.astro`)

- HTML shell with Inter font (system fallback), meta viewport, configurable accent color via CSS custom properties
- Slot for page content
- Analytics snippet placeholder (commented out for local-first V1)
- Responsive: max-width 640px centered container

### Task 5.3 — Landing page components

- `Hero.astro` — headline, subheadline, product-type-aware mockup placeholder, primary CTA
- `SignupForm.astro` — email input + submit button, posts to configurable API endpoint, inline JS for form submission + redirect to thank-you page
- `PainPoints.astro` — "Sound familiar?" section with 3 cards from experiment data
- `Benefits.astro` — 3 outcome-framed benefit cards
- `SocialProof.astro` — placeholder text ("Join N+ others")

### Task 5.4 — Pages

- `index.astro` — reads `experiment.json`, renders Hero + PainPoints + Benefits + SocialProof + second SignupForm
- `thanks.astro` — confirmation message + embedded Survey component + share link

### Task 5.5 — Survey component (`Survey.astro`)

- Renders 2-3 questions from experiment's `survey_questions` config
- Supports "text" and "select" question types
- Submits to the survey API endpoint via inline JS
- Shows "Thank you" confirmation after submission

---

## Phase 6 — Fastify API

> Local API server for receiving signups and survey responses from landing pages.

### Task 6.1 — Server setup (`src/api/server.ts`)

- Creates Fastify instance with CORS (allow localhost + future validate domain)
- Registers rate-limit plugin (10 requests/minute per IP on signup endpoint)
- Exports `startServer(port)` and `buildApp()` (for testing without listening)

### Task 6.2 — Signup route (`src/api/routes/signup.ts`)

- `POST /api/validate/:experimentId/signup`
- Validates email format, checks experiment exists and is live/collecting
- Calls `tracker.recordSignup()` — idempotent on duplicate email
- Returns `{ success: true }`

### Task 6.3 — Survey route (`src/api/routes/survey.ts`)

- `POST /api/validate/:experimentId/survey`
- Validates experiment exists
- Iterates `responses` array, calls `tracker.recordSurveyResponse()` for each
- Returns `{ success: true }`

### Task 6.4 — Server entry point (`src/api/index.ts`)

- Imports server, registers routes, starts listening on port 3848
- Can be run via `npx tsx src/api/index.ts`

---

## Phase 7 — Action Scripts (CLI Entry Points)

> Each script is a standalone CLI that the SKILL.md references. Parses args with minimist, calls modules, outputs JSON to stdout.

### Task 7.1 — `create.ts`

- Parses: `--name`, `--slug`, `--type`, `--one-liner`, `--audience`, `--headline`, `--subheadline`, optional `--pain-points`, `--benefits`, `--accent-color`
- Calls `generator.generateSurveyQuestions()` for defaults
- Calls `tracker.createExperiment()`
- Calls `generator.generatePageFiles()` to write Astro template data
- Outputs experiment JSON to stdout

### Task 7.2 — `list.ts`

- Parses: optional `--status`, `--type`
- Calls `tracker.listExperiments()`
- Outputs formatted table or JSON

### Task 7.3 — `update.ts`

- Parses: `--experiment` (slug or ID), plus any updatable fields (`--status`, `--ad-spend`, `--headline`, etc.)
- Calls `tracker.updateExperiment()`
- Outputs updated experiment JSON

### Task 7.4 — `verdict.ts`

- Parses: `--experiment`, `--verdict` (build/pivot/kill), `--reasoning`
- Calls `tracker.setVerdict()`
- Outputs updated experiment JSON

### Task 7.5 — `record-metrics.ts`

- Parses: `--experiment`, `--date`, `--visitors`, `--page-views`, `--signups`
- Calls `tracker.recordDailyMetrics()`
- Outputs confirmation

### Task 7.6 — `scorecard.ts`

- Parses: `--experiment`
- Calls `analyzer.generateScorecard()`
- Outputs scorecard JSON

### Task 7.7 — `compare.ts`

- Parses: `--experiments` (space-separated slugs)
- Calls `analyzer.compareExperiments()`
- Outputs comparison JSON

### Task 7.8 — `ad-copy.ts`

- Parses: `--experiment`
- Calls `generator.generateAdCopyTemplate()`
- Outputs ad copy template JSON with UTM URLs

### Task 7.9 — `deploy.ts`

- Parses: `--experiment`
- Calls `generator.generatePageFiles()` to ensure template data is fresh
- Runs `pnpm build` inside the template directory
- Copies built files to `dist/{slug}/`
- Updates experiment status to "live" with `started_at`
- For V1: outputs local path. VPS rsync/scp added in future phase.

---

## Phase 8 — SKILL.md and Integration

> Wire everything together with the Claude Code skill definition.

### Task 8.1 — Write SKILL.md

- Adapt the SKILL.md from the TDD, adjusting paths from `~/projects/rapid-validation-kit` to the cherrykit repo location
- Include all action script commands, decision thresholds, and interpretation guidelines

### Task 8.2 — Add npm scripts to root `package.json`

- `"api"` — starts the Fastify server
- `"create"`, `"list"`, `"scorecard"`, etc. — convenience aliases for action scripts
- Keeps SKILL.md commands simple

### Task 8.3 — End-to-end manual smoke test

- Run through the full flow locally: create experiment, generate page, build, start API, submit signup, submit survey, check scorecard
- Fix any integration issues
