---
name: dream-design
description: How to build or change any user interface in the Dream Planner app. Use for new components, pages, tables, charts, the house scene, styling, copy and responsive behaviour.
---

# Building UI for Dream Planner

The full visual spec is `docs/DESIGN.md` (tokens, type, component specs, house room coordinates, chart rules). The working reference is `reference/prototype.html`. Do not restate them here; follow them.

## Before writing a component
1. Open `reference/prototype.html` in the browser and find the matching piece. Copy its structure, spacing and behaviour, then translate to React + CSS Modules.
2. Read the component's row in `docs/DESIGN.md` section 5.
3. Check whether a shared piece already exists in `components/` (EditableTable, MonthPills, Card, ProgressBar, SaveChip, DeleteButton, Stamp). Reuse before creating.

## Rules
- Colours, radii and fonts come only from the CSS variables in `app/tokens.css`. No hex values in component styles, except the fixed house-scene colours listed in DESIGN.md section 2.
- Server Components by default. Add `"use client"` only to interactive leaves (editable cells, forms, pills, collapsibles).
- One generic `EditableTable` drives every tracker table: column config in, typed rows in, `onEdit(rowId, key, value)` and `onDelete(rowId)` out. Column types: text, number, date, select, checkbox, calculated.
- Number inputs: show `1,234,567` at rest, raw digits on focus, select all on focus, save on change. Tab moves to the next cell without losing focus after a save.
- No modal dialogs, no toast library, no browser `alert/confirm`. Confirm deletes inline.
- Charts and the house are plain SVG components fed by `lib/calc` output. No chart library.
- Sentence case, short labels, the family's own terms (see DESIGN.md section 8). No emoji icons.

## Check every screen you touch
| Check | How |
|---|---|
| 380px wide | Page body does not scroll sideways; tables scroll in their box |
| Dark scheme | Emulate `prefers-color-scheme: dark`; text stays readable, amber still reads as "paid" |
| Burmese text | Open Expenses or Labour; names render and are not clipped |
| Keyboard | Tab through a table row; focus ring visible; Enter in quick add submits |
| Board parity | Numbers on `/` equal the same numbers in `reference/prototype.html` for unedited seed data |
