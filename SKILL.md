# Rapid Validation Kit

## What This Does
Generates and manages product validation experiments: landing pages,
waitlist signups, surveys, ad copy, and scorecards. Use this for any
"should I build this?" question.

## Setup
Project location: ~/Development/cherrykit
Database: ~/Development/cherrykit/data/rvk.db
Landing pages deploy to: /var/www/validate/

## Available Actions

### Create a New Experiment
```bash
cd ~/Development/cherrykit && npx tsx src/actions/create.ts \
  --name "SpoonLog" \
  --slug "spoonlog" \
  --type "app" \
  --one-liner "Track your energy before you crash" \
  --audience "People with chronic illness and neurodivergent adults" \
  --headline "Finally understand why some days you crash" \
  --subheadline "A spoon theory tracker built for how energy actually works"
```
Output: JSON with experiment record. Also generates landing page files.

Note: pain_points, benefits, and survey questions are auto-generated
based on product type. Override by passing --pain-points and --benefits
as JSON arrays.

### Deploy a Landing Page
```bash
cd ~/Development/cherrykit && npx tsx src/actions/deploy.ts \
  --experiment spoonlog
```
Builds the Astro page and copies to dist/spoonlog/

### List Experiments
```bash
cd ~/Development/cherrykit && npx tsx src/actions/list.ts
cd ~/Development/cherrykit && npx tsx src/actions/list.ts --status live
```

### Get Scorecard
```bash
cd ~/Development/cherrykit && npx tsx src/actions/scorecard.ts \
  --experiment spoonlog
```
Returns JSON scorecard with all metrics and signal assessments.
Interpret these results for the user — explain what the numbers mean
and recommend whether to build, pivot, or kill.

### Compare Experiments
```bash
cd ~/Development/cherrykit && npx tsx src/actions/compare.ts \
  --experiments spoonlog voila-prep
```
Returns JSON with side-by-side scorecards.
Provide a recommendation on which to prioritize.

### Update Experiment
```bash
cd ~/Development/cherrykit && npx tsx src/actions/update.ts \
  --experiment spoonlog \
  --status collecting \
  --ad-spend 25.00
```

### Record Daily Metrics (manual entry)
```bash
cd ~/Development/cherrykit && npx tsx src/actions/record-metrics.ts \
  --experiment spoonlog \
  --date 2026-03-25 \
  --visitors 45 \
  --page-views 62 \
  --signups 7
```

### Set Verdict
```bash
cd ~/Development/cherrykit && npx tsx src/actions/verdict.ts \
  --experiment spoonlog \
  --verdict build \
  --reasoning "18% signup rate, strong survey signal, cost per signup $1.80"
```

### Generate Ad Copy
```bash
cd ~/Development/cherrykit && npx tsx src/actions/ad-copy.ts \
  --experiment spoonlog
```
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
