"""Telemetry Board: 13-Panel Analytics Dashboard."""
import streamlit as st
import pandas as pd
from src.ui.sidebar import render_sidebar, format_timedelta
from src.data.telemetry import (
    get_lap_telemetry,
    align_telemetry,
)
from src.analytics.delta_time import compute_delta_time
from src.analytics.corners import compute_corner_gaps
from src.analytics.sectors import compute_sector_deltas
from src.viz.panels import (
    DRIVER_A_COLOR,
    DRIVER_B_COLOR,
    plot_speed_overlay,
    plot_throttle_overlay,
    plot_brake_overlay,
    plot_gear_overlay,
    plot_drs_overlay,
    plot_delta_time,
    plot_sector_comparison,
    plot_speed_traps,
    plot_stint_consistency,
)
from src.viz.track_map import (
    plot_speed_track_map,
    plot_braking_point_map,
    plot_gear_shift_map,
)

st.set_page_config(page_title="Telemetry Board | F1 Comparator", page_icon="🏎️", layout="wide")

st.markdown("""
<style>
.metric-card {
    background-color: #161A23;
    border-radius: 8px;
    padding: 14px 18px;
    border-left: 4px solid #E10600;
    margin-bottom: 1rem;
}
</style>
""", unsafe_allow_html=True)

# Render interactive sidebar picker
session, driver_a, driver_b, lap_a, lap_b = render_sidebar()

if session is None or driver_a is None or driver_b is None:
    st.info("👈 Please select a Grand Prix, session, and two drivers from the sidebar to begin.")
    st.stop()

st.title("📊 Telemetry Board")
year_val = st.session_state.get("year", "")
gp_val = st.session_state.get("gp", "")
stype_val = st.session_state.get("session_type", "")
st.caption(f"Comparing **{driver_a}** vs **{driver_b}** — {year_val} {gp_val} ({stype_val})")

try:
    with st.spinner("Extracting and aligning lap telemetry..."):
        tel_a = get_lap_telemetry(lap_a)
        tel_b = get_lap_telemetry(lap_b)
        df_a, df_b, dist_grid = align_telemetry(tel_a, tel_b)

    # Lap Times & Gap Summary
    time_a_str = format_timedelta(lap_a["LapTime"])
    time_b_str = format_timedelta(lap_b["LapTime"])
    
    time_diff = None
    if pd.notna(lap_a["LapTime"]) and pd.notna(lap_b["LapTime"]):
        time_diff = (lap_b["LapTime"] - lap_a["LapTime"]).total_seconds()
        diff_str = f"{'+' if time_diff > 0 else ''}{time_diff:.3f} s"
    else:
        diff_str = "N/A"

    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(
            f"<div class='metric-card' style='border-left-color: {DRIVER_A_COLOR};'>"
            f"<span style='color: {DRIVER_A_COLOR}; font-weight: bold;'>{driver_a} (Lap {int(lap_a['LapNumber'])})</span><br/>"
            f"<span style='font-size: 1.6rem; font-weight: bold;'>{time_a_str}</span>"
            f"</div>",
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            f"<div class='metric-card' style='border-left-color: {DRIVER_B_COLOR};'>"
            f"<span style='color: {DRIVER_B_COLOR}; font-weight: bold;'>{driver_b} (Lap {int(lap_b['LapNumber'])})</span><br/>"
            f"<span style='font-size: 1.6rem; font-weight: bold;'>{time_b_str}</span>"
            f"</div>",
            unsafe_allow_html=True,
        )
    with col3:
        st.markdown(
            f"<div class='metric-card'>"
            f"<span style='color: #94A3B8; font-weight: bold;'>Lap Gap ({driver_b} vs {driver_a})</span><br/>"
            f"<span style='font-size: 1.6rem; font-weight: bold;'>{diff_str}</span>"
            f"</div>",
            unsafe_allow_html=True,
        )

    # The 4 Analytics Tabs (13 Panels Total)
    tab_overlays, tab_timing, tab_maps, tab_context = st.tabs([
        "Telemetry Overlays (1–5)",
        "Timing & Corner Gaps (6–8)",
        "Track Maps (9–11)",
        "Session Context (12–13)",
    ])

    with tab_overlays:
        st.subheader("Channel Overlays")
        # Panel 1: Speed Overlay
        fig_speed = plot_speed_overlay(df_a, df_b, driver_a=driver_a, driver_b=driver_b)
        st.plotly_chart(fig_speed, use_container_width=True)

        # Panel 2: Throttle Overlay
        fig_throttle = plot_throttle_overlay(df_a, df_b, driver_a=driver_a, driver_b=driver_b)
        st.plotly_chart(fig_throttle, use_container_width=True)

        # Panel 3: Brake Overlay
        fig_brake = plot_brake_overlay(df_a, df_b, driver_a=driver_a, driver_b=driver_b)
        st.plotly_chart(fig_brake, use_container_width=True)

        # Panel 4: Gear Overlay
        fig_gear = plot_gear_overlay(df_a, df_b, driver_a=driver_a, driver_b=driver_b)
        st.plotly_chart(fig_gear, use_container_width=True)

        # Panel 5: DRS Overlay
        fig_drs = plot_drs_overlay(df_a, df_b, driver_a=driver_a, driver_b=driver_b)
        st.plotly_chart(fig_drs, use_container_width=True)

    with tab_timing:
        st.subheader("Delta Time & Split Analysis")

        delta_df = compute_delta_time(df_a, df_b)
        circuit_info = session.get_circuit_info()
        corners_df = circuit_info.corners if circuit_info is not None else None
        corner_gaps_df = compute_corner_gaps(delta_df, corners_df, driver_a=driver_a, driver_b=driver_b)
        sector_df = compute_sector_deltas(lap_a, lap_b, driver_a=driver_a, driver_b=driver_b)

        # Panel 6: Delta Time
        fig_delta = plot_delta_time(delta_df, driver_a=driver_a, driver_b=driver_b)
        st.plotly_chart(fig_delta, use_container_width=True)

        # Panel 8: Sector Comparison
        col_sec_chart, col_sec_table = st.columns([3, 2])
        with col_sec_chart:
            fig_sector = plot_sector_comparison(sector_df, driver_a=driver_a, driver_b=driver_b)
            st.plotly_chart(fig_sector, use_container_width=True)
        with col_sec_table:
            st.markdown("##### Sector Split Times")
            st.dataframe(sector_df, use_container_width=True, hide_index=True)

        # Panel 7: Corner Gap Table
        st.markdown("##### Panel 7: Corner-by-Corner Gap Analysis")
        st.caption("Delta at apex indicates cumulative gap at that corner; Segment Delta indicates time gained/lost since previous corner.")
        st.dataframe(corner_gaps_df, use_container_width=True, hide_index=True)

    with tab_maps:
        st.subheader("Spatial Track Map Overlays")

        circuit_info = session.get_circuit_info()
        corners_df = circuit_info.corners if circuit_info is not None else None

        # Panel 9: Speed Dominance Map
        st.markdown("##### Panel 9: Speed Dominance Track Map")
        st.caption("Track outline colored by which driver carried higher speed at each point.")
        fig_map_speed = plot_speed_track_map(df_a, df_b, driver_a=driver_a, driver_b=driver_b, corners_df=corners_df)
        st.plotly_chart(fig_map_speed, use_container_width=True)

        # Panel 10: Braking Point Map
        st.markdown("##### Panel 10: Braking Point Comparison")
        st.caption("Initial braking onset markers (False → True transition) into heavy braking zones.")
        fig_map_brake = plot_braking_point_map(df_a, df_b, driver_a=driver_a, driver_b=driver_b, corners_df=corners_df)
        st.plotly_chart(fig_map_brake, use_container_width=True)

        # Panel 11: Gear Shift Map
        st.markdown("##### Panel 11: Gear Selection Small Multiples")
        st.caption("Discrete gear selection mapped across the circuit for each driver.")
        fig_map_gear = plot_gear_shift_map(df_a, df_b, driver_a=driver_a, driver_b=driver_b, corners_df=corners_df)
        st.plotly_chart(fig_map_gear, use_container_width=True)

    with tab_context:
        st.subheader("Session Context & Speed Traps")

        # Panel 12: Speed Trap Comparison
        st.markdown("##### Panel 12: Official Speed Trap Comparison")
        fig_traps = plot_speed_traps(lap_a, lap_b, driver_a=driver_a, driver_b=driver_b)
        st.plotly_chart(fig_traps, use_container_width=True)

        # Panel 13: Stint Consistency
        st.markdown("##### Panel 13: Full Session Stint Consistency")
        st.caption(f"Lap time progression across all laps completed in this session by {driver_a} and {driver_b}.")
        fig_stint = plot_stint_consistency(
            session.laps,
            driver_a=driver_a,
            driver_b=driver_b,
            selected_lap_a=float(lap_a["LapNumber"]),
            selected_lap_b=float(lap_b["LapNumber"]),
        )
        st.plotly_chart(fig_stint, use_container_width=True)

except Exception as e:
    st.error(f"Error loading comparison: {e}")
    st.exception(e)
