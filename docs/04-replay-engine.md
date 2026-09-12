# 04 — Replay Studio (Panel 14)

## What it is

An animated playback of both drivers' car positions moving around the track
outline over the course of the compared lap (or a full stint, as a stretch
goal), with play/pause/speed controls and a scrub bar. This is explicitly a
**replay of a completed, cached session** — not live timing. Label it as such
in the UI (e.g. "Replay — 2024 Monaco GP, Qualifying" not "Live").

## Data prep

1. Take the same distance-aligned telemetry from the Telemetry Board (reuse
   `src/data/telemetry.py`, don't duplicate the alignment logic here).
2. Convert the shared distance grid into a shared **time grid** instead for
   replay purposes: replay needs "where is each car at real second N",
   whereas the board's panels need "where is each car at distance N." Use
   each driver's own `(Time, X, Y)` samples, interpolated onto a fixed-step
   time grid (e.g. every 0.1s) spanning `[0, min(driver_A_laptime,
   driver_B_laptime)]`.
3. Each row of the resulting DataFrame is one animation frame: `t, xA, yA,
   xB, yB`.

## Rendering approach (Streamlit + Plotly)

Use a single Plotly figure with the track outline as a static background
trace, and two marker traces (one per driver) whose `x`/`y` update per frame.
Two viable patterns — pick one, don't build both:

- **Plotly native animation frames**: build a `go.Figure` with a `frames` list
  (one `go.Frame` per row of the frame DataFrame) and `updatemenus` for
  play/pause. Pros: smooth, built-in scrub bar via `sliders`. Cons: all
  frames are baked into the figure up front, so very long replays (a full
  race) produce a large payload — fine for a single lap or a short stint,
  not for a 60-lap race.
- **Manual loop with `st.session_state` + placeholder**: keep a "current
  frame index" in session state, redraw a single-frame figure into an
  `st.empty()` placeholder inside a loop with `time.sleep()` between frames.
  Pros: works for arbitrarily long replays without a huge payload. Cons: less
  smooth, playback controls (pause mid-loop) are more fiddly in Streamlit's
  rerun model.

**Recommendation for this project's scope (single-lap comparison):** use the
native Plotly animation-frames approach. It's simpler to implement correctly
and single-lap frame counts (a few hundred at 0.1s steps) are well within a
reasonable payload size. Only reach for the manual-loop approach if a later
phase adds full-stint or full-race replay.

## Controls

- Play / Pause toggle
- Speed multiplier (0.5x / 1x / 2x / 4x) — implemented by changing the frame
  `duration` in Plotly's animation settings, not by skipping frames (skipping
  frames makes fast-forward look choppy rather than fast)
- Scrub bar (Plotly's built-in `sliders` tied to the frame index)
- A live-updating readout of the current delta time at the playhead position
  (reuse the delta-time series from the Telemetry Board so the two screens
  never disagree)

## Validation checklist

- At `t=0`, both markers start at the start/finish line coordinates.
- At any scrub position, the marker that's visually ahead on the track
  outline matches the sign of the delta-time readout at that timestamp — if
  they disagree, the time-grid interpolation and the distance-grid
  interpolation have drifted apart somewhere.
- Total animation duration equals the shorter of the two drivers' lap times
  (not the longer one — the grid is capped at the shorter lap so you never
  show a car frozen at the finish line waiting for the other to catch up).
