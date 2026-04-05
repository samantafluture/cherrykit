# CherryKit

Rapid product validation kit — generates landing pages, email collection, surveys, analytics, ad copy, and a validation tracker. Claude Code skill backed by TypeScript modules.

## Stack

Node.js + TypeScript (tsx), SQLite (better-sqlite3, WAL), Fastify (port 3848), Astro (landing pages), pnpm. IDs: ULID.

## Structure

```
src/
  db/              # SQLite connection, migrations, ID generation
  types/           # Shared TypeScript interfaces
  tracker/         # Experiment CRUD, signups, surveys, metrics
  generator/       # Page files, survey questions, ad copy templates
  analyzer/        # Scorecard computation, experiment comparison
  api/             # Fastify server + routes (signup, survey)
  actions/         # CLI entry points (create, list, scorecard, etc.)
templates/landing/ # Astro project — reusable landing page template
docs/              # PRD, TDD, backlog
data/              # SQLite DB (gitignored)
SKILL.md           # Claude Code skill interface definition
```

## Key Patterns

- All action scripts output JSON to stdout, errors to stderr
- JSON fields (pain_points, benefits, survey_questions) stored as TEXT in SQLite, parsed at tracker boundary
- Page generator writes `experiment.json`; deploy script runs `astro build`
- Database auto-initializes on first access via `getDb()`
