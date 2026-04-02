# Project: CherryKit

> Last synced to repo: —
> Last agent update: 2026-04-02

## Active Sprint

### P0 — Must do now
- [/] Phase 0: Project scaffolding — pnpm, tsconfig, .gitignore, dirs, deps `[M]` #setup ⏳ in-progress
  - [x] pnpm init, package.json with scripts ✅ 2026-04-02
  - [x] tsconfig.json (strict, ES2022, NodeNext) ✅ 2026-04-02
  - [x] .gitignore ✅ 2026-04-02
  - [x] Directory structure (src/*, templates/, data/, dist/) ✅ 2026-04-02
  - [ ] Install runtime deps (better-sqlite3, ulid, fastify, minimist, etc.)
  - [ ] Install dev deps (typescript, tsx, @types/*)
- [ ] Phase 1: Data layer — TypeScript types, DB connection, migrations, ULID helper `[M]` #backend
  - [ ] src/types/ — Experiment, Signup, Survey, Metrics, Scorecard, AdCopy types
  - [ ] src/db/connection.ts — SQLite singleton, WAL mode, foreign keys
  - [ ] src/db/migrate.ts — 4 CREATE TABLE + 3 CREATE INDEX
  - [ ] src/db/id.ts — ULID helper
- [ ] Phase 2: Tracker module — experiment CRUD, signups, surveys, metrics `[M]` #backend
  - [ ] src/tracker/experiments.ts — create, get, list, update, setVerdict
  - [ ] src/tracker/signups.ts — recordSignup, getSignupCount, getSignupsBySource
  - [ ] src/tracker/surveys.ts — recordSurveyResponse, getSurveyResponses, getSurveyResponseRate
  - [ ] src/tracker/metrics.ts — recordDailyMetrics, getMetricsTimeline, getTotalMetrics
- [ ] Phase 4: Generator module — survey, ad copy template, page generator `[M]` #backend
  - [ ] src/generator/survey.ts — DEFAULT_SURVEYS for 5 product types
  - [ ] src/generator/ad-copy.ts — platform constraints, UTM URLs, template structure
  - [ ] src/generator/page.ts — write experiment.json, copy template to dist/
- [ ] Phase 3: Analyzer module — scorecard, experiment comparison `[S]` #backend
  - [ ] src/analyzer/scorecard.ts — compute metrics, classify signals, data confidence
  - [ ] src/analyzer/compare.ts — side-by-side scorecards
- [ ] Phase 5: Astro landing page template — layout, components, pages `[L]` #frontend
  - [ ] templates/landing/ — Astro project setup
  - [ ] Base.astro layout — Inter font, accent color, 640px centered
  - [ ] Hero.astro, SignupForm.astro, PainPoints.astro, Benefits.astro, SocialProof.astro
  - [ ] Survey.astro — post-signup questions
  - [ ] index.astro + thanks.astro pages
- [ ] Phase 6: Fastify API — server, signup route, survey route `[M]` #backend
  - [ ] src/api/server.ts — Fastify + CORS + rate-limit
  - [ ] src/api/routes/signup.ts — POST /api/validate/:experimentId/signup
  - [ ] src/api/routes/survey.ts — POST /api/validate/:experimentId/survey
  - [ ] src/api/index.ts — entry point on port 3848
- [ ] Phase 7: Action scripts — 9 CLI entry points `[M]` #backend
  - [ ] create.ts, list.ts, update.ts, verdict.ts
  - [ ] record-metrics.ts, scorecard.ts, compare.ts
  - [ ] ad-copy.ts, deploy.ts
- [ ] Phase 8: SKILL.md + integration + smoke test `[M]` #setup #launch
  - [ ] SKILL.md at project root
  - [ ] CLAUDE.md updates
  - [ ] End-to-end smoke test
- [ ] VPS first deploy — run after code is built `[S]` #devops
  > Blocked until Phase 6 (Fastify API) is done — no API container to deploy yet

### P1 — Should do this week

### P2 — Nice to have
- [ ] Write blog post about Notion + Claude Code connection for Substack `[M]` #content
- [ ] Create Substack publishing skill `[M]` #devops

## Blocked

## Completed (recent)
- [x] CherryTasks setup — tasks.md, private/, CLAUDE.md task section `[S]` #setup ✅ 2026-04-02
- [x] Git init + connect to GitHub remote `[S]` #setup ✅ 2026-04-02
- [x] VPS deployment infrastructure `[M]` #devops ✅ 2026-04-02
  - [x] Dockerfile.prod, docker-compose.prod.yml, deploy.sh, deploy.yml
  - [x] DNS A record, SSL cert, Docker volumes, repo clone, nginx config, infra compose, .env, VPS_SSH_KEY

## Notes
- Repo: https://github.com/samantafluture/cherrykit
- See docs/ for PRD, TDD, and backlog
- Build order: Phase 0 → 1 → 2 → 4 → 3 → 5 → 6 → 7 → 8
- VPS: validate.samantafluture.com on Hostinger KVM1
- Docker volumes: cherrykit_data (SQLite), cherrykit_web (static pages)
> Agent: Created initial task list from implementation plan (2026-04-02)
> Agent: Updated with VPS deployment subtasks and completed items (2026-04-02)
> Agent: VPS setup complete — DNS, SSL, volumes, repo clone, nginx, infra compose, .env, VPS_SSH_KEY all done. First deploy blocked on code being built. (2026-04-02)
