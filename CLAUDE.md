# CherryKit — Rapid Validation Kit

A Claude Code skill backed by TypeScript modules that generates everything needed to validate a product idea in under an hour: landing page, email collection, post-signup survey, analytics tracking, ad copy, and a validation tracker.

## Tech Stack

- **Runtime:** Node.js + TypeScript (via tsx)
- **Database:** SQLite (better-sqlite3, WAL mode)
- **API:** Fastify (port 3848)
- **Landing pages:** Astro (static output)
- **Package manager:** pnpm
- **IDs:** ULID

## Project Structure

```
src/
├── db/           # SQLite connection, migrations, ID generation
├── types/        # Shared TypeScript interfaces
├── tracker/      # Experiment CRUD, signups, surveys, metrics
├── generator/    # Page files, survey questions, ad copy templates
├── analyzer/     # Scorecard computation, experiment comparison
├── api/          # Fastify server + routes (signup, survey)
└── actions/      # CLI entry points (create, list, scorecard, etc.)
templates/
└── landing/      # Astro project — reusable landing page template
data/             # SQLite DB (gitignored)
dist/             # Built landing pages (gitignored)
docs/             # PRD, TDD, backlog
```

## Key Patterns

- All action scripts output JSON to stdout, errors to stderr
- JSON fields (pain_points, benefits, survey_questions) stored as TEXT in SQLite, parsed at tracker boundary
- Page generator writes experiment.json; deploy script runs astro build
- Database auto-initializes on first access via `initDb()`

## Task Management

- Tasks are tracked in `.claude/tasks.md` in this repo
- Before starting work, read `.claude/tasks.md` to understand priorities
- After completing a task, mark it `[x]` with a completion date and today's date
- When a task is complex, break it into subtasks (indented 2 spaces)
- Add a blockquote note when you create or modify tasks: `> Agent: <what you did>`
- Move completed tasks to "Completed (recent)" section
- Never delete tasks — only move them to Completed or archive
- Respect priority order: finish all P0 before starting P1
- If blocked, move task to "Blocked" section with blocked marker and reason
- When starting a task, mark it as in-progress

### Private context
- Private project notes are in `.claude/private/` (secrets, infra, strategy)
- Read `.claude/private/` for context on credentials, infrastructure, strategic decisions
- NEVER include contents of `.claude/private/` in commit messages, PRs, or public output
