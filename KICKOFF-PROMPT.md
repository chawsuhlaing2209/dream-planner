# Kickoff prompt

Paste everything in the box below into Claude Code, started inside this folder.

```
Build the Dream Planner app in this folder.

Start by reading, in this order: CLAUDE.md, docs/PRD.md, docs/DESIGN.md, the three skills in .claude/skills/, then data/expected-totals.json. Skim data/seed.json for its shape. Open reference/prototype.html in a browser (it shows a read-only snapshot) so you know what the board and the tracker tabs look like and how they behave.

Then build phases 0 to 4 from docs/PRD.md section 5, one phase at a time:
- Follow the stack and rules in CLAUDE.md exactly. Supabase is not available.
- At the end of each phase run the verify skill, commit with a clear message, and give me a report of at most 10 lines: what you built, the verify table, and what I should open and check.
- Carry on to the next phase without waiting for me, unless verify fails or you hit one of the "ask before" items in CLAUDE.md.
- Stop after phase 4. Do not deploy. For phase 5, give me two hosting options in a small table with free-tier facts you checked today, and wait for my choice.

Before you write any code, reply with: (1) a 5-line plan, (2) anything in the docs that is unclear or contradictory. If nothing is unclear, start phase 0 straight away.
```

## Follow-up prompts you can reuse

| When | Prompt |
|---|---|
| A number looks wrong | `The board shows X for Y but I expect Z. Use the verify skill, find which calc is off, and show me the rows behind it before changing anything.` |
| New feature | `Add [feature]. First tell me which tables, calc functions and screens change, in a table. Then build it and run verify.` |
| Design tweak | `Using the dream-design skill, change [thing]. Keep tokens and DESIGN.md in sync and show me before/after at 380px.` |
| Ready to host | `Start phase 5 from docs/PRD.md.` |
