# Dream Planner

A private family tracker for three things: a house being built, trips, and monthly savings. It replaces a Google Sheet. One live board (the "dream board") redraws from the data the family edits in the tracker tabs.

Owner: Chaw Su (designer, comfortable with Next.js/React, not a backend engineer). Explain decisions in plain words. Prefer short summaries and tables over long prose when you report back.

## Read these before you write code

| File | What it is |
|---|---|
| `docs/PRD.md` | Screens, behaviour, formulas, build phases, acceptance checks |
| `docs/DESIGN.md` | Visual system: tokens, type, components, the house scene |
| `data/seed.json` | All real data, already extracted and checked against the sheet |
| `data/expected-totals.json` | Totals the database must reproduce after seeding |
| `reference/prototype.html` | Working single-file prototype. Open it in a browser. Match its board and its formulas |

Skills in `.claude/skills/`: `dream-data` (schema, seed mapping, formulas), `dream-design` (how to build UI here), `verify` (checks to run before every commit).

## Stack (decided, do not swap without asking)

| Layer | Choice | Why |
|---|---|---|
| Framework | Current stable Next.js, App Router, TypeScript strict | Owner's usual stack |
| Database | SQLite through libSQL (`@libsql/client`), local file `file:./data/dream.db` | No account needed to start. Supabase is NOT available (free project limit reached) |
| ORM | Drizzle ORM + drizzle-kit migrations | Typed schema, plain SQL migrations |
| Writes | Server Actions with zod validation | No separate API layer needed |
| Styling | CSS Modules + CSS variables from `docs/DESIGN.md` | Works in Server Components with no runtime. Do not add styled-components, Tailwind or a UI kit unless the owner asks |
| Charts | Hand-drawn SVG components | The prototype already defines them; no chart library |
| Auth | One shared passcode (`APP_PASSCODE` env) and a signed httpOnly cookie, enforced in middleware | Two family users, no sign-up flow |
| Tests | Vitest for formulas and the seed check | |

Check current docs for exact package versions and APIs before installing. Do not rely on memory for version-specific syntax.

Hosting is decided in the last phase, not now. The app must run fully with `npm run dev` on a laptop first.

## Commands (create these scripts in phase 0)

| Command | Does |
|---|---|
| `npm run dev` | Start the app |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:seed` | Wipe and load `data/seed.json` (refuses unless `--force` when tables are not empty) |
| `npm run verify:data` | Compare database totals with `data/expected-totals.json` |
| `npm run typecheck` / `npm run lint` / `npm test` | Quality gates |

## Rules

Data
- Money in kyat is an INTEGER number of kyat. Foreign prices and exchange rates are REAL. Never use floats for kyat totals; round at the edge.
- Never store a number that can be calculated (left to pay, wage, due, net saving, running total, trip totals, board percentages). Calculate in `lib/calc/*` as pure functions with tests. The sheet broke because totals were typed by hand.
- Dates are ISO strings `YYYY-MM-DD`; month keys are `YYYY-MM`. The user's time zone is Asia/Yangon.
- Text is often Burmese. Keep everything UTF-8, never transliterate, never trim or "clean" names.
- `data/seed.json` is the source of truth for the first load. Do not edit it. If something looks wrong in it, stop and ask.

Privacy
- This is real family finance data and real workers' names. Keep the repo private. Never send the data to any third-party service, analytics, error tracker or AI API. No telemetry.
- `.env*` and `data/*.db` are git-ignored. Never print secrets.

Behaviour
- Every edit saves on blur/change (optimistic UI, then server action). Show a small saved/saving/error state. No "Save" buttons on tables.
- Deleting a row needs a second click to confirm (inline, no browser `confirm()`).
- Editing data must update the board on next view without a manual refresh (`revalidatePath` or equivalent).
- The app must be usable on a phone at 380px wide: wide tables scroll inside their own box, the page body never scrolls sideways.

Working agreement
- Build phase by phase as listed in `docs/PRD.md`. At the end of each phase: run the `verify` skill, commit, then report in under 10 lines what was built and what to check.
- Do not start the next phase if `verify:data` fails.
- Ask before: changing the stack, changing a formula, deleting data, adding a paid service, or anything in the Privacy list.
- Keep components small and boring. No premature abstractions, no state library; server data plus local component state is enough.

## Definition of done for any change
1. `npm run typecheck`, `npm run lint`, `npm test` pass.
2. `npm run verify:data` passes on a freshly seeded database.
3. The changed screen was opened in the browser at desktop and 380px width.
4. No stored value duplicates something `lib/calc` can derive.
