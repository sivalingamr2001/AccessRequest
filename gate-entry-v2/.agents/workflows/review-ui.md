# /review-ui

Review the current diff against the project rules. Do not edit code unless I ask.

1. Read `AGENTS.md` and every file in `.agents/rules/`.
2. Check the diff against the Definition of Done checklist in `AGENTS.md`.
3. Report findings grouped as **Must fix**, **Should fix**, **Nice to have**. Each item: file, line, rule violated, suggested fix.
4. Flag: `useEffect` fetching, server data in state, raw palette colours, edits to `components/ui/*`, missing loading/empty/error states, missing permission checks, `any`, unvalidated external data.
5. End with a one-line verdict: ready, or not ready and why.
