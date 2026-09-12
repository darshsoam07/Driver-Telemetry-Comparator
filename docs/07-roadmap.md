# 07 — Development Roadmap

Build in this order. Each phase has a validation checkpoint — don't start the
next phase until the current one's checkpoint passes against **real** FastF1
data (not mocked data), since the whole point of this project is that it
works on real telemetry.

## Phase 0 — Environment + data smoke test

- Set up the project structure, `requirements.txt`, FastF1 cache.
- Write a throwaway script (not part of the app) that loads one session, one
  driver, one lap, and prints `Speed`/`Throttle`/`Brake`/`DRS`/`nGear`
  columns to confirm the data actually comes through.
- **Checkpoint:** you can load a real 2023+ race session and see sane speed
  values (0–350 km/h range) for a known driver.

## Phase 1 — Core alignment + MVP overlays (panels 1–5)

- Build `src/data/telemetry.py`: distance interpolation, DRS/brake helpers.
- Build `pages/1_Telemetry_Board.py` with just the 5 channel overlays for two
  hardcoded drivers on their fastest laps.
- **Checkpoint:** overlay two drivers from the same session; visually sanity
  check that the driver who set the faster lap time has a visibly "better"
  speed trace (higher min-corner speeds and/or higher straight-line speed) —
  if the numbers are scrambled, the alignment is wrong before anything else
  gets built on top of it.

## Phase 2 — Timing panels (6–8)

- Delta time, corner gap table, sector comparison.
- **Checkpoint:** run the full validation checklist from
  `03-panels-spec.md` (delta time at lap end ≈ actual lap gap; corner deltas
  sum to the total).

## Phase 3 — Track maps (9–11)

- Speed-colored map, braking-point map, gear-shift map.
- **Checkpoint:** braking-point markers cluster at plausible locations (heavy
  braking zones into hairpins/chicanes), not scattered randomly around the
  lap — a scatter usually means the True→False edge detection on `Brake` is
  buggy.

## Phase 4 — Context panels + driver/session picker UI (12–13)

- Speed trap comparison, stint consistency.
- Replace hardcoded drivers with the real sidebar picker (year → GP → session
  → driver A → driver B → lap selection, defaulting to fastest green-flag
  lap per `02-data-source-fastf1.md`).
- **Checkpoint:** switch between at least 3 different real sessions in the UI
  without errors, including one qualifying session and one race session.

## Phase 5 — Replay Studio (panel 14)

- Time-grid interpolation, Plotly animation frames, playback controls.
- **Checkpoint:** run the validation checklist from `04-replay-engine.md`.

## Phase 6 (stretch, optional) — Full-stint replay

- Extend replay beyond a single lap using the manual-loop rendering pattern
  described in `04-replay-engine.md` instead of baked-in animation frames.
- Only attempt this after Phase 5 is solid — it changes the rendering
  approach, not just the data range.

## Explicitly not planned

- Real-time live timing (`fastf1.livetiming`) — see `00-overview.md` for why.
- Cross-circuit or cross-season driver comparison.
- Any authentication, persistence, or multi-user features.
