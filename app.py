"""Driver Telemetry Comparator - Main Application Entrypoint."""
import streamlit as st
from src.ui.sidebar import render_sidebar, format_timedelta
from src.viz.panels import DRIVER_A_COLOR, DRIVER_B_COLOR

st.set_page_config(
    page_title="F1 Driver Telemetry Comparator",
    page_icon="🏎️",
    layout="wide",
)

st.markdown("""
<style>
.hero-box {
    background: linear-gradient(135deg, #161A23 0%, #1E232F 100%);
    border-radius: 12px;
    padding: 24px 32px;
    border: 1px solid #2D3139;
    margin-bottom: 2rem;
}
.hero-title {
    font-size: 2.2rem;
    font-weight: 800;
    color: #FAFAFA;
    margin-bottom: 0.5rem;
}
.hero-sub {
    font-size: 1.1rem;
    color: #94A3B8;
    margin-bottom: 0;
}
.driver-card {
    background-color: #161A23;
    border-radius: 10px;
    padding: 20px;
    border-left: 5px solid #E10600;
    margin-top: 1rem;
}
</style>
""", unsafe_allow_html=True)

# Render interactive sidebar
session, driver_a, driver_b, lap_a, lap_b = render_sidebar()

st.markdown("""
<div class="hero-box">
    <div class="hero-title">🏎️ F1 Driver Telemetry Comparator</div>
    <div class="hero-sub">
        Professional two-driver corner-by-corner telemetry analysis and animated replay engine powered by FastF1 and Plotly.
    </div>
</div>
""", unsafe_allow_html=True)

if session is not None and driver_a and driver_b:
    year = st.session_state.get("year", 2023)
    gp = st.session_state.get("gp", "Bahrain")
    stype = st.session_state.get("session_type", "R")

    st.subheader(f"Current Comparison: {year} {gp} ({stype})")

    time_a_str = format_timedelta(lap_a["LapTime"]) if lap_a is not None else "N/A"
    time_b_str = format_timedelta(lap_b["LapTime"]) if lap_b is not None else "N/A"

    c1, c2 = st.columns(2)
    with c1:
        st.markdown(
            f"<div class='driver-card' style='border-left-color: {DRIVER_A_COLOR};'>"
            f"<h3 style='color: {DRIVER_A_COLOR}; margin: 0;'>{driver_a}</h3>"
            f"<p style='color: #94A3B8; margin-top: 4px;'>Selected: Lap {int(lap_a['LapNumber']) if lap_a is not None else 'N/A'}</p>"
            f"<h2 style='color: #FFFFFF; margin: 0;'>{time_a_str}</h2>"
            f"</div>",
            unsafe_allow_html=True,
        )

    with c2:
        st.markdown(
            f"<div class='driver-card' style='border-left-color: {DRIVER_B_COLOR};'>"
            f"<h3 style='color: {DRIVER_B_COLOR}; margin: 0;'>{driver_b}</h3>"
            f"<p style='color: #94A3B8; margin-top: 4px;'>Selected: Lap {int(lap_b['LapNumber']) if lap_b is not None else 'N/A'}</p>"
            f"<h2 style='color: #FFFFFF; margin: 0;'>{time_b_str}</h2>"
            f"</div>",
            unsafe_allow_html=True,
        )

    st.markdown("<br/>", unsafe_allow_html=True)
    st.info("💡 Open the left sidebar page navigation and select **Telemetry Board** to explore all 13 comparison panels, or **Replay Studio** for animated playback.")
else:
    st.info("👈 Please select a session and two drivers in the sidebar.")
