---
name: debrief
description: End-of-session ritual — log decisions and artifacts to the embassy, update profile/pipeline if intel changed, commit and push so nothing is lost when the session dies. Usage - /debrief [optional notes].
---

Close out the current session. No cinematic opening — this is the quiet after the embassy empties.

## Steps

1. **Harvest the session:** scan the conversation for (a) decisions made, (b) ideas scored or offers forged, (c) new intel about the owner (capital, hours, network, niche leanings — anything answering a ❓ in `foundry/vault/personal/profile.md`), (d) commitments with deadlines, (e) pipeline movement (new prospects, stage changes).
2. **Write the debrief** to `foundry/embassy/sessions/<YYYY-MM-DD>-<topic-slug>.md`:
   - TL;DR (3 lines max)
   - Decisions made (mirrored to decisions.md)
   - Artifacts produced (file paths)
   - Open questions for next session
   - Owner commitments + deadlines
3. **Update the ledgers:**
   - Append decisions to `foundry/embassy/decisions.md` (skip duplicates already logged mid-session).
   - Fill any ❓ answered in `foundry/vault/personal/profile.md`.
   - Update `foundry/ops/pipeline.md` if prospects/clients were discussed.
   - Mark superseded decisions in `decisions.md` as `superseded` rather than deleting.
   - **Refresh the visual deck:** rewrite the `<script id="foundry-state">` JSON block in
     `foundry/dashboard.html` (mission, lights, decisions, actions, pipeline counts, sessions,
     intel, meta) so the dashboard mirrors the updated ledgers. Touch nothing else in that file.
4. **Persist:** `git add` the foundry files, commit with message `embassy: <date> <topic>` and push to the current branch (retry per repo conventions). Sessions are ephemeral; the repo is the brain.
5. **Sign off** with: decisions logged (count), commitments + deadlines (list), and the single most important action before the next session.
