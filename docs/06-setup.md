# 06 — Setup & Environment

## Requirements

- Python 3.9–3.11 (FastF1 supports these reliably; avoid 3.12+ until you've
  confirmed FastF1's current release supports it, since telemetry-heavy
  scientific-Python stacks tend to lag new Python releases).
- No API key needed for FastF1 — it hits F1's public timing feed and Jolpica
  (Ergast-compatible) endpoints directly.
- No database, no `.env` secrets required for the core app.

## `requirements.txt`

```
fastf1>=3.3
streamlit>=1.35
plotly>=5.20
pandas>=2.0
numpy>=1.26
```

Pin exact versions once the build stabilizes; ranges above are a starting
point.

## First-time setup

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
mkdir -p cache                    # FastF1 disk cache directory
streamlit run app.py
```

## `.gitignore` additions

```
cache/
.venv/
__pycache__/
```

## What to expect on first run

- The very first time you load a given session (year/GP/session-type
  combination), FastF1 downloads real telemetry — this can take anywhere from
  a few seconds to ~a minute depending on session length. Every load after
  that for the same session is served from `cache/` and is near-instant.
- There is no rate limit to configure manually — FastF1's caching is what
  keeps this well-behaved. Don't add custom retry/backoff logic unless you
  actually observe failures; it's not needed for normal usage patterns.

## Environment variables

None required for the core app. If a later phase adds deployment-specific
config (e.g. a fixed cache path on a hosting platform), document the variable
name and purpose here — never its value.

## Running checks before considering a phase "done"

There's no formal test suite planned for phase 0–4 (see roadmap) — validation
is the manual checklist at the end of `03-panels-spec.md` and
`04-replay-engine.md`, run against at least two different real sessions
(e.g. a qualifying lap and a race lap) so you're not just validating against
one dataset's quirks.
