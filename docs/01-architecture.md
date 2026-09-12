# 01 — Architecture

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| App framework | **Streamlit** (multi-page) | Python-only, fastest path from data to UI, native `st.plotly_chart`, `st.sidebar`, caching decorators |
| Data source | **FastF1** | Official F1 timing/telemetry feed, free, no API key, built-in caching |
| Charting | **Plotly** | Interactive hover/zoom on telemetry traces; supports animation frames for the replay engine |
| Track maps | **Plotly** (scatter over X/Y position data) | Keeps a single charting library instead of mixing in Matplotlib |
| Data handling | **Pandas / NumPy** | FastF1 already returns Pandas DataFrames; NumPy for distance-grid interpolation |
| Local cache | **FastF1's built-in disk cache** | Avoids re-downloading the same session repeatedly |

No database, no backend API, no auth. State that needs to persist across a
single user's interactions (selected drivers, selected lap, replay playhead)
lives in `st.session_state`.

## System diagram (text form)

```
┌─────────────────────────────────────────────────────────┐
│                     Streamlit App                        │
│                                                           │
│  Sidebar: Year / GP / Session / Driver A / Driver B      │
│                        │                                 │
│                        ▼                                 │
│              src/data/fastf1_client.py                   │
│         (load session, cached, once per selection)       │
│                        │                                 │
│         ┌──────────────┼──────────────┐                  │
│         ▼              ▼              ▼                  │
│  src/data/telemetry  src/data/circuit  session.laps       │
│  (per-driver lap      (corner list,     (lap times,       │
│   telemetry, distance  track X/Y)       sectors, speed    │
│   interpolated)                          trap results)    │
│         │              │              │                  │
│         └──────┬───────┴───────┬──────┘                  │
│                ▼                ▼                         │
│      src/analytics/*     src/replay/engine.py             │
│  (delta time, corner      (position-over-time frames)     │
│   gaps, sector diff)                                       │
│                │                │                          │
│                ▼                ▼                          │
│      src/viz/panels.py    pages/2_Replay_Studio.py         │
│   pages/1_Telemetry_Board.py                                │
└─────────────────────────────────────────────────────────┘
```

## Data flow, step by step

1. User picks **Year → Grand Prix → Session type → Driver A → Driver B** in
   the sidebar (shared across both pages via `st.session_state`).
2. `fastf1_client.get_session()` loads the session object (cached by
   `st.cache_resource`, keyed on year/GP/session — FastF1 also caches to disk
   independently, so this avoids re-parsing already-downloaded data).
3. For each driver, pull the relevant lap (fastest lap by default, or a lap
   the user picks from a dropdown of that driver's laps) via
   `session.laps.pick_driver(code)`.
4. Pull that lap's merged car + position telemetry with
   `lap.get_telemetry()`, then run `add_distance()` so every sample has a
   `Distance` column (metres from the start/finish line) — **this is the
   shared key used to align the two drivers, not time**. See
   `02-data-source-fastf1.md` for why.
5. `src/analytics/*` computes derived series (delta time vs. distance, gap at
   each corner, sector deltas) from the two aligned telemetry DataFrames.
6. `src/viz/panels.py` turns each analytics result into a Plotly figure;
   `pages/1_Telemetry_Board.py` lays out all 13 in a grid.
7. `src/replay/engine.py` builds a list of animation frames from position
   data; `pages/2_Replay_Studio.py` renders them as a Plotly figure with
   play/pause/scrub controls.

## Caching strategy

- **FastF1 disk cache** (`fastf1.Cache.enable_cache('cache/')`): mandatory,
  set once at app startup. This is what makes repeat runs fast — first load
  of a session downloads real data (can take 10–60s depending on session
  type), subsequent loads are near-instant.
- **`st.cache_resource`** around the "load session" function: avoids
  re-triggering FastF1's own cache lookup on every Streamlit rerun (Streamlit
  reruns the whole script on each widget interaction).
- **`st.cache_data`** around pure-Python transforms (distance interpolation,
  delta-time calculation): these are cheap but reruns happen often, so cache
  by a key of `(session_id, driver, lap_number)`.

## What should NOT change once built

- The **distance-based alignment** approach (see next doc) is the load-bearing
  design decision for every panel. Don't quietly switch any panel to
  time-based alignment — it will silently desync gear/DRS/brake overlays from
  the delta-time panel.
- Keep FastF1 calls isolated inside `src/data/`. Nothing in `src/viz/` or the
  `pages/` files should call FastF1 directly — that keeps the charts testable
  against fixture DataFrames without hitting the network.
