# 🏙️ THE FOUNDRY — Owner's Manual

Your private multi-agent business advisory board, built as a Claude Code workspace.
**This is a tool for you, not a product.** No hosting, no API keys, no subscriptions beyond Claude itself.

## How to use it

Open this repository in any Claude Code surface — [claude.ai/code](https://claude.ai/code) (web/mobile), the CLI, or the desktop app — and just talk. `CLAUDE.md` boots The Foundry automatically in every session.

| You type | What happens |
|---|---|
| `/board should I niche down to dental clinics?` | The 10 agents debate it, then deliver Consensus / Disagreements / Final Recommendation / Next 3 Actions |
| `/board --deep <question>` | Agents spawn in parallel with live web research before the debate |
| `/score AI receptionist for Moroccan clinics` | Full gauntlet: 10 scores + market analysis + paths to $1k/$10k/$100k + 30/90/365-day plans, saved to the embassy |
| `/offer cold-email agency for French SaaS` | Grand Slam Offer forged with the value equation + free/discount/premium wrapper decision |
| `/mh1` | Monday Hour One: plan and time-block your week, saved to `ops/weeks/` |
| `/debrief` | End of session: log decisions, update files, commit & push |

No slash command needed for normal questions — any business question boots the board automatically.

## Map

```
foundry/
├── dashboard.html          # 🖥️ THE VISUAL DECK — open in any browser
├── vault/                  # Knowledge the board consults
│   ├── hormozi/            #   Distilled doctrine (your uploaded PDFs + published frameworks)
│   └── personal/           #   YOUR profile, goals, constraints — keep this updated
├── embassy/               # The board's memory
│   ├── decisions.md        #   Every decision ever made (never re-litigated silently)
│   ├── ideas/              #   Scored business ideas, one file each
│   └── sessions/           #   Session debriefs
└── ops/                    # Execution layer
    ├── monday-hour-one.md  #   Weekly planning SOP
    ├── weeks/              #   Your week plans
    └── pipeline.md         #   Prospect/client tracker
```

## The visual deck

`foundry/dashboard.html` is the cyberpunk command-center view of everything above: the round
table with all 10 agents, mission status, decision ledger, your intel, pipeline funnel, session
log, and the doctrine feed. Fully self-contained — open it in any browser, no server needed.
Its data lives in an embedded `foundry-state` JSON block that the board refreshes at `/debrief`,
so after pulling the repo it always shows current state. On mobile? Just ask the board:
*"update the dashboard and send me a screenshot."*

## Feeding the board new knowledge

Drop a PDF/notes into the session (or the repo) and say *"ingest this into the vault."* The board distills it into `vault/` so every future session knows it.

## Why memory matters

Claude sessions are ephemeral — **the repo is the brain.** Decisions, scored ideas, week plans, and pipeline state live in git. End sessions with `/debrief` so nothing is lost. The more you log, the smarter the board gets about *your* situation.

## House rules

1. The Devil's Advocate always gets to speak. That's the point.
2. A session that produces no logged decision or action didn't happen.
3. Update `vault/personal/profile.md` whenever your situation changes — the board is only as sharp as its intel.
