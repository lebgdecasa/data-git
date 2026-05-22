# Product Audit Studio — Build Session Log

A record of the build conversation and the decisions behind it. (This is a
written summary, not a verbatim chat transcript.)

## Goal

Build **Product Audit Studio**, a real SaaS that lets founders audit their
digital product (positioning, landing page, onboarding, pricing, funnel, PMF)
and receive a structured, scored strategic report with recommendations.

Tech stack: Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui ·
Supabase (auth, Postgres + RLS, Storage) · OpenAI/Anthropic with deterministic
fallback · client-side PDF export.

## Requests, in order

1. **Scaffold the full app** — landing, auth, dashboard, new audit,
   questionnaire, results, report export, history, settings; folders,
   components, DB schema, types, placeholder env vars.
2. **Local deploy steps** — documented; clarified the app lives on a branch and
   runs on the user's machine (this is a cloud container).
3. **12-dimension audit framework + scoring system** — the four files
   `auditTypes.ts`, `auditQuestions.ts`, `scoringEngine.ts`,
   `recommendationEngine.ts`; deterministic, score out of 100, category scores,
   maturity stages (Confused → Scale Ready).
4. **Guided multi-step questionnaire** — multiple input types, auto-save,
   validation, pause/resume, completion %, friendly consultant microcopy.
5. **AI-powered strategic report generator** — server-side, 15 sections, prompt
   template `aiAuditPrompt.ts`, deterministic fallback when no API key.
6. **Save this conversation** — this document.

## Key architecture decisions

- **Two-layer audit output.** `report` (JSONB) holds the deterministic
  `AuditResult` (scores/status/maturity); `narrative` (JSONB) holds the
  15-section strategic report. Dashboards read `report.overallScore`.
- **Deterministic-first.** `scoringEngine.runAudit()` is pure and deterministic;
  the AI layer is layered on top and always falls back to a deterministic
  narrative, so the product works with zero API keys.
- **Scoring is scale-only.** Only the 1–5 Likert questions feed the score.
  Other question types (text, textarea, radio, checkbox, url, file) are
  qualitative context for the report/AI and never skew the score.
- **Weighting.** Per-question and per-dimension weights; PMF Signals weighted
  highest. Status thresholds: green ≥70, yellow ≥45, red <45. Priority is a
  function of status × dimension weight.
- **Security.** API keys are read server-side only (`generateAuditReport.ts`
  imports `server-only`) and never reach the client. Generation runs in the
  authenticated `/api/audits/[id]/generate` route. Supabase RLS scopes every
  row and storage object to its owner.

## The 12 dimensions (→ 4 categories)

- Clarity & Positioning: Positioning Clarity, Value Proposition, Feature Clarity
- Market & Customer: Target Customer, Problem Urgency, PMF Signals
- Experience & Conversion: Landing Conversion, Onboarding Friction, Trust & Credibility
- Growth & Monetisation: Pricing Logic, Retention Potential, GTM Readiness

## The 15 report sections

Executive Summary · Product Diagnosis · Score Overview · Main Growth
Bottlenecks · Positioning / Landing Page / Onboarding / Pricing / Trust &
Credibility / PMF analyses · Top 10 Recommended Actions · 30-Day Roadmap ·
Quick Wins · Strategic Risks · Final Recommendation.

## Where things live

```
src/lib/audit/        auditTypes, auditQuestions, scoringEngine, recommendationEngine
src/lib/ai/           aiAuditPrompt, generateAuditReport (server-only), deterministicReport
src/lib/              types, audits (data access), pdf, utils, supabase/*
src/app/(app)/        dashboard, audits/new, audits/[id]/{questionnaire,results,report}, history, settings
src/app/api/audits/   list/create, [id] get/update/delete, [id]/generate
src/components/audit/  questionnaire, report-view, narrative-report, cards, buttons
supabase/migrations/  0001_init.sql, 0002_narrative.sql
```

## Run locally

1. `npm install`
2. `cp .env.example .env.local` and add Supabase keys (AI optional —
   `AI_PROVIDER=mock` works with no key)
3. Apply `supabase/migrations/0001_init.sql` then `0002_narrative.sql`
4. `npm run dev` → http://localhost:3000

## Status

- Typecheck (`tsc --noEmit`) and production build pass (12 routes).
- Deterministic scoring and the deterministic narrative are runtime-verified.
- Live OpenAI/Anthropic calls are wired and type-checked but not exercised here
  (no keys in the build container); set a provider + key to enable.

## Commits on `claude/epic-hopper-92ulb`

- Add Product Audit Studio SaaS app
- Add 12-dimension deterministic audit framework
- Build guided multi-step questionnaire flow
- Add AI-powered strategic audit report generator
