# Dream Planner ♡

A private family tracker for the house build, trips and savings. It replaces the "Dream Planner ♡" Google Sheet.

## Run it on a laptop

| Step | Command |
|---|---|
| 1. Install | `npm install` |
| 2. Settings | Copy `.env.example` to `.env.local`, set `APP_PASSCODE` and a long random `SESSION_SECRET` (32+ characters) |
| 3. Database | `npm run db:migrate` then `npm run db:seed` |
| 4. Start | `npm run dev`, open http://localhost:3000 |

`npm run db:seed` refuses to run when the database already has data. `--force` wipes the family's edits, so only use it on purpose.

## Checks

`npm run typecheck`, `npm run lint`, `npm test`, `npm run verify:data`. See `.claude/skills/verify`.

## Where things are

| Path | What |
|---|---|
| `app/` | Pages, server actions (`app/actions.ts`), login, CSV export (`app/export/[table]`) |
| `components/` | Shared UI, the board pieces, the editable table |
| `lib/calc/` | Every formula, as pure functions with tests |
| `lib/db/` | Drizzle schema, client, loader |
| `proxy.ts` | Sends anyone without the family cookie to `/login` |
| `docs/` | PRD and design spec |

Keep this repository private: `data/seed.json` holds real family finances and workers' names.
