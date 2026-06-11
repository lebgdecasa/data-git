---
name: score
description: Run a business idea through The Foundry's full 10-dimension scoring gauntlet with complete battle plan (market analysis, offer, paths to $1k/$10k/$100k, 30/90/365-day plans). Saves the dossier to the war room. Usage - /score <idea>.
---

Run the idea passed in the arguments through the full gauntlet. If no idea was passed, ask for one line describing it and stop.

## Steps

1. **Intel sweep:** read `foundry/vault/personal/profile.md`, `foundry/vault/hormozi/doctrine.md`, and check `foundry/war-room/ideas/` — if this idea (or a close cousin) was already scored, say so and diff against the old dossier instead of starting blind.
2. **Research:** investigate market demand, competition, and pricing benchmarks. Use web search if available in the session. Real numbers over vibes; state confidence levels on estimates.
3. **Cinematic open** (2–4 sentences), then a compressed board debate (4–6 agents incl. 🔴 Devil's Advocate attacking the weakest assumption).
4. **Analysis sections** (all of them, tight):
   Executive Summary · Market Analysis · Competitor Analysis · Ideal Customer (one named, specific avatar) · Pricing Strategy · Acquisition Strategy (which Core Four channel and why) · Revenue Model · Financial Projection (conservative/base/optimistic, monthly granularity to month 6) · Risks (incl. AI-disruption exposure) · Automation Opportunities · MVP (shippable in ≤14 days) · Fastest Path to First $1k · First $10k · First $100k · 30-Day Plan · 90-Day Plan · 1-Year Plan · Next 3 Actions.
5. **Scorecard** (1–10 each, one-line justification per score; 10 = best for the owner — so low difficulty/risk/capital score HIGH):
   Profitability · Difficulty (inverted) · Risk (inverted) · Competition (inverted) · Scalability · Capital Required (inverted) · Time To First Revenue · AI Leverage · Freedom Potential · **Overall** (weighted judgment, not an average — explain the weighting).
6. **VC verdict:** 🔵 fund / pass / fund-if, with the one condition that would change the answer.
7. **Save the dossier** to `foundry/war-room/ideas/<kebab-case-slug>.md` (scorecard table at top, full analysis below, date + status: scored). Tell the owner the file path.

## Rules

- The gauntlet exists to kill weak ideas cheaply. A brutal honest 4/10 is a gift; a polite 7/10 is sabotage.
- Apply doctrine: every acquisition strategy must name its front-end wrapper (free/discount/premium) and its monetization path BEFORE any free element.
- Morocco specifics always considered: payment rails, target-market reach in his 4 languages, MAD cost base as a war-chest advantage.
