# F1 Driver Telemetry Comparator — Project Docs

This `docs/` folder is the spec pack for building the **Driver Telemetry Comparator**
(Full "F1 Vision" scope: 14-panel analytics board + race replay engine) as a
**Python + Streamlit** app on top of the **FastF1** API.

These documents are written to be handed to an AI coding assistant (Claude Code,
Cursor, etc.) or a human developer, one file at a time, to "vibe code" the project
in phases. They describe what to build and why — not finished code.

## Read order

| # | Doc | Purpose |
|---|-----|---------|
| 1 | [`00-overview.md`](./00-overview.md) | What this project is, scope, non-goals, and a note on source material |
| 2 | [`01-architecture.md`](./01-architecture.md) | Tech stack, system architecture, data flow |
| 3 | [`02-data-source-fastf1.md`](./02-data-source-fastf1.md) | How FastF1 data works, caching, sync/alignment method |
| 4 | [`03-panels-spec.md`](./03-panels-spec.md) | The 13 analytics panels — what each shows and how it's computed |
| 5 | [`04-replay-engine.md`](./04-replay-engine.md) | The 14th panel: the race replay engine |
| 6 | [`05-project-structure.md`](./05-project-structure.md) | Folder/file layout |
| 7 | [`06-setup.md`](./06-setup.md) | Environment, dependencies, running locally |
| 8 | [`07-roadmap.md`](./07-roadmap.md) | Phased build plan with validation checkpoints |

## One important correction to flag up front

The source brief for this project says the reference implementation is
`ArsalanKaleem/F1-Vision` on GitHub, built with Python/FastF1/Streamlit. Checking
the actual repo: **F1-Vision is a Flutter app** (ships Windows/Android installers,
uses an Isar offline cache) pulling data from the **OpenF1** and **Jolpica**
APIs — not Python, not Streamlit, not FastF1. Its "14-panel analytics board" and
"Driver Comparison Studio" are real features of that app, but the exact panel
list isn't published anywhere public, so it can't be copied faithfully.

Practically: you can't clone F1-Vision's screens 1:1 in Streamlit. What these docs
do instead is design an **original 14-panel board** for the same underlying idea
(two-driver, corner-by-corner telemetry comparison + a replay engine), built
specifically for the FastF1 + Streamlit + Plotly stack. Treat the F1-Vision name
as inspiration for the feature *ambition* (a serious multi-panel board, not a toy
chart), not as a spec to reverse-engineer.
