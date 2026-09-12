"""Replay Studio: Animated Track Playback & Race Replay Engine (Panel 14)."""
import time
import streamlit as st
import pandas as pd
from src.ui.sidebar import render_sidebar, format_timedelta
from src.data.telemetry import (
    get_lap_telemetry,
    align_telemetry,
)
from src.analytics.delta_time import compute_delta_time
from src.replay.engine import (
    build_replay_dataframe,
    create_replay_figure,
    build_stint_replay_dataframe,
    create_single_frame_figure,
)
from src.viz.panels import DRIVER_A_COLOR, DRIVER_B_COLOR

st.set_page_config(
    page_title="Replay Studio | F1 Comparator",
    page_icon="🎬",
    layout="wide",
)

st.markdown("""
<style>
.notice-box {
    background-color: #161A23;
    border-radius: 8px;
    padding: 12px 18px;
    border-left: 4px solid #E10600;
    margin-bottom: 1.2rem;
}
.metric-pill {
    background-color: #1A1E29;
    border-radius: 6px;
    padding: 10px 14px;
    border: 1px solid #2D3139;
    margin-bottom: 0.8rem;
}
</style>
""", unsafe_allow_html=True)

# Render interactive sidebar
session, driver_a, driver_b, lap_a, lap_b = render_sidebar()

if session is None or driver_a is None or driver_b is None:
    st.info("👈 Please select a Grand Prix, session, and two drivers from the sidebar to begin replay.")
    st.stop()

st.title("🎬 Replay Studio")

# Required non-goal disclaimer banner
st.markdown("""
<div class="notice-box">
    <b>ℹ️ Session Replay Mode:</b> This is an animated replay of a <b>completed, cached historical session</b>, not live timing.
    Cars are rendered over a synchronized time grid spanning from lap/stint start to completion.
</div>
""", unsafe_allow_html=True)

year_val = st.session_state.get("year", "")
gp_val = st.session_state.get("gp", "")
stype_val = st.session_state.get("session_type", "")
st.caption(f"Replaying **{driver_a}** vs **{driver_b}** — {year_val} {gp_val} ({stype_val})")

# Mode Switcher: Single Lap (Phase 5 Native) vs Full Stint (Phase 6 Manual Loop)
replay_mode = st.radio(
    "Replay Scope",
    options=["Single Lap (Plotly Native)", "Full Stint / Multi-Lap (Streamlit Live Loop)"],
    index=0,
    horizontal=True,
    help="Single Lap uses Plotly native animation frames. Full Stint uses a lightweight manual loop to support long race stints without payload overhead.",
)

circuit_info = session.get_circuit_info()
corners_df = circuit_info.corners if circuit_info is not None else None

# =========================================================================
# MODE 1: Single Lap Replay (Phase 5 - Native Plotly Animation Frames)
# =========================================================================
if replay_mode == "Single Lap (Plotly Native)":
    try:
        with st.spinner("Extracting telemetry and preparing time-grid replay..."):
            tel_a = get_lap_telemetry(lap_a)
            tel_b = get_lap_telemetry(lap_b)
            
            # Reuse distance-aligned delta_df from Phase 2
            df_a, df_b, dist_grid = align_telemetry(tel_a, tel_b)
            delta_df = compute_delta_time(df_a, df_b)

        col_ctrl1, col_ctrl2, col_ctrl3 = st.columns([2, 2, 4])
        with col_ctrl1:
            speed_multiplier = st.select_slider(
                "Playback Speed",
                options=[0.5, 1.0, 2.0, 4.0],
                value=1.0,
                format_func=lambda s: f"{s}x",
                help="Changes the animation frame duration without skipping frames.",
            )
        with col_ctrl2:
            time_step = st.selectbox(
                "Time Resolution",
                options=[0.1, 0.2],
                index=0,
                format_func=lambda s: f"{s}s steps ({'Higher fidelity' if s==0.1 else 'Faster load'})",
                help="Fixed step interval for the time-grid interpolation.",
            )
        with col_ctrl3:
            time_a_val = lap_a["LapTime"].total_seconds()
            time_b_val = lap_b["LapTime"].total_seconds()
            shorter_time = min(time_a_val, time_b_val)
            faster_driver = driver_a if time_a_val <= time_b_val else driver_b
            st.markdown(
                f"<div class='metric-pill'>"
                f"<b>Replay Duration:</b> {shorter_time:.2f} s (ends when <b>{faster_driver}</b> crosses the finish line)<br/>"
                f"<span style='color: {DRIVER_A_COLOR}; font-weight: bold;'>{driver_a}:</span> {format_timedelta(lap_a['LapTime'])} &nbsp;&nbsp;|&nbsp;&nbsp; "
                f"<span style='color: {DRIVER_B_COLOR}; font-weight: bold;'>{driver_b}:</span> {format_timedelta(lap_b['LapTime'])}"
                f"</div>",
                unsafe_allow_html=True,
            )

        with st.spinner("Building animation frames..."):
            replay_df = build_replay_dataframe(
                tel_a,
                tel_b,
                delta_df,
                driver_a=driver_a,
                driver_b=driver_b,
                time_step=time_step,
            )

            fig_replay = create_replay_figure(
                replay_df,
                track_outline_df=df_a,
                driver_a=driver_a,
                driver_b=driver_b,
                speed_multiplier=speed_multiplier,
                corners_df=corners_df,
            )

        st.plotly_chart(fig_replay, use_container_width=True)

        with st.expander("🔍 View Replay Time-Grid Samples (First & Last 10 Frames)"):
            sample_frames = pd.concat([replay_df.head(10), replay_df.tail(10)])
            st.dataframe(
                sample_frames[["Time", "speedA", "distA", "speedB", "distB", "DeltaTime"]],
                use_container_width=True,
                hide_index=True,
            )

    except Exception as e:
        st.error(f"Error initializing Single Lap Replay: {e}")
        st.exception(e)

# =========================================================================
# MODE 2: Full Stint / Multi-Lap Replay (Phase 6 - Manual Loop Pattern)
# =========================================================================
else:
    try:
        # Detect available stints from session.laps
        try:
            dlaps_a = session.laps.pick_drivers(driver_a)
            dlaps_b = session.laps.pick_drivers(driver_b)
        except AttributeError:
            dlaps_a = session.laps.pick_driver(driver_a)
            dlaps_b = session.laps.pick_driver(driver_b)

        stints_available = sorted(list(set(dlaps_a["Stint"].dropna().unique()).union(set(dlaps_b["Stint"].dropna().unique()))))
        if not stints_available:
            stints_available = [1]

        col_stint1, col_stint2, col_stint3 = st.columns([2, 2, 3])
        with col_stint1:
            stint_choice = st.selectbox(
                "Select Stint",
                options=stints_available,
                index=0,
                format_func=lambda s: f"Stint {int(s)}",
            )
        with col_stint2:
            stint_speed = st.selectbox(
                "Playback Speed",
                options=[1, 2, 5, 10, 20],
                index=2,
                format_func=lambda x: f"{x}x Realtime",
                help="Speed of the manual rendering loop.",
            )
        with col_stint3:
            stint_step = st.selectbox(
                "Sample Step",
                options=[0.5, 1.0, 2.0],
                index=0,
                format_func=lambda s: f"{s}s per frame",
            )

        # Build Stint Replay DataFrame
        with st.spinner(f"Preparing Stint {int(stint_choice)} multi-lap telemetry..."):
            stint_df, track_outline = build_stint_replay_dataframe(
                session=session,
                driver_a=driver_a,
                driver_b=driver_b,
                stint_number=stint_choice,
                time_step=stint_step,
            )

        total_frames = len(stint_df)
        total_duration = stint_df["Time"].iloc[-1]

        # Initialize session state for manual playback
        if "stint_frame_idx" not in st.session_state:
            st.session_state.stint_frame_idx = 0
        if "stint_is_playing" not in st.session_state:
            st.session_state.stint_is_playing = False

        # Ensure index within bounds
        st.session_state.stint_frame_idx = min(st.session_state.stint_frame_idx, total_frames - 1)

        # Playback control buttons
        btn_col1, btn_col2, btn_col3, slider_col = st.columns([1, 1, 1, 5])
        with btn_col1:
            if st.button("▶ Play", key="btn_play_stint", use_container_width=True):
                st.session_state.stint_is_playing = True
        with btn_col2:
            if st.button("⏸ Pause", key="btn_pause_stint", use_container_width=True):
                st.session_state.stint_is_playing = False
        with btn_col3:
            if st.button("⏮ Reset", key="btn_reset_stint", use_container_width=True):
                st.session_state.stint_frame_idx = 0
                st.session_state.stint_is_playing = False

        with slider_col:
            scrub_idx = st.slider(
                "Scrub Stint Position",
                min_value=0,
                max_value=total_frames - 1,
                value=st.session_state.stint_frame_idx,
                format=f"%d / {total_frames}",
                key="stint_scrubber",
            )
            # If user manipulated the slider, sync session state
            if scrub_idx != st.session_state.stint_frame_idx and not st.session_state.stint_is_playing:
                st.session_state.stint_frame_idx = scrub_idx

        # Frame display placeholder
        plot_placeholder = st.empty()

        # Render loop if playing
        if st.session_state.stint_is_playing:
            sleep_time = max(0.01, (stint_step / stint_speed))
            start_idx = st.session_state.stint_frame_idx

            for idx in range(start_idx, total_frames):
                st.session_state.stint_frame_idx = idx
                row = stint_df.iloc[idx]

                fig_frame = create_single_frame_figure(
                    track_outline_df=track_outline,
                    xA=row["xA"],
                    yA=row["yA"],
                    xB=row["xB"],
                    yB=row["yB"],
                    speedA=row["speedA"],
                    speedB=row["speedB"],
                    driver_a=driver_a,
                    driver_b=driver_b,
                    current_time=row["Time"],
                    delta_time=row["DeltaTime"],
                    stint_lap_info=f"Stint {int(stint_choice)} ({total_duration/60:.1f} min)",
                    corners_df=corners_df,
                )
                plot_placeholder.plotly_chart(fig_frame, use_container_width=True)
                time.sleep(sleep_time)

            st.session_state.stint_is_playing = False
        else:
            # Render the currently selected static frame
            curr_row = stint_df.iloc[st.session_state.stint_frame_idx]
            fig_frame = create_single_frame_figure(
                track_outline_df=track_outline,
                xA=curr_row["xA"],
                yA=curr_row["yA"],
                xB=curr_row["xB"],
                yB=curr_row["yB"],
                speedA=curr_row["speedA"],
                speedB=curr_row["speedB"],
                driver_a=driver_a,
                driver_b=driver_b,
                current_time=curr_row["Time"],
                delta_time=curr_row["DeltaTime"],
                stint_lap_info=f"Stint {int(stint_choice)} ({total_duration/60:.1f} min)",
                corners_df=corners_df,
            )
            plot_placeholder.plotly_chart(fig_frame, use_container_width=True)

        with st.expander("📊 View Stint Telemetry Data Samples"):
            st.dataframe(
                stint_df[["Time", "speedA", "distA", "speedB", "distB", "DeltaTime"]].head(20),
                use_container_width=True,
                hide_index=True,
            )

    except Exception as e:
        st.error(f"Error loading Stint Replay: {e}")
        st.exception(e)
