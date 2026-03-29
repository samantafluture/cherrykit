# Rapid Validation Kit — Technical Design Document + Implementation Plan

**Version:** 1.0
**Author:** Sam (with Claude)
**Date:** March 25, 2026
**Status:** Draft
**Companion:** rapid-validation-kit-prd.md

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Claude Code + SKILL.md (Primary UI)             │
│                                                             │
│  "validate an app called SpoonLog for chronic illness"      │
│  "how's the SpoonLog validation going?"                     │
│  "compare all my active experiments"                        │
│  "write more Reddit ads for SpoonLog"                       │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               Core Modules (TypeScript Library)              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Generator    │  │  Tracker     │  │  Analyzer         │  │
│  │  (pages,      │  │  (CRUD,      │  │  (scorecard,      │  │
│  │   forms,      │  │   signups,   │  │   comparisons,    │  │
│  │   ad copy)    │  │   surveys)   │  │   verdicts)       │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│         ↓                  ↓                  ↓              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                   SQLite Database                     │    │
│  │  experiments | signups | survey_responses | metrics   │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         ↕                              ↕
┌────────────────────┐     ┌──────────────────────────────────┐
│  VPS Static Files   │     │  Fastify API (Signup Endpoint)   │
│  (Astro pages via   │     │  POST /api/validate/:id/signup   │
│   Nginx)            │     │  POST /api/validate/:id/survey   │
└────────────────────┘     └──────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Primary Interface | Claude Code Skill (SKILL.md) | Natural language; Claude generates ad copy and interprets data natively |
| Page Generator | Astro (static HTML output) | Already in use for blog; fast, zero-JS pages |
| Signup API | Fastify | Already in use across projects; handles POST endpoints |
| Database | SQLite (via better-sqlite3) | Consistent with KDP Scout; zero-config |
| Analytics | Plausible CE or Umami (self-hosted) | Privacy-friendly, lightweight, free |
| Template Engine | Astro components with props | Type-safe, composable page sections |
| Deployment | Nginx on VPS (static file serving) | Already configured; zero additional cost |
| Package Manager | pnpm | Consistent with all other projects |

---

## 3. Data Model

### 3.1 `experiments` table

```sql
CREATE TABLE experiments (
  id            TEXT PRIMARY KEY,          -- ULID
  name          TEXT NOT NULL,             -- "SpoonLog"
  slug          TEXT NOT NULL UNIQUE,      -- "spoonlog"
  product_type  TEXT NOT NULL,             -- "app" | "kdp" | "notion" | "etsy" | "saas"
  one_liner     TEXT NOT NULL,             -- "Track your energy before you crash"
  target_audience TEXT NOT NULL,           -- "People with chronic illness..."
  status        TEXT NOT NULL DEFAULT 'draft',  -- draft|live|collecting|analyzing|decided
  verdict       TEXT,                      -- NULL | "build" | "pivot" | "kill"
  verdict_reasoning TEXT,                  -- "Signup rate 18%, strong survey signal..."
  headline      TEXT NOT NULL,             -- Landing page headline
  subheadline   TEXT NOT NULL,             -- Landing page subheadline
  pain_points   TEXT,                      -- JSON array of 3 pain point strings
  benefits      TEXT,                      -- JSON array of 3 benefit strings
  accent_color  TEXT DEFAULT '#6366f1',    -- Hex color
  survey_questions TEXT,                   -- JSON array of question objects
  ad_spend      REAL DEFAULT 0,            -- Total USD spent
  started_at    TEXT,                      -- ISO timestamp
  ended_at      TEXT,                      -- ISO timestamp
  created_at    TEXT NOT NULL,             -- ISO timestamp
  updated_at    TEXT NOT NULL              -- ISO timestamp
);
```

### 3.2 `signups` table

```sql
CREATE TABLE signups (
  id            TEXT PRIMARY KEY,          -- ULID
  experiment_id TEXT NOT NULL REFERENCES experiments(id),
  email         TEXT NOT NULL,
  utm_source    TEXT,                      -- "reddit" | "meta" | "google" | "organic"
  utm_medium    TEXT,                      -- "paid" | "post" | "dm"
  utm_campaign  TEXT,                      -- "spoonlog_v1"
  utm_content   TEXT,                      -- "adhd_community"
  signed_up_at  TEXT NOT NULL              -- ISO timestamp
);

CREATE INDEX idx_signups_experiment ON signups(experiment_id);
CREATE INDEX idx_signups_source ON signups(experiment_id, utm_source);
```

### 3.3 `survey_responses` table

```sql
CREATE TABLE survey_responses (
  id            TEXT PRIMARY KEY,          -- ULID
  experiment_id TEXT NOT NULL REFERENCES experiments(id),
  signup_id     TEXT REFERENCES signups(id),  -- nullable (anonymous surveys)
  question_key  TEXT NOT NULL,             -- "current_solution" | "frustration" | "willingness_to_pay"
  response_text TEXT NOT NULL,
  responded_at  TEXT NOT NULL              -- ISO timestamp
);

CREATE INDEX idx_survey_experiment ON survey_responses(experiment_id);
```

### 3.4 `daily_metrics` table

```sql
CREATE TABLE daily_metrics (
  id            TEXT PRIMARY KEY,          -- ULID
  experiment_id TEXT NOT NULL REFERENCES experiments(id),
  date          TEXT NOT NULL,             -- "2026-03-25"
  unique_visitors INTEGER DEFAULT 0,
  page_views    INTEGER DEFAULT 0,
  signups       INTEGER DEFAULT 0,
  UNIQUE(experiment_id, date)
);
```

---

## 4. Module Specifications

### 4.1 Generator Module (`src/generator/`)

Responsible for creating all assets for a new experiment.

#### 4.1.1 Page Generator (`page.ts`)

**Input:** Experiment record from database.

**Output:** A complete Astro project directory for the landing page.

**Process:**
1. Copy base template from `templates/landing/`
2. Inject experiment data into Astro component props:
   - headline, subheadline, pain_points, benefits, accent_color
   - signup API endpoint URL
   - analytics snippet
   - survey redirect URL
3. Build static HTML via `astro build`
4. Output to `dist/{slug}/` ready for Nginx serving

**Template Structure:**
```
templates/landing/
├── src/
│   ├── pages/
│   │   ├── index.astro         # Main landing page
│   │   └── thanks.astro        # Thank-you + survey page
│   ├── components/
│   │   ├── Hero.astro          # Headline + CTA
│   │   ├── PainPoints.astro    # "Sound familiar?" section
│   │   ├── Benefits.astro      # Outcome cards
│   │   ├── SignupForm.astro    # Email input + button
│   │   └── Survey.astro        # Post-signup questions
│   └── layouts/
│       └── Base.astro          # HTML shell, meta tags, analytics
├── public/
│   └── mockup.png              # Placeholder (replaced per experiment)
├── astro.config.mjs
└── experiment.json             # Injected experiment data
```

**Product-type variations:**

The template adapts based on `product_type`:

| Product Type | Hero Visual | CTA Text | Survey Q3 |
|-------------|------------|----------|-----------|
| app | Phone mockup frame | "Get Early Access" | "Would you pay $X/month?" |
| kdp | Book cover frame | "Notify Me at Launch" | "When did you last buy one?" |
| notion | Browser screenshot frame | "Get It Free" | "Hours/week on this task?" |
| etsy | Product photo frame | "Join the Waitlist" | "What would you pay?" |
| saas | Dashboard screenshot frame | "Join the Beta" | "Would you pay $X/month?" |

#### 4.1.2 Ad Copy Generator (`ad-copy.ts`)

**Input:** Experiment record.

**Output:** JSON file with ad copy variants per platform.

**Process:**
This is a thin module — it formats the experiment data into a structured prompt and outputs a JSON template that Claude Code fills in during the skill interaction. The actual copy generation happens in Claude Code's response, not in a script.

The module provides:
- Platform-specific constraints (character limits, format rules)
- UTM-tagged URLs per platform
- Template structure for consistent output

```typescript
interface AdCopyOutput {
  experiment_id: string;
  generated_at: string;
  platforms: {
    reddit: { variants: AdVariant[] };
    meta: { variants: AdVariant[] };
    google: { variants: AdVariant[] };
    organic: { variants: CommunityPost[] };
  };
}

interface AdVariant {
  headline: string;
  body: string;
  cta: string;
  url: string;  // with UTM params
  targeting_notes: string;
}

interface CommunityPost {
  platform: string;        // "r/ChronicIllness", "Facebook: Quebec Immigrants"
  post_title: string;
  post_body: string;
  posting_notes: string;   // "Wait for Casual Friday thread" etc.
}
```

#### 4.1.3 Survey Generator (`survey.ts`)

**Input:** Experiment record (product_type, target_audience).

**Output:** Survey question configuration stored in the experiment record.

**Default questions per type:**

```typescript
const DEFAULT_SURVEYS: Record<ProductType, SurveyQuestion[]> = {
  app: [
    { key: "current_solution", text: "What do you currently use to solve this?" },
    { key: "frustration", text: "What frustrates you most about your current approach?" },
    { key: "willingness_to_pay", text: "Would you pay $X/month for a better solution?", type: "select", options: ["Yes", "Maybe", "No"] }
  ],
  kdp: [
    { key: "current_solution", text: "What resources do you currently use for this?" },
    { key: "frustration", text: "What's missing from what's available?" },
    { key: "purchase_recency", text: "When did you last buy a book/journal like this?", type: "select", options: ["This month", "Last 3 months", "6+ months ago", "Never"] }
  ],
  // ... notion, etsy, saas
};
```

### 4.2 Tracker Module (`src/tracker/`)

CRUD operations on experiments and related data.

#### 4.2.1 Experiment CRUD (`experiments.ts`)

```typescript
// Core operations called by action scripts
function createExperiment(input: CreateExperimentInput): Experiment;
function getExperiment(idOrSlug: string): Experiment | null;
function listExperiments(filters?: { status?: string; product_type?: string }): Experiment[];
function updateExperiment(id: string, updates: Partial<Experiment>): Experiment;
function setVerdict(id: string, verdict: Verdict, reasoning: string): Experiment;
```

#### 4.2.2 Signup Handler (`signups.ts`)

```typescript
function recordSignup(experimentId: string, data: SignupData): Signup;
function getSignupCount(experimentId: string, filters?: { source?: string }): number;
function getSignupsBySource(experimentId: string): Record<string, number>;
```

#### 4.2.3 Survey Handler (`surveys.ts`)

```typescript
function recordSurveyResponse(data: SurveyResponseInput): SurveyResponse;
function getSurveyResponses(experimentId: string): SurveyResponse[];
function getSurveyResponseRate(experimentId: string): number;
```

#### 4.2.4 Metrics (`metrics.ts`)

```typescript
function recordDailyMetrics(experimentId: string, data: DailyMetricsInput): void;
function getMetricsTimeline(experimentId: string): DailyMetrics[];
function getTotalMetrics(experimentId: string): AggregatedMetrics;
```

### 4.3 Analyzer Module (`src/analyzer/`)

Computes scorecards and comparisons.

#### 4.3.1 Scorecard (`scorecard.ts`)

```typescript
interface Scorecard {
  experiment_id: string;
  experiment_name: string;
  status: string;
  metrics: {
    total_visitors: number;
    total_signups: number;
    signup_rate: number;            // percentage
    survey_response_rate: number;   // percentage
    cost_per_signup: number | null; // null if no ad spend
    best_source: string;            // utm_source with highest signup rate
    worst_source: string;
  };
  signals: {
    signup_rate: "strong" | "promising" | "weak";
    survey_rate: "strong" | "promising" | "weak";
    cost_efficiency: "strong" | "promising" | "weak" | "unknown";
  };
  data_confidence: "high" | "medium" | "low";  // based on visitor count
  days_active: number;
}

function generateScorecard(experimentId: string): Scorecard;
```

**Data confidence thresholds:**
- `high`: 200+ unique visitors
- `medium`: 100-199 unique visitors
- `low`: < 100 unique visitors (signal too noisy for decisions)

#### 4.3.2 Comparison (`compare.ts`)

```typescript
interface Comparison {
  experiments: Scorecard[];
  recommendation: string;  // Generated by Claude Code, not hardcoded
}

function compareExperiments(ids: string[]): Comparison;
```

The `recommendation` field is populated by Claude Code during the skill interaction — the module provides the data, Claude provides the interpretation.

---

## 5. Fastify API Endpoints

A small set of endpoints for receiving form submissions from landing pages.

### 5.1 Signup Endpoint

```
POST /api/validate/:experimentId/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "utm_source": "reddit",
  "utm_medium": "paid",
  "utm_campaign": "spoonlog_v1",
  "utm_content": "adhd_community"
}

Response: 200 { "success": true }
```

**Validation:**
- Email format check (basic regex)
- Experiment ID must exist and be in "live" or "collecting" status
- Duplicate email for same experiment returns 200 (idempotent) but doesn't create new record
- Rate limit: 10 signups/minute per IP (prevent spam)

### 5.2 Survey Endpoint

```
POST /api/validate/:experimentId/survey
Content-Type: application/json

{
  "signup_id": "optional-ulid",
  "responses": [
    { "question_key": "current_solution", "response_text": "I use a spreadsheet" },
    { "question_key": "frustration", "response_text": "It's too manual, I forget to update it" }
  ]
}

Response: 200 { "success": true }
```

### 5.3 CORS Configuration

Landing pages are served from `validate.samantafluture.com` but the API runs on the Fastify server (possibly a different port). CORS must be configured to allow cross-origin POST from the landing page domain.

```typescript
fastify.register(cors, {
  origin: [
    'https://validate.samantafluture.com',
    /\.validate\.samantafluture\.com$/
  ],
  methods: ['POST']
});
```

---

## 6. Deployment Architecture

### 6.1 Landing Pages

```
/var/www/validate/
├── spoonlog/
│   ├── index.html
│   └── thanks.html
├── voila-prep/
│   ├── index.html
│   └── thanks.html
└── ... (one folder per experiment)
```

Nginx config:
```nginx
server {
    server_name validate.samantafluture.com;
    root /var/www/validate;

    location / {
        try_files $uri $uri/index.html =404;
    }
}
```

### 6.2 Signup API

Runs as part of the existing Fastify server (or as a separate process on a different port). Nginx proxies API requests:

```nginx
location /api/validate/ {
    proxy_pass http://localhost:3848;
}
```

### 6.3 Deployment Script

A deploy action script handles the full pipeline:

```bash
# Build and deploy a landing page
npx tsx src/actions/deploy.ts --experiment spoonlog
```

This script:
1. Reads experiment data from SQLite
2. Injects data into Astro template
3. Runs `astro build`
4. Copies output to `/var/www/validate/{slug}/`
5. Updates experiment status to "live"

---

## 7. Skill Specification

### 7.1 SKILL.md

```markdown
# Rapid Validation Kit

## What This Does
Generates and manages product validation experiments: landing pages,
waitlist signups, surveys, ad copy, and scorecards. Use this for any
"should I build this?" question.

## Setup
Project location: ~/projects/rapid-validation-kit
Database: ~/projects/rapid-validation-kit/data/rvk.db
Landing pages deploy to: /var/www/validate/

## Available Actions

### Create a New Experiment
\`\`\`bash
cd ~/projects/rapid-validation-kit && npx tsx src/actions/create.ts \
  --name "SpoonLog" \
  --slug "spoonlog" \
  --type "app" \
  --one-liner "Track your energy before you crash" \
  --audience "People with chronic illness and neurodivergent adults" \
  --headline "Finally understand why some days you crash" \
  --subheadline "A spoon theory tracker built for how energy actually works"
\`\`\`
Output: JSON with experiment record. Also generates landing page files.

Note: pain_points, benefits, and survey questions are auto-generated
based on product type. Override by passing --pain-points and --benefits
as JSON arrays.

### Deploy a Landing Page
\`\`\`bash
cd ~/projects/rapid-validation-kit && npx tsx src/actions/deploy.ts \
  --experiment spoonlog
\`\`\`
Builds the Astro page and copies to /var/www/validate/spoonlog/

### List Experiments
\`\`\`bash
cd ~/projects/rapid-validation-kit && npx tsx src/actions/list.ts
cd ~/projects/rapid-validation-kit && npx tsx src/actions/list.ts --status live
\`\`\`

### Get Scorecard
\`\`\`bash
cd ~/projects/rapid-validation-kit && npx tsx src/actions/scorecard.ts \
  --experiment spoonlog
\`\`\`
Returns JSON scorecard with all metrics and signal assessments.
Interpret these results for the user — explain what the numbers mean
and recommend whether to build, pivot, or kill.

### Compare Experiments
\`\`\`bash
cd ~/projects/rapid-validation-kit && npx tsx src/actions/compare.ts \
  --experiments spoonlog voila-prep
\`\`\`
Returns JSON with side-by-side scorecards.
Provide a recommendation on which to prioritize.

### Update Experiment
\`\`\`bash
cd ~/projects/rapid-validation-kit && npx tsx src/actions/update.ts \
  --experiment spoonlog \
  --status collecting \
  --ad-spend 25.00
\`\`\`

### Record Daily Metrics (manual entry)
\`\`\`bash
cd ~/projects/rapid-validation-kit && npx tsx src/actions/record-metrics.ts \
  --experiment spoonlog \
  --date 2026-03-25 \
  --visitors 45 \
  --page-views 62 \
  --signups 7
\`\`\`

### Set Verdict
\`\`\`bash
cd ~/projects/rapid-validation-kit && npx tsx src/actions/verdict.ts \
  --experiment spoonlog \
  --verdict build \
  --reasoning "18% signup rate, strong survey signal, cost per signup $1.80"
\`\`\`

### Generate Ad Copy
\`\`\`bash
cd ~/projects/rapid-validation-kit && npx tsx src/actions/ad-copy.ts \
  --experiment spoonlog
\`\`\`
Returns JSON template with platform constraints and UTM-tagged URLs.
Fill in the actual copy in your response based on the experiment data
and any survey insights available.

## Decision Thresholds
- Signup rate: >15% strong, 5-15% promising, <5% weak
- Survey response rate: >40% strong, 20-40% promising, <20% weak
- Cost per signup: <$2 strong, $2-5 promising, >$5 weak
- Need 100+ unique visitors for reliable signal

## When Analyzing Results
Read the scorecard data and survey responses. Provide interpretation:
what the numbers mean, what the survey responses reveal about demand
and competition, and a clear build/pivot/kill recommendation with
reasoning.

## When Generating Ad Copy
Use the experiment's target audience, pain points, and value prop to
write platform-specific copy. Follow these rules:
- Reddit: conversational, first-person, no corporate tone
- Meta: short headline (<40 chars), benefit-first
- Google: keyword-driven, 30-char headlines
- Always include UTM-tagged URLs from the ad-copy.ts output
```

### 7.2 Action Scripts

Each action script is a standalone TypeScript file:

| Script | Purpose | Output |
|--------|---------|--------|
| `create.ts` | Create experiment + generate page files | Experiment JSON |
| `deploy.ts` | Build Astro page + copy to Nginx | Deployment status |
| `list.ts` | List experiments with optional filters | Experiment[] JSON |
| `scorecard.ts` | Compute and return scorecard | Scorecard JSON |
| `compare.ts` | Side-by-side scorecard comparison | Comparison JSON |
| `update.ts` | Update experiment fields | Updated Experiment JSON |
| `record-metrics.ts` | Record daily analy
