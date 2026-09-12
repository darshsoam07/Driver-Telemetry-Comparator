"""Replay engine for time-grid interpolation and Plotly animated track playback (Panel 14)."""
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from src.viz.panels import DRIVER_A_COLOR, DRIVER_B_COLOR
from src.viz.track_map import add_corner_annotations

def build_replay_dataframe(
    tel_a: pd.DataFrame,
    tel_b: pd.DataFrame,
    delta_df: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
    time_step: float = 0.1,
) -> pd.DataFrame:
    """
    Interpolate each driver's telemetry onto a uniform time-grid:
    spanning [0, min(driver_a_time, driver_b_time)] in steps of time_step (e.g. 0.1s).
    
    Reuses delta_df to map exact delta time at each time point.
    """
    time_a_max = tel_a["TimeInSeconds"].max()
    time_b_max = tel_b["TimeInSeconds"].max()
    max_time = min(time_a_max, time_b_max)

    # Fixed-step time grid capped at the shorter driver's lap time
    time_grid = np.arange(0, max_time + (time_step / 2.0), time_step)
    time_grid = time_grid[time_grid <= max_time]

    # Clean and sort telemetry for interpolation
    def _prep_clean_timeseries(df):
        clean = df.dropna(subset=["TimeInSeconds", "X", "Y", "Distance"]).copy()
        clean = clean.sort_values("TimeInSeconds").drop_duplicates(subset=["TimeInSeconds"])
        return clean

    clean_a = _prep_clean_timeseries(tel_a)
    clean_b = _prep_clean_timeseries(tel_b)

    t_a = clean_a["TimeInSeconds"].to_numpy()
    t_b = clean_b["TimeInSeconds"].to_numpy()

    # Apply identical distance scaling as align_telemetry so circuit position & delta_df align 100%
    max_dist = min(clean_a["Distance"].max(), clean_b["Distance"].max())
    scale_a = max_dist / clean_a["Distance"].max() if clean_a["Distance"].max() > 0 else 1.0
    scale_b = max_dist / clean_b["Distance"].max() if clean_b["Distance"].max() > 0 else 1.0

    d_a = clean_a["Distance"].to_numpy() * scale_a
    d_b = clean_b["Distance"].to_numpy() * scale_b

    xA = np.interp(time_grid, t_a, clean_a["X"].to_numpy())
    yA = np.interp(time_grid, t_a, clean_a["Y"].to_numpy())
    distA = np.interp(time_grid, t_a, d_a)
    speedA = np.interp(time_grid, t_a, clean_a["Speed"].to_numpy())

    xB = np.interp(time_grid, t_b, clean_b["X"].to_numpy())
    yB = np.interp(time_grid, t_b, clean_b["Y"].to_numpy())
    distB = np.interp(time_grid, t_b, d_b)
    speedB = np.interp(time_grid, t_b, clean_b["Speed"].to_numpy())

    # Map delta time from Phase 2's delta_df by reference distance
    delta_ref_dist = delta_df["Distance"].to_numpy()
    delta_vals = delta_df["DeltaTime"].to_numpy()
    live_delta = np.interp(distA, delta_ref_dist, delta_vals)


    return pd.DataFrame({
        "Time": np.round(time_grid, 2),
        "xA": xA,
        "yA": yA,
        "speedA": speedA,
        "distA": distA,
        "xB": xB,
        "yB": yB,
        "speedB": speedB,
        "distB": distB,
        "DeltaTime": live_delta,
    })


def create_replay_figure(
    replay_df: pd.DataFrame,
    track_outline_df: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
    speed_multiplier: float = 1.0,
    corners_df: pd.DataFrame = None,
) -> go.Figure:
    """
    Construct a native Plotly animation figure with play/pause,
    time-scrub slider, and live delta readout.
    """
    # Track outline coordinates
    track_x = track_outline_df["X"].to_numpy()
    track_y = track_outline_df["Y"].to_numpy()

    xA = replay_df["xA"].to_numpy()
    yA = replay_df["yA"].to_numpy()
    xB = replay_df["xB"].to_numpy()
    yB = replay_df["yB"].to_numpy()
    times = replay_df["Time"].to_numpy()
    deltas = replay_df["DeltaTime"].to_numpy()
    speedA = replay_df["speedA"].to_numpy()
    speedB = replay_df["speedB"].to_numpy()

    num_frames = len(replay_df)

    # Base figure with 3 traces:
    # Trace 0: Static Track Outline
    # Trace 1: Driver A Marker
    # Trace 2: Driver B Marker
    fig = go.Figure()

    # Trace 0: Track Outline
    fig.add_trace(
        go.Scatter(
            x=track_x,
            y=track_y,
            mode="lines",
            line=dict(color="#333842", width=6),
            hoverinfo="skip",
            name="Circuit Outline",
            showlegend=False,
        )
    )

    # Trace 1: Driver A initial position
    fig.add_trace(
        go.Scatter(
            x=[xA[0]],
            y=[yA[0]],
            mode="markers+text",
            marker=dict(
                size=14,
                color=DRIVER_A_COLOR,
                symbol="circle",
                line=dict(color="#FFFFFF", width=2),
            ),
            text=[f" {driver_a}"],
            textposition="top right",
            name=f"{driver_a}",
            hovertemplate=f"<b>{driver_a}</b><br>Speed: %{{customdata[0]:.1f}} km/h<extra></extra>",
            customdata=[[speedA[0]]],
        )
    )

    # Trace 2: Driver B initial position
    fig.add_trace(
        go.Scatter(
            x=[xB[0]],
            y=[yB[0]],
            mode="markers+text",
            marker=dict(
                size=14,
                color=DRIVER_B_COLOR,
                symbol="diamond",
                line=dict(color="#FFFFFF", width=2),
            ),
            text=[f" {driver_b}"],
            textposition="bottom right",
            name=f"{driver_b}",
            hovertemplate=f"<b>{driver_b}</b><br>Speed: %{{customdata[0]:.1f}} km/h<extra></extra>",
            customdata=[[speedB[0]]],
        )
    )

    # Add corner labels if available
    add_corner_annotations(fig, corners_df)

    # Build animation frames
    frames = []
    slider_steps = []

    # Frame duration: at 0.1s real time = 100ms per frame.
    # Adjust duration inversely with speed multiplier (e.g. 2x -> 50ms, 0.5x -> 200ms)
    base_frame_ms = 100
    frame_duration_ms = max(10, int(base_frame_ms / max(speed_multiplier, 0.1)))

    for k in range(num_frames):
        t = times[k]
        dt = deltas[k]
        leader = driver_a if dt > 0.005 else (driver_b if dt < -0.005 else "Tied")
        gap_text = f"{'+' if dt > 0 else ''}{dt:.3f} s ({leader} ahead)" if leader != "Tied" else "0.000 s (Tied)"

        frame_title = f"Replay Time: {t:.1f}s | Gap: {gap_text}"

        frame = go.Frame(
            data=[
                go.Scatter(
                    x=[xA[k]],
                    y=[yA[k]],
                    text=[f" {driver_a} ({speedA[k]:.0f} km/h)"],
                    customdata=[[speedA[k]]],
                ),
                go.Scatter(
                    x=[xB[k]],
                    y=[yB[k]],
                    text=[f" {driver_b} ({speedB[k]:.0f} km/h)"],
                    customdata=[[speedB[k]]],
                ),
            ],
            name=f"frame_{k}",
            traces=[1, 2],
            layout=go.Layout(
                title=dict(
                    text=f"🏁 Replay Studio — {driver_a} vs {driver_b} &nbsp;&nbsp;|&nbsp;&nbsp; ⏱️ <b>{t:.1f}s</b> &nbsp;&nbsp;|&nbsp;&nbsp; Δ <b>{gap_text}</b>",
                    font=dict(size=14, color="#FAFAFA"),
                )
            ),
        )
        frames.append(frame)

        # Slider step
        slider_steps.append(
            dict(
                method="animate",
                label=f"{t:.1f}s",
                args=[
                    [f"frame_{k}"],
                    dict(
                        mode="immediate",
                        frame=dict(duration=frame_duration_ms, redraw=False),
                        transition=dict(duration=0),
                    ),
                ],
            )
        )

    fig.frames = frames

    # Play / Pause Controls
    updatemenus = [
        dict(
            type="buttons",
            showactive=False,
            direction="left",
            x=0.0,
            y=-0.12,
            xanchor="left",
            yanchor="top",
            pad=dict(t=10, r=10),
            buttons=[
                dict(
                    label="▶ Play",
                    method="animate",
                    args=[
                        None,
                        dict(
                            frame=dict(duration=frame_duration_ms, redraw=False),
                            fromcurrent=True,
                            transition=dict(duration=0),
                            mode="immediate",
                        ),
                    ],
                ),
                dict(
                    label="⏸ Pause",
                    method="animate",
                    args=[
                        [None],
                        dict(
                            frame=dict(duration=0, redraw=False),
                            mode="immediate",
                            transition=dict(duration=0),
                        ),
                    ],
                ),
            ],
        )
    ]

    # Slider configuration
    sliders = [
        dict(
            active=0,
            yanchor="top",
            xanchor="left",
            currentvalue=dict(
                font=dict(size=12, color="#FAFAFA"),
                prefix="Time: ",
                visible=True,
                xanchor="right",
            ),
            transition=dict(duration=0),
            pad=dict(b=10, t=10),
            len=0.82,
            x=0.18,
            y=-0.12,
            steps=slider_steps,
        )
    ]

    initial_t = times[0]
    initial_dt = deltas[0]
    initial_leader = driver_a if initial_dt > 0.005 else (driver_b if initial_dt < -0.005 else "Tied")
    initial_gap = f"{'+' if initial_dt > 0 else ''}{initial_dt:.3f} s ({initial_leader} ahead)" if initial_leader != "Tied" else "0.000 s"

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="#0E1117",
        plot_bgcolor="#0E1117",
        font=dict(family="sans-serif", color="#FAFAFA", size=12),
        margin=dict(l=20, r=20, t=60, b=80),
        title=dict(
            text=f"🏁 Replay Studio — {driver_a} vs {driver_b} &nbsp;&nbsp;|&nbsp;&nbsp; ⏱️ <b>{initial_t:.1f}s</b> &nbsp;&nbsp;|&nbsp;&nbsp; Δ <b>{initial_gap}</b>",
            font=dict(size=14, color="#FAFAFA"),
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(size=12),
        ),
        xaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False,
            showline=False,
        ),
        yaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False,
            showline=False,
            scaleanchor="x",
            scaleratio=1,
        ),
        updatemenus=updatemenus,
        sliders=sliders,
    )

    return fig


def build_stint_replay_dataframe(
    session,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
    stint_number: int = 1,
    time_step: float = 0.5,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Interpolate telemetry for multiple laps or a full stint across a shared time grid.
    Returns (replay_df, track_outline_df).
    """
    def _get_stint_laps(driver_code):
        try:
            dlaps = session.laps.pick_drivers(driver_code)
        except AttributeError:
            dlaps = session.laps.pick_driver(driver_code)
        stint_laps = dlaps[dlaps["Stint"] == stint_number]
        if stint_laps.empty:
            stint_laps = dlaps
        return stint_laps

    laps_a = _get_stint_laps(driver_a)
    laps_b = _get_stint_laps(driver_b)

    tel_a = laps_a.get_telemetry().dropna(subset=["SessionTime", "X", "Y", "Distance"])
    tel_b = laps_b.get_telemetry().dropna(subset=["SessionTime", "X", "Y", "Distance"])

    t_start = max(tel_a["SessionTime"].iloc[0], tel_b["SessionTime"].iloc[0])
    t_end = min(tel_a["SessionTime"].iloc[-1], tel_b["SessionTime"].iloc[-1])
    total_sec = max(1.0, (t_end - t_start).total_seconds())

    time_grid = np.arange(0, total_sec + (time_step / 2.0), time_step)
    time_grid = time_grid[time_grid <= total_sec]

    sec_a = (tel_a["SessionTime"] - t_start).dt.total_seconds().to_numpy()
    sec_b = (tel_b["SessionTime"] - t_start).dt.total_seconds().to_numpy()

    # Track length normalization
    max_d = min(tel_a["Distance"].max(), tel_b["Distance"].max())
    scale_a = max_d / tel_a["Distance"].max() if tel_a["Distance"].max() > 0 else 1.0
    scale_b = max_d / tel_b["Distance"].max() if tel_b["Distance"].max() > 0 else 1.0

    xA = np.interp(time_grid, sec_a, tel_a["X"].to_numpy())
    yA = np.interp(time_grid, sec_a, tel_a["Y"].to_numpy())
    distA = np.interp(time_grid, sec_a, tel_a["Distance"].to_numpy() * scale_a)
    speedA = np.interp(time_grid, sec_a, tel_a["Speed"].to_numpy())

    xB = np.interp(time_grid, sec_b, tel_b["X"].to_numpy())
    yB = np.interp(time_grid, sec_b, tel_b["Y"].to_numpy())
    distB = np.interp(time_grid, sec_b, tel_b["Distance"].to_numpy() * scale_b)
    speedB = np.interp(time_grid, sec_b, tel_b["Speed"].to_numpy())

    # Approximate time delta on track: distance difference divided by mean speed
    mean_speed_mps = np.maximum(10.0, (speedA + speedB) / 2.0 / 3.6)
    delta_time_est = (distA - distB) / mean_speed_mps  # Positive = Driver A ahead

    replay_df = pd.DataFrame({
        "Time": np.round(time_grid, 2),
        "xA": xA,
        "yA": yA,
        "speedA": speedA,
        "distA": distA,
        "xB": xB,
        "yB": yB,
        "speedB": speedB,
        "distB": distB,
        "DeltaTime": delta_time_est,
    })

    track_outline_df = tel_a.head(1000)[["X", "Y"]].copy()
    return replay_df, track_outline_df


def create_single_frame_figure(
    track_outline_df: pd.DataFrame,
    xA: float,
    yA: float,
    xB: float,
    yB: float,
    speedA: float,
    speedB: float,
    driver_a: str,
    driver_b: str,
    current_time: float,
    delta_time: float,
    stint_lap_info: str = "",
    corners_df: pd.DataFrame = None,
) -> go.Figure:
    """
    Renders an individual frame for the manual-loop replay pattern.
    Extremely lightweight: only draws the track outline and 2 car markers.
    """
    fig = go.Figure()

    # Base track outline
    fig.add_trace(
        go.Scatter(
            x=track_outline_df["X"],
            y=track_outline_df["Y"],
            mode="lines",
            line=dict(color="#333842", width=6),
            hoverinfo="skip",
            showlegend=False,
        )
    )

    # Driver A marker
    fig.add_trace(
        go.Scatter(
            x=[xA],
            y=[yA],
            mode="markers+text",
            marker=dict(
                size=16,
                color=DRIVER_A_COLOR,
                symbol="circle",
                line=dict(color="#FFFFFF", width=2),
            ),
            text=[f" {driver_a}"],
            textposition="top right",
            name=driver_a,
            hovertemplate=f"<b>{driver_a}</b><br>Speed: {speedA:.1f} km/h<extra></extra>",
        )
    )

    # Driver B marker
    fig.add_trace(
        go.Scatter(
            x=[xB],
            y=[yB],
            mode="markers+text",
            marker=dict(
                size=16,
                color=DRIVER_B_COLOR,
                symbol="diamond",
                line=dict(color="#FFFFFF", width=2),
            ),
            text=[f" {driver_b}"],
            textposition="bottom right",
            name=driver_b,
            hovertemplate=f"<b>{driver_b}</b><br>Speed: {speedB:.1f} km/h<extra></extra>",
        )
    )

    add_corner_annotations(fig, corners_df)

    leader = driver_a if delta_time > 0.05 else (driver_b if delta_time < -0.05 else "Tied")
    gap_str = f"{abs(delta_time):.2f} s ({leader} ahead)" if leader != "Tied" else "Tied (0.00 s)"

    m = int(current_time // 60)
    s = current_time % 60
    time_str = f"{m:02d}:{s:04.1f}"

    title_text = f"⏱️ <b>{time_str}</b> &nbsp;|&nbsp; Gap: <b>{gap_str}</b>"
    if stint_lap_info:
        title_text += f" &nbsp;|&nbsp; {stint_lap_info}"

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="#0E1117",
        plot_bgcolor="#0E1117",
        font=dict(family="sans-serif", color="#FAFAFA", size=12),
        margin=dict(l=20, r=20, t=50, b=20),
        title=dict(text=title_text, font=dict(size=15, color="#FAFAFA")),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(size=12),
        ),
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False, showline=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False, showline=False, scaleanchor="x", scaleratio=1),
    )

    return fig

