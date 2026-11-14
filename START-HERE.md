# Dream Planner starter kit

Everything Claude Code needs to build the app from your sheet data, with nothing to import by hand.

## Use it in 3 steps

1. Unzip. You get a folder called `dream-planner`. Some of it is in a hidden folder named `.claude`; keep it.
2. Open a terminal in that folder, run `git init`, then start Claude Code there (`claude`). Accept the trust prompt so the project skills load.
3. Open `KICKOFF-PROMPT.md`, copy the prompt in the box, paste it into Claude Code.

## What is inside

| File | Role |
|---|---|
| `KICKOFF-PROMPT.md` | The prompt to paste, plus reusable follow-ups |
| `CLAUDE.md` | Project rules Claude Code reads every session |
| `docs/PRD.md` | Screens, behaviour, formulas, phases, acceptance |
| `docs/DESIGN.md` | Colours, type, components, the house scene |
| `.claude/skills/dream-data` | Schema, seed mapping, calculation rules |
| `.claude/skills/dream-design` | How to build UI in this project |
| `.claude/skills/verify` | Checks before every commit |
| `data/seed.json` | Your sheet data, read on 14 Nov 2026 |
| `data/expected-totals.json` | Numbers the app must reproduce |
| `reference/prototype.html` + `seed.js` | The working prototype, to open in a browser |

## Decisions already made for you

| Topic | Decision | Change it by |
|---|---|---|
| Database | SQLite file on your computer, no account | Telling Claude Code before phase 1 |
| Styling | CSS Modules with design tokens | Asking for styled-components instead |
| Login | One shared family passcode | Asking for separate accounts |
| Hosting | Decided last, after it works locally | Phase 5 |

## Privacy

`data/seed.json` holds your real finances and your workers' names. Keep the folder and any Git repository private.
