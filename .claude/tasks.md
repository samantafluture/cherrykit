# Project: CherryKit

> Last synced to repo: —
> Last agent update: 2026-04-03

## Active Sprint

### P0 — Must do now
_All P0 tasks complete!_

### P1 — Should do this week
- [ ] Create UI/UX design skill for landing pages `[L]` #frontend #skill
  > A Claude Code skill that generates professional, modern landing page designs tailored to each experiment's target audience. Must use plan mode and a high-effort model (Opus). The skill should:
  > - **Interview the user** first — ask about brand personality, competitor examples, tone, audience demographics, price point, visual references, before generating anything
  > - **Generate a full design system** per experiment: color palette (primary, accent, neutral, semantic), typography scale (font pairing, sizes, weights, line heights), spacing system, border radii, shadows
  > - **Write conversion-optimized copy** — headline variants, subheadlines, pain points, benefits, CTAs, social proof placeholders, all written in the voice that resonates with the specific target audience
  > - **Design micro-interactions** — hover states, form focus animations, scroll reveals, loading states, success/error feedback, CTA pulse/glow
  > - **Specify icons and imagery** — icon style (outline/filled/duotone), placeholder image descriptions for hero/mockup, visual metaphors that connect with the audience
  > - **Output Astro components** — update the actual template files with the generated design (CSS custom properties, component props, animation keyframes)
  > - The skill must feel like hiring a senior UI/UX designer + copywriter combo, not a generic template swap

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
- [x] Phase 5: Astro landing page template — layout, components, pages `[L]` #frontend ✅ 2026-04-03
- [x] Phase 7: Action scripts — 9 CLI entry points `[M]` #backend ✅ 2026-04-03
- [x] Phase 8: SKILL.md + integration + smoke test `[M]` #setup #launch ✅ 2026-04-03
- [x] VPS first deploy `[S]` #devops ✅ 2026-04-03
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
> Agent: Added P1 task: UI/UX design skill for landing pages — high-effort Opus model, plan mode, user interview flow, generates full design system + copy + micro-interactions + Astro components per experiment. (2026-04-03)
> Agent: All P0 tasks complete! Phase 5 (Astro template with 5 components), Phase 8 (SKILL.md + smoke test), and VPS deploy all done. API healthy on VPS. Fixed: divergent branches (git fetch+reset), Docker healthcheck (node fetch instead of wget), deploy.sh health check (docker exec through nginx). Updated /vps-ops and /vps-setup skills with all lessons learned. (2026-04-03)
