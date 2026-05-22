# Product Audit Studio

Audit your digital product across six pillars — **Product, Landing Page,
Onboarding, Pricing, Positioning and Conversion Funnel** — and get a structured
report with an overall score, per-pillar scores, strengths, issues and
prioritised recommendations. Export it as a polished PDF.

Built as a real SaaS foundation, not a toy demo.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Supabase** — auth, Postgres (with Row Level Security) and Storage
- **AI** — pluggable provider (OpenAI / Anthropic Claude) with a built-in
  deterministic mock generator so the app runs with zero API keys
- **jsPDF** — client-side PDF export

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in your Supabase keys

# 3. Apply the database schema
#    Paste supabase/migrations/0001_init.sql into the Supabase SQL editor,
#    or run `supabase db push` with the Supabase CLI.

# 4. Run the dev server
npm run dev                  # http://localhost:3000
```

The app works **out of the box without any AI keys** — `AI_PROVIDER=mock`
produces a real, answer-driven report. Set `AI_PROVIDER=openai` or
`anthropic` and add the matching key to use a live LLM.

## Core pages

| Route | Page |
| --- | --- |
| `/` | Landing page (hero, features, how-it-works, pricing, CTA) |
| `/login`, `/signup` | Supabase email/password auth |
| `/dashboard` | Stats overview + recent audits |
| `/audits/new` | Capture business/product profile |
| `/audits/[id]/questionnaire` | Multi-step questionnaire + link/screenshot uploads |
| `/audits/[id]/results` | Scored report with issues & recommendations |
| `/audits/[id]/report` | Print/share-friendly report + PDF export |
| `/history` | All audits with delete |
| `/settings` | Profile, account and AI engine settings |

## Project structure

```
src/
├── app/
│   ├── (auth)/                 # login & signup (route group + layout)
│   ├── (app)/                  # authenticated shell (sidebar + topbar)
│   │   ├── dashboard/
│   │   ├── audits/new/
│   │   ├── audits/[id]/{questionnaire,results,report}/
│   │   ├── history/
│   │   └── settings/
│   ├── api/audits/             # REST: list/create, get/update/delete, generate
│   ├── auth/callback/          # OAuth / email confirmation handler
│   ├── actions/                # server actions (auth, profile)
│   ├── layout.tsx, page.tsx, globals.css
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── marketing/              # landing header & footer
│   ├── app/                    # sidebar, user menu, page header
│   ├── audit/                  # questionnaire, report view, cards, export...
│   ├── settings/               # profile form
│   ├── auth/                   # auth form
│   ├── logo.tsx, score-gauge.tsx
├── lib/
│   ├── supabase/               # browser/server/middleware clients
│   ├── ai/                     # prompt builder, mock + LLM generators
│   ├── audit-config.ts         # the six pillars + questionnaire definition
│   ├── audits.ts               # server-side data access
│   ├── types.ts, utils.ts, pdf.ts
middleware.ts                   # session refresh + route protection
supabase/migrations/0001_init.sql
```

## Architecture notes

- **Auth & security.** Sessions are refreshed in `middleware.ts`; protected
  routes redirect to `/login`. Every table is guarded by **Row Level
  Security** so users only ever see their own data. The Storage bucket is
  private and scoped to a per-user folder.
- **Flexible questionnaire.** `profile`, `answers`, `attachments` and `report`
  are stored as JSONB, so the questionnaire (defined in
  `lib/audit-config.ts`) can evolve without migrations.
- **Pluggable AI.** `lib/ai/generate-report.ts` resolves the provider from env
  and falls back to the deterministic mock generator on any failure, so the
  product is always functional. The OpenAI and Anthropic integrations are
  wired and ready — just add a key.
- **Scoring.** The mock generator derives pillar scores from actual answers
  (scale questions + completeness), then surfaces the weakest pillars as
  issues and the highest-leverage fixes as recommendations.

## Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # serve production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Environment variables

See [`.env.example`](./.env.example) for the full list. Required for real use:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`. AI is optional.
