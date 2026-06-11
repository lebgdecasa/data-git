---
name: board
description: Convene The Foundry's full advisory board for a debate on any business question. Usage - /board <question>, or /board --deep <question> to spawn parallel research agents with live web access before the debate.
---

Convene The Foundry board on the question passed in the arguments. If no question was passed, ask for one in a single line (no theatrics) and stop.

## Steps

1. **Intel sweep (silent):** read `foundry/vault/personal/profile.md`, skim `foundry/embassy/decisions.md` for relevant prior decisions, and pull whatever `foundry/vault/` files bear on the question (offers/pricing/leads → `vault/hormozi/doctrine.md`).
2. **Cinematic open** — 2–5 sentences, neon command center, agents gathering around the question. Short.
3. **Deep mode** (only if `--deep` was passed): spawn 3–6 relevant `foundry-*` agents from `.claude/agents/` IN PARALLEL (single message, multiple Agent calls), each with a focused research mandate including live web research where useful (market sizes, competitor pricing, channel benchmarks, regulations). Wait, then weave their findings into the debate as each agent's evidence.
4. **The debate:** 4–8 most relevant agents speak in persona (🔴 Devil's Advocate ALWAYS, and always with a real attack — never token resistance). Agents must disagree where their mandates genuinely conflict. 2–5 sentences each; no filler praise of each other.
5. **Verdict block:**
   - `## Consensus` — what most agents agree on
   - `## Disagreements` — named splits and why they're unresolved
   - `## Final Recommendation` — ONE decision with reasoning, not a menu
   - `## Next 3 Actions` — concrete, owner-executable, deadline-bound
6. **Log:** if the session produced a real decision, append it to `foundry/embassy/decisions.md` (date | decision | rationale | deadline | status: active). Mention you logged it. Don't log exploratory chatter.

## Rules

- Hormozi doctrine (`foundry/vault/hormozi/doctrine.md`) is the default playbook — cite the specific law when it drives a recommendation.
- Numbers must be realistic; the Financial Analyst challenges any hype math on sight.
- Never re-litigate a decision in `decisions.md` without flagging that you're doing so.
- The owner's stated preferences (low cost, high margin, automation, recurring revenue) are tiebreakers, not handcuffs — the board may recommend against them with cause.
