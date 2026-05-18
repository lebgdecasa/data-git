# ProductTwin AI

> **An AI-powered product decision simulator for PMs, business analysts, and founders.**
> Simulate the impact of a product decision — pricing, onboarding, roadmap, compliance — *before* you ship it.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Stack](https://img.shields.io/badge/TypeScript-strict-blue) ![Stack](https://img.shields.io/badge/TailwindCSS-3-cyan) ![Stack](https://img.shields.io/badge/Recharts-2-orange) ![Stack](https://img.shields.io/badge/Status-portfolio_project-purple)

---

## 1. The Problem

Most product decisions are made with intuition and incomplete data:

- A PM raises prices, then watches activation collapse.
- A founder pours budget into ads, while 62% of trial signups never reach activation.
- A team ships a "compliance feature" that doesn't move enterprise deals.
- A roadmap is built on loud opinions, not ranked impact.

There is **no safe sandbox** to simulate the consequences of these decisions before committing engineering cycles and ad spend. By the time the data comes in, the cost is already sunk.

## 2. The Solution

**ProductTwin AI** is a strategy studio that lets product teams diagnose, simulate, and prioritize before they ship. It runs on a deterministic simulation engine (no API calls, no hallucinations) that translates fuzzy PM intuition into ranked alternatives with explicit assumptions.

It answers four questions every product team faces:

1. **How healthy is my product today?**
2. **What's my biggest growth bottleneck — and what happens if I fix it?**
3. **Which feature on my roadmap has the highest leverage?**
4. **Am I enterprise-ready, or will compliance block my next round?**

## 3. Key Features

| Module | What it does |
|---|---|
| **Dashboard** | Real-time health overview — MRR, churn, activation, retention, LTV/CAC, with composite health score and AI strategic diagnosis. |
| **Product Audit** | 10-field structured input → AI-style scored report across clarity, monetization, friction, positioning, and compliance dimensions. |
| **Scenario Simulator** | 7 levers (pricing, onboarding, churn target, marketing budget, compliance investment, feature complexity, activation target). 8 before/after metrics. Live AI recommendation engine ranks the highest-impact lever. Includes a risk heatmap. |
| **KPI Dashboard** | 5 KPI groups (Acquisition, Activation, Retention, Revenue, Product) with funnel chart, retention curve, MRR trend, and feature adoption — each with strategic interpretation. |
| **Roadmap Prioritizer** | Live-editable RICE scoring with auto-calculated priority bands and contextual AI recommendation explaining the winning feature. |
| **Risk & Compliance** | 8 risk categories with framework overlays (GDPR / HIPAA / SOC 2 / ISO 27001 / FDA SaMD / EU AI Act). Composite Enterprise Readiness Score adjusts as frameworks are toggled. |
| **AI Recommendations** | McKinsey-style 10-section strategic report: Executive Summary, Growth Bottleneck, Retention Risk, 30-Day Plan, 90-Day Strategy, Startup Survival Score, Final Recommendation. Export to PDF + Copy LinkedIn Summary. |
| **LinkedIn Demo Mode** | One-click shareable project showcase modal with clipboard-ready post text. |

## 4. Tech Stack

**Frontend**
- [Next.js 14](https://nextjs.org/) (App Router, static rendering, all pages prerendered)
- [TypeScript](https://www.typescriptlang.org/) with strict mode
- [Tailwind CSS](https://tailwindcss.com/) with custom design tokens
- [shadcn/ui](https://ui.shadcn.com/) primitives + [Radix UI](https://www.radix-ui.com/)
- [Lucide](https://lucide.dev/) icons

**Data Visualization**
- [Recharts](https://recharts.org/) — funnel, radar, scatter, area, line, bar, radial charts

**State & Logic**
- [Zustand](https://github.com/pmndrs/zustand) with `persist` middleware (localStorage)
- Deterministic, rule-based simulation engine — no external API calls, fully reproducible

**Tooling**
- [class-variance-authority](https://cva.style/) for component variants
- `tailwind-merge` + `clsx` for safe class composition

## 5. Product Management Value

For PMs, ProductTwin AI demonstrates the difference between **opinion-led** and **evidence-led** decision making:

- **Translate intuition into trade-offs.** "Onboarding feels too long" becomes "reducing steps from 6 → 3 lifts activation by 14pp and reduces early churn by 25%."
- **Rank alternatives systematically.** RICE scoring with a live recommendation engine surfaces the highest-leverage feature — not the loudest one.
- **Quantify upstream vs downstream levers.** The simulator makes it obvious when fixing activation is worth more than scaling acquisition spend.
- **Communicate strategy executive-ready.** The Final Recommendations report is structured like a consulting deliverable: executive summary, diagnosis, 30/90-day plans, survival score.

## 6. Business Analysis Value

For business analysts, the application demonstrates structured analytical thinking:

- **Multi-dimensional scoring** — composite health, RICE prioritization, enterprise readiness score — all decomposed into weighted components.
- **Sensitivity analysis** — the simulator probes each lever individually and ranks by health-score delta to identify the highest-impact action.
- **Risk modeling** — framework overlays (GDPR, HIPAA, etc.) act as conditional modifiers on baseline risk scores, producing dynamic readiness assessments.
- **Funnel + cohort thinking** — KPI dashboard breaks the user journey into Acquisition → Activation → Retention → Revenue with strategic interpretation at each stage.
- **Mock data, real frameworks** — the data is illustrative, but the analytical patterns (RICE, LTV/CAC, retention cohorts, compliance gap analysis) are production-grade.

## 7. Future Improvements

- [ ] Connect to live data sources (Segment, Mixpanel, Stripe) for real-product simulation
- [ ] Save and compare multiple scenarios side-by-side
- [ ] Monte Carlo simulation with uncertainty bands on each projection
- [ ] LLM-powered narrative generation for the Final Report (with prompt caching)
- [ ] Multi-product portfolio view for VCs and PE firms
- [ ] Server-rendered PDF export with embedded charts (currently uses `window.print()`)
- [ ] Authentication and multi-user workspaces
- [ ] Versioned audit history with diff view between assessments

## 8. Screenshots

> Screenshots and a short demo video go here.

```
docs/
└── screenshots/
    ├── 01-dashboard.png
    ├── 02-audit-report.png
    ├── 03-simulator.png
    ├── 04-kpi-dashboard.png
    ├── 05-roadmap.png
    ├── 06-risk-compliance.png
    └── 07-final-report.png
```

## 9. Getting Started

```bash
git clone https://github.com/lebgdecasa/data-git.git
cd data-git/producttwin-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Build for production:**
```bash
npm run build
npm start
```

## 10. LinkedIn Post Template

Use this template when sharing the project:

```
I built ProductTwin AI, an AI-powered product decision simulator for PMs and business analysts.

The idea is simple: before shipping a product decision, simulate its impact.

It helps analyze:
- churn
- activation
- pricing
- retention
- roadmap priority
- compliance risk
- product health

The goal was to combine product management, business analysis, AI, and
decision intelligence into one portfolio project.

Built with: Next.js 14 · TypeScript · Tailwind · Recharts · Zustand
No external APIs — fully deterministic simulation engine.

🔗 [Live demo]   📁 [GitHub]   🎥 [Demo video]

#productmanagement #businessanalysis #productstrategy #startups #ai
```

---

## Disclaimer

This project uses **simulated data for portfolio demonstration purposes**. The compliance, risk, and regulatory analysis is a strategic readiness simulation — **not a legal compliance certification**. Nothing in this project constitutes legal, regulatory, or financial advice. For real compliance assessments, consult qualified legal counsel and certified compliance professionals.

## License

MIT — feel free to fork, learn from, and adapt.
