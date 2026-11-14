---
name: dream-data
description: Database schema, seed mapping and calculation rules for the Dream Planner app. Use when creating or changing the Drizzle schema, migrations, the seed script, anything in lib/calc, or any server action that writes data.
---

# Dream Planner data

Formulas and sheet quirks live in `docs/PRD.md` sections 3 and 4. Read them first. This skill covers the schema and how `data/seed.json` maps into it.

## Schema (SQLite via Drizzle)

Every table has `id` (text primary key, keep the ids from the seed) and `created_at`, `updated_at`. Kyat amounts are INTEGER. Use `sort` INTEGER to preserve the sheet's row order.

| Table | Columns |
|---|---|
| `budget_categories` | `key` (unique: plans, labour, structure, roof, doors, finish, living, kitchen, shrine, garden, smart, bath, reserve), `name`, `short_label`, `board_label`, `sort` |
| `budget_lines` | `category_id` FK, `name` (unique), `details`, `link`, `estimate`, `paid`, `sort` |
| `expenses` | `period` (YYYY-MM, indexed), `date`, `item`, `amount`, `budget_line_id` FK nullable (on delete set null), `checked` BOOLEAN, `sort` |
| `loan_transfers` | `date`, `from_whom`, `amount`, `into_account`, `sort` |
| `materials` | `name`, `price` REAL, `unit`, `date`, `qty_needed` REAL, `qty_bought` REAL, `total_cost`, `paid`, `status` (Done / In Progress / Unpaid), `sort` |
| `labour_months` | `period` (unique), `meals_paid` |
| `labour_entries` | `month_id` FK cascade, `name`, `days` REAL, `daily_rate`, `paid`, `meal_allowance`, `sort` |
| `trips` | `name`, `place`, `who`, `status` ('' / Pending / Completed), `sort` |
| `trip_lines` | `trip_id` FK cascade, `name`, `currency` (MMK / THB / USD / SGD), `price` REAL, `qty` REAL, `sort` |
| `trip_rates` | `trip_id` FK cascade, `currency`, `kyat_per_unit` REAL, unique (trip_id, currency) |
| `savings_months` | `month` (unique), `cdg`, `tf`, `koko`, `expense`, `extra_expense`, `extra_in`, `cdg_received`, `class_received`, `koko_received`, `interest_received` (BOOLEAN) |
| `holdings` | `name`, `amount`, `sort` |
| `fx_notes` | `month` (unique), `sgd_to_mmk` REAL, `thb_to_mmk` REAL, `thb_per_sgd` REAL |
| `settings` | single row: `opening_balance`, `repay_per_month`, `loan_compare_month` |

Do not add columns for left, wage, due, net, running total or any percentage.

## Seed mapping (`data/seed.json`)

The seed is grouped as `collection -> document id -> body`.

| Seed path | Goes to | Notes |
|---|---|---|
| `budget.<key>` | `budget_categories` | `name`, `short` -> `short_label`, `full` -> `board_label`, `order` -> `sort`; the object key is `key` |
| `budget.<key>.items[]` | `budget_lines` | `est` -> `estimate`, `paid`, `details`, optional `link` |
| `expenses.<YYYY-MM>.items[]` | `expenses` | Object key -> `period`. `cat` is a budget line NAME: resolve to `budget_line_id`; empty string -> null. Fail loudly if a name does not resolve |
| `loans.all.items[]` | `loan_transfers` | `from` -> `from_whom`, `via` -> `into_account` |
| `materials.all.items[]` | `materials` | `rate` -> `price`, `qty` -> `qty_needed`, `bought` -> `qty_bought`, `total` -> `total_cost`. Keep `total` as given (some are discounted) |
| `labour.<YYYY-MM>` | `labour_months` + `labour_entries` | `meals` -> `meals_paid`; `workers[]`: `rate` -> `daily_rate`, `meal` -> `meal_allowance` |
| `trips.<id>` | `trips`, `trip_lines`, `trip_rates` | `pax` -> `who`; `rates` object -> one row per currency; `cur` -> `currency` |
| `savings.all` | `settings.opening_balance` + `savings_months` | `rows[]`: `extraExp` -> `extra_expense`, `extra` -> `extra_in`, `sCdg/sTf/sKoko/sInt` equal to "received" -> true |
| `assets.all.items[]` | `holdings` | |
| `rates.all.rows[]` | `fx_notes` | |
| `dp.settings` | `settings` | `repayPerMonth`, `loanTargetMonth` -> `loan_compare_month` |

Some seed amounts are fractional by less than 1 kyat (from sheet formulas). Round each to the nearest integer on insert; `expected-totals.json` was computed with the same rounding of sums, so allow a tolerance of 2 kyat per total in `verify:data`.

## Seed script rules
- One transaction. Insert in dependency order. Preserve array order in `sort`.
- Refuse to run on a non-empty database unless `--force`, and with `--force` delete everything first.
- After inserting, run the same checks as `npm run verify:data` and exit non-zero on any mismatch.

## Calculations
- All in `lib/calc/` as pure functions that take plain rows and return numbers: `budget.ts`, `expenses.ts`, `labour.ts`, `materials.ts`, `trips.ts`, `savings.ts`, `loan.ts`, `board.ts`.
- One test file per module, using small fixtures plus one test that loads `data/seed.json` and compares with `data/expected-totals.json`.
- "Current month" is an argument, never `new Date()` inside a calc function.

## Writes
- Server actions validate with zod, coerce numbers, reject NaN and negative quantities (negative money is allowed only where the PRD shows it).
- Quick add expense with "also add to paid" updates `expenses` and `budget_lines.paid` in one transaction.
- After a write, revalidate the edited route and `/`.
