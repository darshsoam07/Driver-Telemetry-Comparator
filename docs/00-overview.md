# 00 — Project Overview

## What this is

A Streamlit web app that lets a user pick any two F1 drivers from any session
(2018–present) and see, corner by corner, exactly where one driver gained or
lost time over the other — using real telemetry pulled from the official F1
timing feed via the [FastF1](https://docs.fastf1.dev) Python library.

It ships two screens:

1. **Telemetry Board** — a 13-panel static analytics board comparing two
   drivers' laps (speed, throttle, brake, gear, DRS, delta time, corner gaps,
   sector times, track-map overlays, speed traps, stint consistency).
2. **Replay Studio** — an animated, scrubbable replay of the two cars' track
   position over the course of the lap/session (the 14th panel).

## Who it's for

A single-user analytics tool (portfolio project), not a multi-tenant SaaS
product. No accounts, no auth, no database — a session picker, two driver
pickers, and the board.

## In scope

- Historical session data only: Practice, Qualifying, Sprint, Race sessions
  from 2018 onward (FastF1's full-telemetry coverage window).
- Any two drivers in the same session, compared on a chosen lap (default:
  each driver's fastest lap) or across a full stint.
- All computation and rendering runs locally against FastF1's on-disk cache —
  no backend server, no external database.

## Explicitly out of scope (do not build these)

- **True real-time live timing.** FastF1 can only capture live timing while a
  session is *currently* running (`fastf1.livetiming`), which isn't practical
  for a portfolio app people open on demand. "Replay" here means replaying a
  **completed, cached session** — clearly label it that way in the UI, don't
  call it "live."
- **Comparing drivers across different sessions/circuits.** Track geometry and
  distance references differ per circuit; cross-session comparison is a
  different (harder) feature, not part of this build.
- **User accounts, saved comparisons, sharing links.** No persistence layer.
- **Mobile app / Flutter port.** This is a Streamlit web app only.

## Success criteria

- Given two driver codes + a session, the app loads real telemetry (not
  synthetic data) and renders all 13 panels without manual data wrangling by
  the user.
- The delta-time and corner-gap numbers are internally consistent with the
  official lap time difference between the two drivers (sanity-checkable
  against `session.laps`).
- Replay Studio plays back the two cars' relative track position for at least
  one full lap without desyncing.
- The app runs from a fresh clone with only `pip install -r requirements.txt`
  and `streamlit run app.py`.

## Primary reference

- FastF1 docs: https://docs.fastf1.dev
- Original project brief: "Driver Telemetry Comparator" / "F1 Vision" entry in
  the F1 Data Science portfolio project guide (Project 03).
