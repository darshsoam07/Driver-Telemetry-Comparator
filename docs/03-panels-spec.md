# 03 — Telemetry Board: Panel Spec (13 panels)

All panels below operate on the two drivers' telemetry **after** distance
alignment (see `02-data-source-fastf1.md`). Each entry: what it shows, X/Y
axes, and how it's computed. Build in the order listed — later panels depend
on data structures introduced by earlier ones.

| # | Panel | Shows |
|---|---|---|
| 1 | Speed overlay | Both drivers' speed vs. distance, one line each |
| 2 | Throttle overlay | Throttle % vs. distance |
| 3 | Brake overlay | Brake on/off band vs. distance |
| 4 | Gear overlay | Gear (step chart) vs. distance |
| 5 | DRS overlay | DRS open/closed band vs. distance |
| 6 | Delta time | Cumulative time gained/lost vs. distance |
| 7 | Corner gap table | Time delta at each corner apex |
| 8 | Sector comparison | S1/S2/S3 time delta, bar chart |
| 9 | Speed-colored track map | Track outline, colored by which driver was faster at each point |
| 10 | Braking-point map | Track outline with markers where each driver started braking |
| 11 | Gear-shift map | Track outline colored by gear, per driver (small multiples) |
| 12 | Speed trap comparison | I1/I2/FL/ST speed-trap values, bar chart |
| 13 | Stint consistency | Lap time across the whole stint/session, both drivers, line chart |

### 1–5: Channel overlays

Straightforward: one Plotly line/step trace per driver, shared X-axis
(`Distance`), consistent color per driver across *all* panels (pick two
colors once in `src/viz/panels.py`, e.g. driver A = team-agnostic blue,
driver B = orange — don't try to use real team colors, it adds complexity for
no analytical value and breaks when both drivers share a team).

Brake and DRS render as filled step bands (0/1), not lines — a line makes a
boolean channel look like it has intermediate values it doesn't have.

### 6: Delta time

Single line, `cumulative_time_B - cumulative_time_A` vs. distance. Positive =
driver B is behind at that point; shade the region above/below zero in each
driver's color so "who's ahead right now" is readable at a glance. This chart
is the one number every other panel should agree with at the finish line
(`dt(lap_distance)` should roughly equal the actual lap time gap from
`session.laps`).

### 7: Corner gap table

For each row in `session.get_circuit_info().corners`, look up `dt(corner
distance)` from panel 6's data and the delta from the *previous* corner (i.e.
time gained/lost specifically in that corner-to-corner segment, not
cumulative). Render as a table, not a chart — corner number, delta at apex,
delta in this segment. This is the panel that answers "where exactly did they
gain it."

### 8: Sector comparison

`session.laps` already has `Sector1Time`, `Sector2Time`, `Sector3Time` per
lap — use those directly (don't recompute from telemetry) for the headline
sector deltas, since they're the official timing splits. Three-bar chart,
one bar per sector, height = time delta.

### 9: Speed-colored track map

Plot `X`/`Y` position (from the merged telemetry) as the track outline.
Color each point by whichever driver had the higher speed at that distance
(binary color, not a continuous scale) — this turns the speed overlay into
"where on the actual track" rather than "at what distance."

### 10: Braking-point map

Same track outline. Mark the point where each driver's `Brake` channel
transitions False→True (first sample of each braking zone) with a colored dot
per driver. Multiple dots per lap are expected — there's one per braking zone,
not just the main straight.

### 11: Gear-shift map

Track outline, small multiples (one mini-map per driver side by side), each
colored by `nGear` using a discrete color scale (gear is categorical, not
continuous — don't use a smooth colormap that implies gear 4.5 exists).

### 12: Speed trap comparison

`session.laps` includes `SpeedI1`, `SpeedI2`, `SpeedFL`, `SpeedST` (speed trap
readings at fixed track locations). Bar chart, one group per trap, one bar per
driver. Pull straight from `session.laps` for the selected lap — don't
recompute from telemetry, these are the official trap values.

### 13: Stint consistency

Line chart of lap time across every lap in the session for both drivers
(`session.laps.pick_driver(code)['LapTime']`), not just the one compared lap.
Gives context for whether the compared lap was representative or an outlier
(e.g. a driver's one great lap on fresh tyres vs. their race pace).

## Layout

`pages/1_Telemetry_Board.py` arranges panels in a scrollable grid using
`st.columns`/`st.tabs` — recommended grouping: **Overlays** (1–5) in one tab,
**Timing** (6–8) in another, **Track maps** (9–11) in another, **Context**
(12–13) in a fourth. Don't render all 13 as one long vertical stack; nobody
will scroll through that on first look.

## Data validation checklist (do this before calling a panel "done")

- Delta time at the end of the lap ≈ actual lap time gap (within ~0.1s,
  interpolation error is expected, more than that means the alignment logic
  has a bug).
- Corner gap deltas across all corners sum to (approximately) the final delta
  time — if they don't, the corner-lookup indexing is off by one.
- Speed-colored track map's "faster driver" color should flip near, not
  exactly at, the delta-time line's zero-crossings — a large mismatch means
  the two panels are reading from different distance grids.
