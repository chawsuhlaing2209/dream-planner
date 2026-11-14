---
name: verify
description: Checks to run before every commit and at the end of every build phase in the Dream Planner app. Use before committing, when asked to verify or test the app, or when a number on the board looks wrong.
---

# Verify Dream Planner

Run in this order and stop at the first failure. Fix the cause, never the expected numbers.

1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. Data check on a fresh database:
   ```bash
   rm -f data/verify.db
   DATABASE_URL=file:./data/verify.db npm run db:migrate
   DATABASE_URL=file:./data/verify.db npm run db:seed
   DATABASE_URL=file:./data/verify.db npm run verify:data
   ```
   `verify:data` must compare every key in `data/expected-totals.json` (tolerance 2 kyat on money totals, exact on row counts) and print a table of key, expected, actual, OK/DIFF.
5. If UI changed: start the app, open each changed route at desktop width and at 380px, and confirm the items in the `dream-design` checklist.

## Spot checks worth knowing by heart (seed data)

| Figure | Value |
|---|---|
| Home paid / left | 229,923,577 / 63,434,175 (78%) |
| Expenses May to Nov 2026 | 29,296,650 · 29,296,660 · 21,839,355 · 18,764,000 · 16,456,900 · 38,399,700 · 13,574,000 |
| Family loan borrowed | 76,050,000 |
| Materials total / paid | 207,860,635 / 175,776,501 |
| Savings running total, Jul 2028 | 185,570,056 or 185,570,057 (rounding) |
| Trip totals in kyat | Phuket 11,329,140 · Weeknd 9,548,246 · Bali 4,398,150 · Kawthaung 13,027,472 · East Java 7,493,635 |

## Never
- Never edit `data/seed.json` or `data/expected-totals.json` to make a check pass.
- Never run `db:seed --force` against the real `data/dream.db` without asking; it wipes the family's edits.
- Never commit `data/*.db` or `.env*`.

## Report format
End with a table: check, result, note. Then one line on what the owner should look at in the browser.
