# Rapid Validation Kit — Product Requirements Document

**Version:** 1.0
**Author:** Sam (with Claude)
**Date:** March 25, 2026
**Status:** Draft

---

## 1. Executive Summary

The Rapid Validation Kit (RVK) is a Claude Code skill backed by TypeScript modules that generates everything needed to validate a product idea in under an hour: a landing page, email collection, post-signup survey, analytics tracking, ad copy suggestions, and a validation tracker entry. It works across all product types in Sam's portfolio — mobile apps, KDP books, Notion templates, Etsy products — and any future ideas.

The goal is to reduce the time from "I have an idea" to "I'm collecting real demand signals" from days to minutes, enabling a high-throughput validation practice where 3-4 ideas can be tested per month with minimal budget.

---

## 2. Problem Statement

Validating product ideas currently requires manually assembling multiple pieces: building a landing page, setting up email collection, creating analytics tracking, writing ad copy, and tracking results. Each individual step is simple, but the friction of doing them all — for each new idea — means validation gets delayed or skipped entirely.

This is the bottleneck in the entrepreneurship pipeline. Ideas are not scarce; validated ideas are. The faster and cheaper validation happens, the faster bad ideas get killed and good ideas get built.

---

## 3. Target User

Sam — a solo developer-entrepreneur running multiple product lines who uses Claude Code as a primary development tool. The tool is designed as a personal productivity system, not a SaaS product.

---

## 4. Goals and Non-Goals

### Goals

- Generate a complete validation test (landing page + form + analytics + ad copy) from a single natural language prompt
- Support all product types: mobile apps, KDP books, Notion templates, Etsy products, SaaS tools
- Deploy landing pages to existing VPS infrastructure with zero additional cost
- Track all validation experiments in a central database for comparison
- Provide clear pass/fail criteria so decisions are data-driven, not emotional
- Integrate with existing tools: Astro, Fastify, Plausible/Umami, CherryAgent

### Non-Goals

- Building a generic landing page builder (this is idea-validation-specific)
- A/B testing framework (premature at validation stage)
- Payment processing or pre-orders (future enhancement)
- Multi-user access or client-facing features
- Automated ad placement (copy generation only — manual posting)

---

## 5. Core Concepts

### 5.1 Validation Experiment

A single test of a product idea. Each experiment consists of:

- **Product definition:** Name, one-liner, target audience, product type
- **Landing page:** Deployed at a unique URL
- **Email collection:** Waitlist signup form
- **Post-signup survey:** 2-3 questions to extract qualitative signal
- **Traffic plan:** Ad copy and community posting suggestions
- **Success criteria:** Pre-defined thresholds for signup rate and survey response quality

### 5.2 Experiment Lifecycle

```
DRAFT → LIVE → COLLECTING → ANALYZING → DECIDED
```

- **Draft:** Page generated but not yet deployed
- **Live:** Page deployed, not yet promoted
- **Collecting:** Traffic being driven, signups coming in
- **Analyzing:** Collection period ended, reviewing data
- **Decided:** Verdict reached — "build," "pivot," or "kill"

### 5.3 Validation Scorecard

Every experiment produces a scorecard:

| Metric | Source | What It Tells You |
|--------|--------|-------------------|
| Unique visitors | Analytics | How much traffic you drove |
| Signup rate | Signups / visitors | Does anyone care? |
| Survey response rate | Responses / signups | Are signups genuine interest or casual? |
| Cost per signup | Ad spend / signups | Is acquisition economically viable? |
| Problem resonance | Survey free text | Is the pain real and urgent? |
| Existing alternatives | Survey free text | What are you competing against? |

### 5.4 Decision Thresholds

| Metric | 🟢 Strong | 🟡 Promising | 🔴 Weak |
|--------|-----------|-------------|---------|
| Signup rate | > 15% | 5-15% | < 5% |
| Survey response rate | > 40% | 20-40% | < 20% |
| Cost per signup | < $2 | $2-5 | > $5 |
| Problem resonance | "I need this" | "That's interesting" | Shrugs |

A "strong" signal across 2+ metrics with 100+ visitors = **build.**
A "promising" signal = **iterate the messaging and retest.**
A "weak" signal across 2+ metrics = **kill or pivot.**

---

## 6. User Stories

### 6.1 Create a New Experiment

*"Validate an app called SpoonLog — it's a spoon theory energy tracker for people with chronic illness and neurodivergent adults"*

→ RVK generates: landing page, waitlist form, survey, analytics config, ad copy for Reddit + Meta, tracking entry.

### 6.2 Create from Minimal Input

*"Test the idea of a TEFAQ exam prep app"*

→ RVK asks 2-3 clarifying questions (target audience, key differentiator, product type), then generates everything.

### 6.3 Check Experiment Status

*"How's the SpoonLog validation going?"*

→ RVK reads analytics data and signup counts, produces the scorecard, and interprets the results.

### 6.4 Compare Experiments

*"Compare SpoonLog vs Voilà Prep validation results"*

→ Side-by-side scorecard comparison with recommendation on which to build first.

### 6.5 Generate Additional Ad Copy

*"Write me 3 more Reddit ad variants for SpoonLog targeting the ADHD community"*

→ Claude Code generates copy informed by the product definition stored in the experiment.

### 6.6 Close an Experiment

*"Kill the Voilà Prep experiment — the signal was too weak"*

→ RVK marks experiment as decided, records the verdict and reasoning, optionally tears down the landing page.

---

## 7. Landing Page Specification

### 7.1 Page Structure

Every validation landing page follows the same proven structure:

**Above the fold (the only part that truly matters):**
- Headline: Problem-aware statement (max 10 words)
- Subheadline: Solution framing (max 20 words)
- Visual: Product mockup or illustration placeholder
- CTA: Single email input + "Join the Waitlist" button

**Below the fold (for scrollers):**
- Three pain points as "Sound familiar?" cards
- Three benefits framed as outcomes (not features)
- Social proof placeholder (for later: "Join 200+ others on the waitlist")
- Second CTA repeating the waitlist signup

**Thank-you page:**
- Confirmation message
- Embedded 2-3 question survey (Tally.so or self-hosted form)
- Optional: "Share with someone who needs this" link

### 7.2 Page Templates

Templates vary by product type:

| Product Type | Visual Emphasis | CTA Variation | Survey Focus |
|-------------|----------------|---------------|-------------|
| Mobile App | Phone mockup | "Get Early Access" | Current tools, willingness to pay |
| KDP Book | Book cover mockup | "Notify Me at Launch" | Current resources, purchase intent |
| Notion Template | Screenshot of template | "Get It Free (Limited)" | Current workflow, pain points |
| SaaS/Web App | Dashboard screenshot | "Join the Beta" | Current solutions, feature priorities |
| Etsy Product | Product photo | "Join the Waitlist" | Purchase intent, price sensitivity |

### 7.3 Design System

All pages share a consistent but minimal design:

- **Font:** Inter (system-like, fast loading, professional)
- **Colors:** Configurable per experiment — default is neutral (slate/white) with one accent color
- **Layout:** Single column, max-width 640px, centered
- **Performance:** Static HTML, no client JS except analytics snippet. Must score 95+ on Lighthouse.
- **Responsive:** Mobile-first (most ad traffic lands on mobile)

### 7.4 Tech Stack

- Astro (static site generation)
- Deployed as static files via Nginx on VPS
- Each experiment gets a subdomain: `{experiment-slug}.validate.samantafluture.com`
- Or a path: `validate.samantafluture.com/{experiment-slug}`

---

## 8. Email Collection & Survey

### 8.1 Email Collection

**Option A — Self-hosted (preferred):**
A minimal Fastify endpoint on the VPS that accepts POST requests from the landing page form and stores the email + timestamp + UTM parameters in the experiment database.

Endpoint: `POST /api/validate/{experiment-id}/signup`
Payload: `{ email, utm_source, utm_medium, utm_campaign }`

**Option B — Tally.so (fallback):**
Embedded Tally.so form if self-hosted setup isn't ready. Free tier supports enough submissions for validation.

### 8.2 Post-Signup Survey

Appears on the thank-you page immediately after signup. 2-3 questions max:

**Standard questions (customizable per experiment):**

1. "What do you currently use to solve this problem?" (free text)
   → Reveals: competitive landscape, severity of need

2. "What's the #1 thing that frustrates you about your current approach?" (free text)
   → Reveals: pain intensity, feature priorities

3. Optional per type:
   - For apps: "Would you pay $X/month for this?" (yes/no/maybe)
   - For KDP: "When did you last buy a book/journal like this?" (time range)
   - For Notion: "How many hours/week do you spend on this task?" (number)

Survey responses stored in the same database, linked to the signup.

---

## 9. Analytics & Tracking

### 9.1 Self-Hosted Analytics

Plausible Community Edition or Umami — self-hosted on VPS. Both are lightweight, privacy-friendly, and provide the exact metrics needed:

- Unique visitors (daily, total)
- Referral sources (which community/ad is driving traffic)
- Page views and bounce rate
- Geographic distribution

### 9.2 UTM Strategy

Every traffic source gets a tagged link:

```
https://validate.samantafluture.com/spoonlog
  ?utm_source=reddit
  &utm_medium=paid
  &utm_campaign=spoonlog_v1
  &utm_content=adhd_community
```

The signup endpoint captures and stores these parameters, so you can trace each signup back to its traffic source.

### 9.3 Metrics Computed

From raw data, RVK computes:

- **Signup rate** = total signups / unique visitors
- **Survey response rate** = survey completions / total signups
- **Cost per signup** = total ad spend / total signups (ad spend entered manually)
- **Source quality** = signup rate per traffic source (which channel converts best)

---

## 10. Ad Copy Generation

### 10.1 Platform-Specific Templates

When generating ad copy, RVK produces variants tailored to each platform:

**Reddit:**
- Conversational tone, reads like a community post
- First-person framing ("I've been struggling with X, so I'm building Y")
- No corporate language, no exclamation marks
- Targets specific subreddit language/culture

**Meta (Instagram/Facebook):**
- Short, punchy headline (under 40 characters)
- Benefit-first body copy
- Clear CTA
- Story/reel format option (15-second script)

**Google Search:**
- Keyword-driven headlines (3 variants, 30 chars each)
- Description lines (2 variants, 90 chars each)
- Targets high-intent search queries

**Community Posts (organic):**
- Discussion-starter format (ask a question related to the problem)
- Soft mention of the solution
- Tailored to platform norms (subreddit rules, Facebook group culture)

### 10.2 Copy Generation Context

Claude Code generates ad copy using the full experiment definition: product name, value prop, target audience, pain points, and competitive landscape. If a deep scan or survey data exists, it uses those insights to sharpen the messaging.

---

## 11. Experiment Tracker

### 11.1 Tracked Data Per Experiment

| Field | Type | Description |
|-------|------|-------------|
| id | TEXT (ULID) | Primary key |
| name | TEXT | Product name |
| slug | TEXT | URL-safe identifier |
| product_type | TEXT | "app" / "kdp" / "notion" / "etsy" / "saas" |
| one_liner | TEXT | Value proposition in one sentence |
| target_audience | TEXT | Who this is for |
| status | TEXT | "draft" / "live" / "collecting" / "analyzing" / "decided" |
| verdict | TEXT | NULL / "build" / "pivot" / "kill" |
| verdict_reasoning | TEXT | Why the decision was made |
| headline | TEXT | Landing page headline |
| subheadline | TEXT | Landing page subheadline |
| accent_color | TEXT | Hex color for the landing page |
| ad_spend | REAL | Total money spent on promotion |
| started_at | TEXT (ISO) | When the experiment went live |
| ended_at | TEXT (ISO) | When collection stopped |
| created_at | TEXT (ISO) | When created |

### 11.2 Related Tables

**signups:** email, experiment_id, utm_source, utm_medium, utm_campaign, utm_content, signed_up_at

**survey_responses:** experiment_id, signup_id, question_key, response_text, responded_at

**daily_metrics:** experiment_id, date, unique_visitors, page_views, signups (daily snapshot for trend analysis)

---

## 12. Success Criteria

1. **Speed:** Generate a complete validation test (page + form + analytics + ad copy) in under 30 minutes via Claude Code.
2. **Throughput:** Enable testing 3-4 ideas per month (vs. ~1 without the tool).
3. **Signal quality:** Decision thresholds correctly predict which products succeed — at least 2 out of 3 "build" verdicts lead to a product that earns revenue within 90 days.
4. **Cost efficiency:** Entire validation cycle (including ad spend) costs under $50 per experiment.

---

## 13. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Landing pages look too similar / template-y | Medium | Low | Configurable accent colors, product-type-specific templates, mockup customization |
| Low traffic volume makes data noisy | High | Medium | Set minimum 100 visitors before drawing conclusions. Guide on community posting strategy. |
| Survey fatigue (people skip it) | Medium | Medium | Keep to 2-3 questions max. Show survey immediately on thank-you page (highest attention moment). |
| Analytics not set up on VPS yet | Low | Medium | Tally.so fallback for form + basic analytics. Self-hosted analytics can be added later. |
| Overvalidation — testing too many ideas without building | Medium | High | Kill/Scale Framework (future tool) enforces decision discipline. RVK scorecard forces a verdict. |

---

## 14. Future Enhancements (Post-V1)

- **Pre-order support:** Add Lemonsqueezy or Gumroad checkout as an alternative CTA for paid validation
- **Automated traffic tracking:** Pull analytics data via API instead of manual entry for daily_metrics
- **Email follow-up sequences:** Auto-send a "we're building — here's an update" email to waitlist signups
- **Mockup generation:** Auto-generate phone/book mockups using templates + product name
- **Multi-variant pages:** Test 2 headlines simultaneously with random assignment
- **Integration with Opportunity Radar:** Auto-create experiments from high-signal opportunities
