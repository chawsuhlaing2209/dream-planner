# Dream Planner: design spec

The reference implementation is `reference/prototype.html`. When this file and the prototype disagree, the prototype wins; tell the owner.

## 1. Idea

A calm planning tool with one piece of delight: **the house lights up as it gets paid**. Each budget category is a room in a night-time cross-section. Lamp-light fills a room from the floor up to its paid share. Everything else stays quiet so that picture carries the page.

Three chapters share one visual language: home (lamp amber), trips (boarding passes with stamps), savings (a reservoir line that drains and refills).

## 2. Tokens

Put these in `app/tokens.css` as CSS variables. Light is the default; dark applies with `prefers-color-scheme: dark`. Style everything through tokens.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#F2F5FA` | `#0C142B` | Page background |
| `--card` | `#FFFFFF` | `#141F3F` | Cards, tables |
| `--ink` | `#17254A` | `#EEF2FB` | Text, primary button |
| `--muted` | `#5D6A8C` | `#9FADD0` | Secondary text, labels |
| `--line` | `#D9E0EE` | `#27355F` | Borders, grid lines, empty bar |
| `--field` | `#F6F8FC` | `#1A2750` | Input hover/focus fill |
| `--lamp` | `#F2A93B` | `#F5B450` | Paid, lit, active tab, focus ring |
| `--lamp-ink` | `#8A5A06` | `#F5C877` | Amber text on paper |
| `--done` | `#1F8A70` | `#4CC3A5` | Completed, received, saved |
| `--plan` | `#C24E77` | `#EE86AA` | Planned, pending, negative, delete |
| `--night` | `#111C3A` | `#111C3A` | House scene background (same in both themes) |

House scene fixed colours (not themed): unlit room `#1D2C55`, walls `#93A6DA`, lamp gradient `#FFD27A` to `#F2A02B`, ground `#0B1329`, stars `#C9D5F5`, moon `#F4E7C1`, label text `#FFFFFF` with a 3.5px `#0E1730` outline (`paint-order: stroke`) so it reads on lit and unlit fill.

Semantic colour is separate from accent: amber means paid, green means done/received, rose means planned/pending/negative.

## 3. Type

| Role | Font | Notes |
|---|---|---|
| Display (h1-h3, big numbers) | Bricolage Grotesque 500/700 | Use `next/font`. Tight line-height 1.1, `text-wrap: balance` |
| Body and UI | Figtree 400-700 | |
| Burmese fallback | `"Noto Sans Myanmar", "Myanmar Text"` in the body stack | Many item and worker names are Burmese |

Scale: h1 `clamp(1.9rem, 4.6vw, 2.8rem)`, h2 `clamp(1.4rem, 3vw, 1.85rem)`, h3 1.05rem, body 16px, small .875rem, table .9rem, eyebrow/column labels .74-.8rem uppercase with .06-.12em tracking. All numbers use `font-variant-numeric: tabular-nums`. Running text max 62ch.

## 4. Layout

- Content width 1120px, side gutter 20px, section gap 36px, card radius 16px, card padding 18-20px, pill/bar radius 99px, inputs radius 7px.
- Sticky top bar: brand left, save chip right, tab row below (scrolls sideways on phones). Active tab has a 3px `--lamp` underline.
- Board grids: tiles `repeat(auto-fit, minmax(210px, 1fr))`; house + room list is a 1.15fr / 1fr split that stacks under 860px; the three small cards `repeat(auto-fit, minmax(260px, 1fr))`; tickets `repeat(auto-fit, minmax(290px, 1fr))`.
- Phone (380px): everything stacks; tables and the chart scroll inside their own container; the page body never scrolls sideways.

## 5. Components

| Component | Spec |
|---|---|
| Tile | Uppercase label, big display number, one muted line. Home number in `--lamp-ink`, trips in `--done` |
| Progress bar | 8px high, `--line` track, `--lamp` fill |
| Editable table | Inputs look like plain text until hover/focus (transparent border, `--field` fill on hover, `--lamp` border on focus). Numbers right-aligned, shown with thousands separators, raw digits while focused. Calculated cells are plain text. Bold totals row with a 2px top border. Delete is a quiet × that turns into a rose "Delete?" for 3 seconds |
| Month pills | Rounded pills; selected is `--ink` on `--paper` text. Expense pills include the month total |
| Quick-add form | Card with labelled fields in an auto-fit grid, one primary button (`--ink` background) |
| Category block | Collapsible row: name, %, bar, "paid · left · n lines"; table inside |
| Boarding pass | Card split by a 2px dashed line into main (place eyebrow, name, up to 3 chips) and a 128px stub (stamp, kyat total, "incl. ฿…", who) |
| Stamp | Uppercase, 2px border, rotated -6deg. Completed = `--done`, Planned = `--plan`, No status = `--muted` dashed |
| Month bars | Flex bars, value label above in K millions, month below; current month is diagonally striped amber |
| Loan stack | 22px pill split into borrowed (`--ink`) and still to borrow (`--plan`), with a definition list under it |
| Save chip | Dot + text: green "Saved", amber "Saving", rose "Could not save" |

## 6. House scene

SVG, `viewBox="0 0 680 500"`. Ground line at y=456. For each room: unlit rect, then a lamp-gradient rect of height `h * paidShare` anchored to the room's floor, then the wall outline (2.5px). Label: short name and % (two lines), or one line "Name 99%" for the shallow rooms.

| Room key | Short label | x | y | w | h | One-line label |
|---|---|---|---|---|---|---|
| reserve | Reserve | 150 | 50 | 90 | 40 | yes |
| smart | Smart home | 110 | 90 | 220 | 90 | |
| roof | Roof garden | 330 | 140 | 240 | 40 | yes |
| shrine | Shrine & lights | 110 | 180 | 140 | 120 | |
| finish | Finishing | 250 | 180 | 170 | 120 | |
| doors | Doors & glass | 420 | 180 | 150 | 120 | |
| kitchen | Kitchen | 110 | 300 | 150 | 120 | |
| living | Furniture | 260 | 300 | 170 | 120 | |
| bath | Bathrooms | 430 | 300 | 140 | 120 | |
| structure | Structure | 110 | 420 | 460 | 36 | yes |
| labour | Labour | 22 | 200 | 72 | 220 | |
| plans | Plans | 22 | 120 | 72 | 62 | |
| garden | Garden | 586 | 356 | 76 | 64 | |

Extras: roof line from (100,90) to (340,90), 5px; terrace rail at y=118 from x=332 to 572 with posts every 25px down to y=140; a crescent moon at (585,70); twelve small stars. Caption under the scene: "Lit = paid · dark = still to pay". Each category row in the database carries its `room` key.

## 7. Savings chart

SVG `viewBox="0 0 760 320"`, plot area x 56-704, y 24-270. Y max is a "nice" ceiling of the largest total; 5 grid lines labelled in M. X labels on the first month and every January. Received months: solid 3px `--done` line with a 12% area fill. From the last received month on: dashed 3px `--plan` line. A 13% `--lamp` band covers the months that have expenses, labelled "House build". Dots with labels on the peak, the last received month and the final month. On narrow screens keep `min-width: 560px` and let its container scroll.

## 8. States and copy

- Every list has an empty state in one short sentence.
- Loading: server-render first; no spinners for the first paint.
- Errors say what happened and what to do ("Could not save. Edit the row again to retry.").
- Labels are plain and short, sentence case. Use the family's own words from the sheet: "CDG salary", "TF / Class", "KoKo's saving", "Budget line", "Left to pay".
- Money: full figures in tables (`K 1,234,567`), millions on the board (`K 63.4M`). Foreign: `฿`, `$`, `S$`.
- No emoji as icons. The only ornament is the ♡ in the app name.

## 9. Accessibility

Visible focus ring (2px `--lamp`), every input has a label or `aria-label` naming its column, table headers use `scope="col"`, SVGs have `role="img"` and an `aria-label` with the key figures, colour is never the only signal (stamps and chips carry text), respect `prefers-reduced-motion`.
