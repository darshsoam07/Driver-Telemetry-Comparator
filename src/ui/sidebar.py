"""Shared sidebar picker: Year -> Grand Prix -> Session -> Driver A/B -> Lap A/B."""
import streamlit as st
import fastf1
import pandas as pd
from src.data.fastf1_client import get_session
from src.data.telemetry import get_driver_fastest_lap

SESSION_TYPE_MAP = {
    "R": "Race (R)",
    "Q": "Qualifying (Q)",
    "FP1": "Practice 1 (FP1)",
    "FP2": "Practice 2 (FP2)",
    "FP3": "Practice 3 (FP3)",
    "SQ": "Sprint Shootout (SQ)",
    "SR": "Sprint Race (SR)",
}

SESSION_CODE_ORDER = ["R", "Q", "FP1", "FP2", "FP3", "SQ", "SR"]

@st.cache_data(show_spinner=False)
def get_year_events(year: int):
    """Fetch official event names for the selected year."""
    try:
        schedule = fastf1.get_event_schedule(year)
        # Exclude pre-season testing sessions
        valid_events = schedule[schedule["EventFormat"] != "testing"]
        return valid_events["EventName"].dropna().tolist()
    except Exception as e:
        st.warning(f"Could not load event schedule for {year}: {e}")
        return ["Bahrain Grand Prix", "Saudi Arabian Grand Prix", "Monaco Grand Prix", "British Grand Prix", "Italian Grand Prix"]

@st.cache_resource(show_spinner=False)
def load_session(year: int, gp: str, session_type: str):
    """Load FastF1 session with cached resource decorator."""
    session = get_session(year, gp, session_type)
    session.load(telemetry=True, laps=True, weather=False)
    return session

def format_timedelta(td):
    if pd.isna(td) or td is None:
        return "N/A"
    total_sec = td.total_seconds()
    minutes = int(total_sec // 60)
    seconds = total_sec % 60
    return f"{minutes}:{seconds:06.3f}"

def render_sidebar():
    """
    Renders the interactive sidebar and synchronizes state in st.session_state.
    Returns (session, driver_a, driver_b, lap_a_obj, lap_b_obj) or None if loading/error.
    """
    st.sidebar.markdown("### 🏁 Session Selector")

    # 1. Year Selection
    current_year = 2023
    available_years = list(range(2024, 2017, -1))
    
    saved_year = st.session_state.get("year", current_year)
    year_index = available_years.index(saved_year) if saved_year in available_years else available_years.index(2023)
    year = st.sidebar.selectbox("Year", options=available_years, index=year_index)
    st.session_state["year"] = year

    # 2. Grand Prix Selection
    events = get_year_events(year)
    if not events:
        events = ["Bahrain Grand Prix"]
    saved_gp = st.session_state.get("gp", events[0])
    gp_index = events.index(saved_gp) if saved_gp in events else 0
    gp = st.sidebar.selectbox("Grand Prix", options=events, index=gp_index)
    st.session_state["gp"] = gp

    # 3. Session Type Selection
    session_options = SESSION_CODE_ORDER
    saved_stype = st.session_state.get("session_type", "R")
    stype_index = session_options.index(saved_stype) if saved_stype in session_options else 0
    session_type = st.sidebar.selectbox(
        "Session",
        options=session_options,
        index=stype_index,
        format_func=lambda code: SESSION_TYPE_MAP.get(code, code),
    )
    st.session_state["session_type"] = session_type

    # 4. Load Session Data
    with st.spinner(f"Loading {year} {gp} ({session_type})..."):
        try:
            session = load_session(year, gp, session_type)
        except Exception as e:
            st.sidebar.error(f"Error loading session: {e}")
            return None, None, None, None, None

    # 5. Driver Selection
    try:
        raw_drivers = session.laps["Driver"].dropna().unique().tolist()
        drivers = sorted([str(d) for d in raw_drivers])
    except Exception:
        drivers = []

    if not drivers:
        st.sidebar.error("No driver telemetry found for this session.")
        return session, None, None, None, None

    st.sidebar.markdown("---")
    st.sidebar.markdown("### 🏎️ Driver Comparison")

    # Driver A
    default_a_idx = drivers.index("VER") if "VER" in drivers else 0
    saved_a = st.session_state.get("driver_a", drivers[default_a_idx])
    driver_a_idx = drivers.index(saved_a) if saved_a in drivers else default_a_idx
    driver_a = st.sidebar.selectbox("Driver A", options=drivers, index=driver_a_idx, key="sidebar_driver_a")
    st.session_state["driver_a"] = driver_a

    # Driver B (distinct default)
    remaining_drivers = [d for d in drivers if d != driver_a] or drivers
    preferred_b = ["ALO", "HAM", "LEC", "NOR", "PER", "SAI"]
    default_b_cand = next((d for d in preferred_b if d in remaining_drivers), remaining_drivers[0])
    saved_b = st.session_state.get("driver_b", default_b_cand)
    driver_b_idx = remaining_drivers.index(saved_b) if saved_b in remaining_drivers else 0
    driver_b = st.sidebar.selectbox("Driver B", options=remaining_drivers, index=driver_b_idx, key="sidebar_driver_b")
    st.session_state["driver_b"] = driver_b

    # 6. Lap Selection
    def _get_driver_laps(driver_code):
        try:
            dlaps = session.laps.pick_drivers(driver_code)
        except AttributeError:
            dlaps = session.laps.pick_driver(driver_code)
        return dlaps[dlaps["LapTime"].notna()].sort_values("LapNumber")

    laps_a_df = _get_driver_laps(driver_a)
    laps_b_df = _get_driver_laps(driver_b)

    # Lap A Dropdown
    lap_a_options = ["Fastest Clean Lap"] + [
        f"Lap {int(r['LapNumber'])} ({format_timedelta(r['LapTime'])})"
        for _, r in laps_a_df.iterrows()
    ]
    saved_lap_a = st.session_state.get("lap_a", lap_a_options[0])
    lap_a_idx = lap_a_options.index(saved_lap_a) if saved_lap_a in lap_a_options else 0
    selected_lap_a_label = st.sidebar.selectbox(f"{driver_a} Lap", options=lap_a_options, index=lap_a_idx)
    st.session_state["lap_a"] = selected_lap_a_label

    # Lap B Dropdown
    lap_b_options = ["Fastest Clean Lap"] + [
        f"Lap {int(r['LapNumber'])} ({format_timedelta(r['LapTime'])})"
        for _, r in laps_b_df.iterrows()
    ]
    saved_lap_b = st.session_state.get("lap_b", lap_b_options[0])
    lap_b_idx = lap_b_options.index(saved_lap_b) if saved_lap_b in lap_b_options else 0
    selected_lap_b_label = st.sidebar.selectbox(f"{driver_b} Lap", options=lap_b_options, index=lap_b_idx)
    st.session_state["lap_b"] = selected_lap_b_label

    # Resolve Lap A Object
    if selected_lap_a_label == "Fastest Clean Lap":
        lap_a_obj = get_driver_fastest_lap(session, driver_a)
    else:
        lap_num_a = int(selected_lap_a_label.split()[1])
        lap_a_obj = laps_a_df[laps_a_df["LapNumber"] == lap_num_a].iloc[0]

    # Resolve Lap B Object
    if selected_lap_b_label == "Fastest Clean Lap":
        lap_b_obj = get_driver_fastest_lap(session, driver_b)
    else:
        lap_num_b = int(selected_lap_b_label.split()[1])
        lap_b_obj = laps_b_df[laps_b_df["LapNumber"] == lap_num_b].iloc[0]

    return session, driver_a, driver_b, lap_a_obj, lap_b_obj
