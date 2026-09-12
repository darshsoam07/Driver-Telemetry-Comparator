# 05 — Project Structure

```
driver-telemetry-comparator/
├── app.py                      # Entry point: page config, shared sidebar (year/GP/session/drivers)
├── pages/
│   ├── 1_Telemetry_Board.py    # Renders the 13 analytics panels
│   └── 2_Replay_Studio.py      # Renders the animated replay (panel 14)
├── src/
│   ├── data/
│   │   ├── fastf1_client.py    # enable_cache(), get_session(), thin wrapper only
│   │   ├── telemetry.py        # per-lap telemetry fetch, add_distance, DRS/brake helpers,
│   │   │                       # distance-grid alignment (the core alignment logic lives here)
│   │   └── circuit.py          # corner info, track X/Y outline extraction
│   ├── analytics/
│   │   ├── delta_time.py       # cumulative time delta calculation
│   │   ├── corners.py          # corner-by-corner gap table
│   │   └── sectors.py          # sector delta from session.laps
│   ├── viz/
│   │   ├── panels.py           # one function per panel, returns a go.Figure
│   │   └── track_map.py        # shared track-outline drawing helper (panels 9–11 all use this)
│   └── replay/
│       └── engine.py           # time-grid interpolation + Plotly frame construction
├── cache/                      # FastF1 disk cache (gitignored)
├── requirements.txt
├── .streamlit/
│   └── config.toml             # theme, wide layout
├── .gitignore
└── README.md
```

## Conventions

- **Nothing outside `src/data/` imports `fastf1` directly.** Every other
  module works with plain Pandas DataFrames. This is what makes `src/viz/`
  and `src/analytics/` testable with small hand-built fixture DataFrames
  instead of needing real network calls in tests.
- **One function per panel** in `src/viz/panels.py`
  (`speed_overlay(df_a, df_b) -> go.Figure`, etc.), each taking already-aligned
  DataFrames. The pages files should be thin: fetch data, call analytics
  functions, call viz functions, lay out with `st.columns`/`st.tabs`. No
  Plotly construction inline in a `pages/*.py` file.
- **Driver color mapping** defined once (e.g. `src/viz/panels.py` module-level
  constant) and imported everywhere else that needs it, including
  `replay/engine.py` — never redefine the two colors in more than one place.
- `st.session_state` keys for the shared selections (`year`, `gp`,
  `session_type`, `driver_a`, `driver_b`, `lap_a`, `lap_b`) are set once in
  `app.py`'s sidebar and read (not re-set) by both pages.
