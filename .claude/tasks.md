# Project: CherryKit

> Last synced to repo: —
> Last agent update: 2026-04-03

## Active Sprint

### P0 — Must do now
- [ ] Phase 5: Astro landing page template — layout, components, pages `[L]` #frontend
  - [ ] templates/landing/ — Astro project setup
  - [ ] Base.astro layout — Inter font, accent color, 640px centered
  - [ ] Hero.astro, SignupForm.astro, PainPoints.astro, Benefits.astro, SocialProof.astro
  - [ ] Survey.astro — post-signup questions
  - [ ] index.astro + thanks.astro pages
- [ ] Phase 8: SKILL.md + integration + smoke test `[M]` #setup #launch
  - [ ] SKILL.md at project root
  - [ ] CLAUDE.md updates
  - [ ] End-to-end smoke test
- [ ] VPS first deploy — run after code is built `[S]` #devops

### P1 — Should do this week

### P2 — Nice to have
- [ ] Write blog post about Notion + Claude Code connection for Substack `[M]` #content
- [ ] Create Substack publishing skill `[M]` #devops

## Blocked

## Completed (recent)
- [x] Phase 0: Project scaffolding — pnpm, tsconfig, .gitignore, dirs, deps `[M]` #setup ✅ 2026-04-03
- [x] Phase 1: Data layer — types, DB connection, migrations, ULID helper `[M]` #backend ✅ 2026-04-03
- [x] Phase 2: Tracker module — experiment CRUD, signups, surveys, metrics `[M]` #backend ✅ 2026-04-03
- [x] Phase 3: Analyzer module — scorecard, experiment comparison `[S]` #backend ✅ 2026-04-03
- [x] Phase 4: Generator module — survey, ad copy template, page generator `[M]` #backend ✅ 2026-04-03
- [x] Phase 6: Fastify API — server, signup route, survey route `[M]` #backend ✅ 2026-04-03
- [x] Phase 7: Action scripts — 9 CLI entry points `[M]` #backend ✅ 2026-04-03
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
> Agent: Built all backend modules (Phases 0-4, 6-7): types, DB layer, tracker, generator, analyzer, API, and 9 CLI action scripts. TypeScript compiles clean. Smoke test passed (list returns []). Remaining: Phase 5 (Astro template), Phase 8 (SKILL.md + integration), VPS deploy. (2026-04-03)
