# ProductTwin AI

A premium-feeling, portfolio-grade simulation studio for product managers, founders, and innovation teams. Drop in your assumptions (pricing, churn, CAC, retention, activation, compliance, roadmap complexity) and ProductTwin AI generates a live digital twin: financial projections, risk scores, scenario simulations, roadmap prioritization, and AI-style strategic recommendations.

> Built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui-style primitives, Recharts and Zustand. No backend — all simulations run client-side over local state.

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page with hero, feature grid, animated mockup, CTA |
| `/dashboard` | Executive overview — financial KPIs, growth chart, risk gauge, top moves |
| `/audit` | Product audit — edit every assumption, see a live snapshot and audit checks |
| `/simulator` | Scenario simulator — tweak pricing, churn, acquisition, activation; compare against baseline |
| `/kpi` | KPI dashboard — revenue ramp, funnel, cohort retention, benchmark radar, channel mix |
| `/roadmap` | Roadmap prioritization — RICE-scored backlog with impact / effort matrix and Now / Next / Later columns |
| `/risk` | Risk & compliance score — composite gauge, 5-axis radar, compliance checklist, risk register |
| `/recommendations` | AI strategic recommendations — auto-generated CEO brief plus prioritized moves with rationale and next actions |

## Architecture

- **State**: a single `useTwinStore` Zustand store (with `localStorage` persistence) holds the `ProductAssumptions` and `roadmap`. Every page derives its numbers from this store via `useMemo`, so editing an assumption updates every dashboard in real time.
- **Engine**: `lib/engine.ts` runs a deterministic 36-month simulation (`simulate`), composes a five-dimension `riskScore`, and generates contextual `Recommendation`s.
- **UI**: shadcn-style primitives (`button`, `card`, `slider`, `tabs`, `select`, `progress`, `badge`, …) built directly in `components/ui` so the project is self-contained.

## Get started

```bash
cd producttwin-ai
npm install
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # production build
```

## Design direction

- Dark mode by default
- Glassmorphism cards with subtle gradients
- Premium SaaS feel — executive, restrained, blue/purple accents
- Smooth radial backdrops and grid background
- Responsive down to mobile, optimized for desktop board-deck use

## Disclaimer

All numbers are simulated for portfolio purposes. Nothing here is connected to real billing, real customers, or a real backend.
