# Dream Planner: product requirements

## 1. Goal

Replace the "Dream Planner ♡" Google Sheet with a web app where the family edits the data in simple tables and one live board shows the picture. Nothing is imported by hand: phase 1 loads `data/seed.json`.

Users: Chaw Su and her husband (KoKo). Both can edit everything. No roles.

## 2. Screens

Top bar on every screen: app name, tabs, a save-state chip (Saved / Saving / Could not save).

| Route | Tab | Purpose |
|---|---|---|
| `/` | Board | Read-only picture of everything. Redraws from live data |
| `/home` | Home budget | Budget lines grouped by room: estimate and paid |
| `/expenses` | Expenses | Quick-add form, monthly expense lists, family loan |
| `/materials` | Materials | Purchases: price, quantity, total, paid, status |
| `/labour` | Labour | Workers per month: days, rate, paid, meals |
| `/trips` | Trips | One card per trip with cost lines in 4 currencies |
| `/savings` | Savings | Monthly income/spend, running total chart, holdings, FX notes |
| `/login` | (none) | Passcode screen |

### 2.1 Board (`/`)
Match `reference/prototype.html` section by section.

| Block | Content | Source |
|---|---|---|
| Three tiles | Home % paid with paid/left; trips done/planned/no status; savings total for the current month row and the plan's final month | budget, trips, savings |
| House scene | 13 rooms, each filled with light to its paid share. Spec in `docs/DESIGN.md` | budget by room |
| Room by room | 13 bars sorted by % paid, with paid and left | budget by room |
| Build spending by month | Bar per expense month in K millions; current month striped | expenses |
| Family loan | Borrowed so far, still to borrow, total, months to repay | loans, budget, savings, settings |
| What went into the walls | Cement bags, bricks, rebar tons, labour person-days up to the current month; cement first vs latest price | materials, labour |
| Boarding passes | One ticket per trip: place, name, top 3 lines by kyat value, status stamp, kyat total, foreign part, who | trips |
| Savings path | Line chart of running total; solid for received months, dashed for pending; shaded band over the build months | savings, expenses |

### 2.2 Home budget
- Summary: estimated total, paid, left to pay.
- One collapsible block per category, in sheet order, showing name, % bar, paid, left, line count.
- Inside: table of lines (Line, Details, Estimate, Paid, Left = calculated), add line, delete line.
- Negative "Left" (overpaid) is shown in the warning colour, not hidden.

### 2.3 Expenses
- Quick add form: Date (default today), Item, Amount, Budget line (select of all budget lines, optional), checkbox "Also add to Paid on that budget line" (default on), button Add expense. On submit: create the expense; if the box is ticked and a line is chosen, add the amount to that line's `paid` in the same transaction. Keep focus in Item for fast entry on site.
- Month pills (label + month total). Default: latest month. The month of an expense is `period`, stored on the row. For new rows `period` = month of the date.
- Table: Date, Item, Amount, Budget line, Checked. Footer total.
- Editing or deleting an existing expense does NOT touch the budget line's paid amount. Say so in a one-line note under the table.
- Family loan section: summary (borrowed, still to borrow, months to repay), table (Date, From, Amount, Into), add transfer, and two settings: "Repay per month" and "Compare against savings in (month)".

### 2.4 Materials
Table: Material, Price, Unit, Date, Qty needed, Qty bought, Total cost, Paid, Left (calculated), Status (Done / In Progress / Unpaid). Summary of total cost, paid, left. Changing Price or Qty needed recalculates Total cost; the user can type over Total cost for discounts (several seeded totals are discounted, keep them as seeded).

### 2.5 Labour
Month pills. Table per month: Name, Days, Daily rate, Wage (calc), Paid, Due (calc), Meal allowance; footer totals. Field "Meals paid this month". Button "Start next month" copies the last month's workers with days 0 and paid 0. Days can be halves (0.5).

### 2.6 Trips
Card per trip: Trip, Where, Who, Status (blank / Pending / Completed). Lines table: Line, Currency (MMK/THB/USD/SGD), Price, Qty, Total (calc), In kyat (calc). One "K per 1 XXX" rate field per foreign currency used in that trip. Trip total in kyat. Add line, add trip, remove trip (confirm).

### 2.7 Savings
- Chart (same as board).
- "Starting balance before the first month".
- Table per month: Month, CDG salary, TF / Class, KoKo's saving, Expense, Extra expense, Extra in, Net saving (calc), Total (calc), and four received/pending flags (CDG, Class, KoKo, Interest). Add next month (copies CDG salary, KoKo's saving and Expense from the last row, flags pending).
- "What I hold now": Place, Amount, total.
- "Exchange rates": Month, SGD to MMK, THB to MMK, THB per SGD. Notes only; trips use their own rates.

## 3. Formulas (must match the prototype)

| Name | Formula |
|---|---|
| Line left | `estimate - paid` |
| Room % paid | `sum(paid) / sum(estimate)`, clamped 0..1 |
| Home % paid | `sum(all paid) / sum(all estimate)` |
| Month build spend | `sum(expense.amount where period = month)` |
| Wage / Due | `days * rate` ; `wage - paid` |
| Material left | `total - paid` |
| Trip line in kyat | `price * qty * rate[currency]` (rate is 1 for MMK) |
| Net saving | `cdg + tf + koko - expense - extraExpense` |
| Running total | `previous total + net + extraIn`, starting from the opening balance |
| Received month | CDG flag is `received` |
| Still to borrow | `max(0, home left to pay - running total at the compare month)` |
| Total loan / months | `borrowed + still to borrow` ; `total loan / repay per month` |
| Person-days | `sum(days)` for labour months up to and including the current month |

## 4. Known quirks carried from the sheet (do not "fix" silently)

| Quirk | Decision already taken |
|---|---|
| Sheet's June 2026 total (29,516,660) double counts a 220,000 July row | App total is 29,296,660 (sum of rows) |
| "MainDoors & Internal/BackDoors" estimate | Seeded as paid + left (10,384,370) so left to pay matches the sheet |
| "Ceiling & Partition" is overpaid by 288,000 | Left is negative; show it |
| August expense block was dated "1 July, 2026" | Seeded as 2026-08-01 |
| Sheet's "loan required" used an older savings figure (13.5M) | App computes from live rows (about 19.8M at seed time) |
| Expense rows link to budget lines by name in the seed | Resolve to ids while seeding; all names match, none are duplicated |
| An unnamed 4-person Thailand cost-split table | Not carried over |

## 5. Phases and acceptance

| Phase | Build | Accept when |
|---|---|---|
| 0 Scaffold | Next.js app, TypeScript, lint, Vitest, Drizzle + libSQL, CSS tokens from DESIGN.md, top bar with tabs (empty pages), npm scripts | `npm run dev` shows the shell; typecheck and lint pass |
| 1 Data | Schema + migration, `db:seed`, `lib/calc/*` with tests, `verify:data` | `verify:data` matches every number in `data/expected-totals.json` |
| 2 Board | `/` complete, server-rendered from the database | Side by side with `reference/prototype.html` the numbers and layout match |
| 3 Tracker | The six editing tabs with save-on-change, add, delete, quick add | Adding a 1,000,000 expense to a Structure line raises that room on the board; every edit survives a reload |
| 4 Access | Passcode login, middleware, logout, CSV export per table | Every route redirects to `/login` without the cookie |
| 5 Hosting | Propose 2 hosting options with free-tier facts checked on the day, then deploy the one the owner picks | Owner can open it on her phone |

## 6. Out of scope
Multi-user accounts, roles, offline mode, receipt photos, bank sync, notifications, a Google Sheets sync.
