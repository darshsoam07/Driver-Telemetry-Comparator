# 02 — Data Source: FastF1

## What FastF1 gives you

FastF1 wraps the official F1 timing feed (plus Ergast/Jolpica for results
history). Relevant objects for this project:

- `fastf1.get_session(year, gp, session_type)` → a `Session` object.
  `session_type` is one of `'FP1'`, `'FP2'`, `'FP3'`, `'Q'`, `'SQ'`
  (sprint qualifying), `'R'`, `'SR'` (sprint race).
- `session.load()` → populates `session.laps` (a DataFrame of every lap by
  every driver: lap time, sector times, compound, stint, speed-trap speeds)
  and enables per-lap telemetry access.
- `session.laps.pick_driver('VER')` → laps for one driver (use the three-letter
  driver code).
- `lap.get_car_data()` → `Speed`, `Throttle`, `Brake`, `nGear`, `RPM`, `DRS`
  channels, timestamped.
- `lap.get_pos_data()` → `X`, `Y`, `Z` position on track, timestamped.
- `lap.get_telemetry()` → car data and position data already merged and
  interpolated onto one timeline. **Use this**, not the two separate calls,
  for anything that needs both channels (e.g. speed-colored track maps).
- `telemetry.add_distance()` → adds a `Distance` column (metres travelled
  since the start/finish line) computed from speed and position data.
- `session.get_circuit_info().corners` → DataFrame of corner number, distance
  around the lap, and X/Y location — this is what turns raw traces into
  "corner-by-corner" analysis.

## Data channel notes (things that trip people up)

- **`Brake`** is boolean in most seasons' data (on/off), not a pressure
  percentage. Don't build a panel that implies graduated brake pressure unless
  you've checked the specific season/car has it — treat it as an on/off band
  in the overlay.
- **`DRS`** is an integer code, not a boolean. Roughly: values `10`, `12`, `14`
  mean DRS open; `0`/`1`/`8` mean closed/unavailable. Define a small helper
  (`is_drs_open(value) -> bool`) once in `src/data/telemetry.py` and use it
  everywhere — don't inline the magic numbers in chart code.
- **`nGear`** is an integer 0–8 (0 = neutral/no reading). Render as a step
  chart, not a smooth line — gear is discrete.
- Full telemetry (car + position data) is reliably available from **2018
  onward**. Don't let the session picker offer earlier years for anything
  telemetry-based; results/lap-time data goes back further via Jolpica, but
  that's a different feature this project doesn't build.
- First load of any session hits the network and can take real time
  (tens of seconds); this is normal, not a bug — surface a
  `st.spinner("Loading session data…")` rather than letting it look frozen.

## The core design decision: aligning two drivers' laps

**This is the interview question the source brief calls out, so get the
answer right and be able to explain it:**

Two drivers never complete a lap in the same amount of time, so you cannot
align their telemetry by timestamp or by sample index — driver B's telemetry
at "12.4 seconds into the lap" is not at the same physical point on track as
driver A's. The fix:

1. Call `add_distance()` on both drivers' telemetry so each row has metres
   traveled since the start/finish line, independent of how fast they were
   going.
2. Build a common distance grid: `np.linspace(0, min(lapA_max_distance,
   lapB_max_distance), N)` (use the shorter of the two so you never
   extrapolate past a lap's end).
3. Interpolate each channel (`Speed`, `Throttle`, `nGear`, etc.) from each
   driver's own `(Distance, value)` samples onto that shared grid with
   `numpy.interp`.
4. Now every panel — speed overlay, delta time, corner gap table — reads off
   the same distance grid, so "at this point on track" means the same thing
   for both drivers.

Edge cases to handle explicitly, not silently:

- **In/out laps and laps under yellow/safety car**: these have anomalous
  speed profiles. Default the lap picker to each driver's fastest *green-flag*
  lap (`laps.pick_fastest()` after filtering `TrackStatus == '1'`), and let
  the user override if they want to compare a specific lap.
- **Pit-in/pit-out laps**: exclude by default (`pick_wo_box()` in newer FastF1
  versions, or filter on `PitOutTime`/`PitInTime` being null) since a pit
  lane traverse dwarfs any on-track time difference and would dominate every
  chart.
- **Different lap lengths from red flags/track limits deletions**: handled
  automatically by step 2 above (grid stops at the shorter lap's max
  distance) — just don't silently pad the shorter one with the last known
  value, which would fabricate data.

## Delta time calculation

Delta time at distance *d* is **not** just "speed difference" — it's the
running integral of the time each driver would take to cover the same small
distance step at their respective speeds:

```
dt(d) = cumulative_time_B(d) - cumulative_time_A(d)
```

Compute `cumulative_time` per driver from their own `(Distance, Time)` samples
on the shared distance grid (not by integrating speed, which compounds
interpolation error — use the telemetry's own `Time`/`SessionTime` column,
converted to seconds-from-lap-start, interpolated onto the distance grid the
same way as the other channels). This is what the "gains/loses time" panel
and the corner-gap table both read from.

## Caching setup

```python
import fastf1
fastf1.Cache.enable_cache('cache/')  # call once, at app startup
```

`cache/` should be gitignored — it fills with real session data and isn't
something to commit.
