"""Plotly figure generators for the Telemetry Board panels."""
import pandas as pd
import plotly.graph_objects as go

# Driver color palette (defined once and shared across all panels and replay)
DRIVER_A_COLOR = "#00D2BE"  # Bright Turquoise / Cyan
DRIVER_B_COLOR = "#FF8700"  # Papaya Orange

LAYOUT_DEFAULTS = dict(
    template="plotly_dark",
    paper_bgcolor="#0E1117",
    plot_bgcolor="#161A23",
    font=dict(family="sans-serif", color="#FAFAFA", size=12),
    margin=dict(l=50, r=30, t=40, b=40),
    hovermode="x unified",
    legend=dict(
        orientation="h",
        yanchor="bottom",
        y=1.02,
        xanchor="right",
        x=1,
        font=dict(size=12),
    ),
    xaxis=dict(
        title="Distance (m)",
        showgrid=True,
        gridcolor="#262B36",
        zeroline=False,
    ),
    yaxis=dict(
        showgrid=True,
        gridcolor="#262B36",
        zeroline=False,
    ),
)


def _apply_layout(fig: go.Figure, title: str, y_title: str, **kwargs) -> go.Figure:
    """Helper to apply standard layout and custom y-axis title."""
    layout_args = {**LAYOUT_DEFAULTS, **kwargs}
    fig.update_layout(
        title=dict(text=title, font=dict(size=14, color="#FFFFFF")),
        yaxis_title=y_title,
        **layout_args,
    )
    return fig


def plot_speed_overlay(
    df_a: pd.DataFrame,
    df_b: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> go.Figure:
    """Panel 1: Speed overlay (km/h vs Distance)."""
    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=df_a["Distance"],
            y=df_a["Speed"],
            mode="lines",
            name=driver_a,
            line=dict(color=DRIVER_A_COLOR, width=2.5),
            hovertemplate=f"{driver_a}: %{{y:.1f}} km/h<extra></extra>",
        )
    )

    fig.add_trace(
        go.Scatter(
            x=df_b["Distance"],
            y=df_b["Speed"],
            mode="lines",
            name=driver_b,
            line=dict(color=DRIVER_B_COLOR, width=2.5),
            hovertemplate=f"{driver_b}: %{{y:.1f}} km/h<extra></extra>",
        )
    )

    return _apply_layout(fig, title="Speed Comparison", y_title="Speed (km/h)")


def plot_throttle_overlay(
    df_a: pd.DataFrame,
    df_b: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> go.Figure:
    """Panel 2: Throttle overlay (% vs Distance)."""
    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=df_a["Distance"],
            y=df_a["Throttle"],
            mode="lines",
            name=driver_a,
            line=dict(color=DRIVER_A_COLOR, width=2.2),
            hovertemplate=f"{driver_a}: %{{y:.1f}}%<extra></extra>",
        )
    )

    fig.add_trace(
        go.Scatter(
            x=df_b["Distance"],
            y=df_b["Throttle"],
            mode="lines",
            name=driver_b,
            line=dict(color=DRIVER_B_COLOR, width=2.2),
            hovertemplate=f"{driver_b}: %{{y:.1f}}%<extra></extra>",
        )
    )

    fig.update_yaxes(range=[-5, 105])
    return _apply_layout(fig, title="Throttle Application", y_title="Throttle (%)")


def plot_brake_overlay(
    df_a: pd.DataFrame,
    df_b: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> go.Figure:
    """Panel 3: Brake overlay (Step bands vs Distance)."""
    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=df_a["Distance"],
            y=df_a["Brake"],
            mode="lines",
            name=driver_a,
            line=dict(color=DRIVER_A_COLOR, shape="hv", width=1.5),
            fill="tozeroy",
            fillcolor="rgba(0, 210, 190, 0.35)",
            hovertemplate=f"{driver_a}: %{{y}}<extra></extra>",
        )
    )

    fig.add_trace(
        go.Scatter(
            x=df_b["Distance"],
            y=df_b["Brake"],
            mode="lines",
            name=driver_b,
            line=dict(color=DRIVER_B_COLOR, shape="hv", width=1.5),
            fill="tozeroy",
            fillcolor="rgba(255, 135, 0, 0.35)",
            hovertemplate=f"{driver_b}: %{{y}}<extra></extra>",
        )
    )

    fig.update_yaxes(
        tickmode="array",
        tickvals=[0, 1],
        ticktext=["OFF", "ON"],
        range=[-0.1, 1.2],
    )
    return _apply_layout(fig, title="Braking Zones", y_title="Brake Status")


def plot_gear_overlay(
    df_a: pd.DataFrame,
    df_b: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> go.Figure:
    """Panel 4: Gear selection (Discrete step chart vs Distance)."""
    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=df_a["Distance"],
            y=df_a["nGear"],
            mode="lines",
            name=driver_a,
            line=dict(color=DRIVER_A_COLOR, shape="hv", width=2.5),
            hovertemplate=f"{driver_a}: Gear %{{y}}<extra></extra>",
        )
    )

    fig.add_trace(
        go.Scatter(
            x=df_b["Distance"],
            y=df_b["nGear"],
            mode="lines",
            name=driver_b,
            line=dict(color=DRIVER_B_COLOR, shape="hv", width=2.5, dash="dot"),
            hovertemplate=f"{driver_b}: Gear %{{y}}<extra></extra>",
        )
    )

    fig.update_yaxes(
        tickmode="linear",
        tick0=1,
        dtick=1,
        range=[0.5, 8.5],
    )
    return _apply_layout(fig, title="Gear Selection", y_title="Gear (nGear)")


def plot_drs_overlay(
    df_a: pd.DataFrame,
    df_b: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> go.Figure:
    """Panel 5: DRS overlay (Step bands vs Distance)."""
    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=df_a["Distance"],
            y=df_a["DRS"],
            mode="lines",
            name=driver_a,
            line=dict(color=DRIVER_A_COLOR, shape="hv", width=1.5),
            fill="tozeroy",
            fillcolor="rgba(0, 210, 190, 0.35)",
            hovertemplate=f"{driver_a}: %{{y}}<extra></extra>",
        )
    )

    fig.add_trace(
        go.Scatter(
            x=df_b["Distance"],
            y=df_b["DRS"],
            mode="lines",
            name=driver_b,
            line=dict(color=DRIVER_B_COLOR, shape="hv", width=1.5),
            fill="tozeroy",
            fillcolor="rgba(255, 135, 0, 0.35)",
            hovertemplate=f"{driver_b}: %{{y}}<extra></extra>",
        )
    )

    fig.update_yaxes(
        tickmode="array",
        tickvals=[0, 1],
        ticktext=["CLOSED", "OPEN"],
        range=[-0.1, 1.2],
    )
    return _apply_layout(fig, title="DRS Activation", y_title="DRS Status")


def plot_delta_time(
    delta_df: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> go.Figure:
    """
    Panel 6: Cumulative Delta Time (seconds vs Distance).
    Positive = Driver A is ahead (Driver B is slower).
    Negative = Driver B is ahead (Driver A is slower).
    """
    fig = go.Figure()

    distances = delta_df["Distance"]
    delta_vals = delta_df["DeltaTime"]

    # Shaded positive region (Driver A ahead)
    pos_delta = delta_vals.clip(lower=0)
    fig.add_trace(
        go.Scatter(
            x=distances,
            y=pos_delta,
            mode="none",
            fill="tozeroy",
            fillcolor="rgba(0, 210, 190, 0.25)",
            name=f"{driver_a} Ahead",
            showlegend=True,
            hoverinfo="skip",
        )
    )

    # Shaded negative region (Driver B ahead)
    neg_delta = delta_vals.clip(upper=0)
    fig.add_trace(
        go.Scatter(
            x=distances,
            y=neg_delta,
            mode="none",
            fill="tozeroy",
            fillcolor="rgba(255, 135, 0, 0.25)",
            name=f"{driver_b} Ahead",
            showlegend=True,
            hoverinfo="skip",
        )
    )

    # Main delta time trace
    fig.add_trace(
        go.Scatter(
            x=distances,
            y=delta_vals,
            mode="lines",
            name="Delta Time (dt)",
            line=dict(color="#FFFFFF", width=2.5),
            hovertemplate="Distance: %{x:.0f} m<br>Delta: %{y:+.3f} s<extra></extra>",
        )
    )

    # Zero reference line
    fig.add_hline(
        y=0,
        line_width=1,
        line_dash="dash",
        line_color="#8E9297",
    )

    return _apply_layout(
        fig,
        title=f"Cumulative Time Delta ({driver_b} vs {driver_a})",
        y_title=f"Delta (s) [▲ {driver_a} Ahead | ▼ {driver_b} Ahead]",
    )


def plot_sector_comparison(
    sector_df: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> go.Figure:
    """
    Panel 8: Sector time comparison (S1, S2, S3 deltas).
    """
    fig = go.Figure()

    colors = [
        DRIVER_A_COLOR if row["Faster Driver"] == driver_a else DRIVER_B_COLOR
        for _, row in sector_df.iterrows()
    ]

    fig.add_trace(
        go.Bar(
            x=sector_df["Sector"],
            y=sector_df["Delta (s)"],
            marker_color=colors,
            text=[f"{val:+.3f} s" for val in sector_df["Delta (s)"]],
            textposition="auto",
            hovertemplate=(
                "Sector: %{x}<br>"
                "Delta: %{y:+.3f} s<br>"
                "<extra></extra>"
            ),
        )
    )

    fig.add_hline(y=0, line_width=1, line_color="#8E9297")

    return _apply_layout(
        fig,
        title=f"Official Sector Time Delta ({driver_b} vs {driver_a})",
        y_title="Delta (s) [Positive = Driver A Faster]",
    )


def plot_speed_traps(
    lap_a,
    lap_b,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> go.Figure:
    """
    Panel 12: Speed trap comparison (SpeedI1, SpeedI2, SpeedFL, SpeedST).
    Grouped bar chart with official speed trap figures.
    """
    import numpy as np

    traps = [
        ("Sector 1 (I1)", "SpeedI1"),
        ("Sector 2 (I2)", "SpeedI2"),
        ("Finish Line (FL)", "SpeedFL"),
        ("Speed Trap (ST)", "SpeedST"),
    ]
    labels = [t[0] for t in traps]
    vals_a = [lap_a.get(t[1], np.nan) for t in traps]
    vals_b = [lap_b.get(t[1], np.nan) for t in traps]

    fig = go.Figure()

    fig.add_trace(
        go.Bar(
            name=driver_a,
            x=labels,
            y=vals_a,
            marker_color=DRIVER_A_COLOR,
            text=[f"{v:.1f} km/h" if pd.notna(v) and v > 0 else "N/A" for v in vals_a],
            textposition="auto",
            hovertemplate=f"{driver_a} - %{{x}}: %{{y:.1f}} km/h<extra></extra>",
        )
    )

    fig.add_trace(
        go.Bar(
            name=driver_b,
            x=labels,
            y=vals_b,
            marker_color=DRIVER_B_COLOR,
            text=[f"{v:.1f} km/h" if pd.notna(v) and v > 0 else "N/A" for v in vals_b],
            textposition="auto",
            hovertemplate=f"{driver_b} - %{{x}}: %{{y:.1f}} km/h<extra></extra>",
        )
    )

    all_vals = [v for v in vals_a + vals_b if pd.notna(v) and v > 0]
    y_min = max(0, min(all_vals) - 35) if all_vals else 0
    y_max = max(all_vals) + 20 if all_vals else 360

    fig.update_layout(barmode="group")
    fig.update_yaxes(range=[y_min, y_max])

    return _apply_layout(
        fig,
        title="Official Speed Trap Comparison",
        y_title="Speed (km/h)",
    )


def plot_stint_consistency(
    session_laps: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
    selected_lap_a: float = None,
    selected_lap_b: float = None,
) -> go.Figure:
    """
    Panel 13: Stint consistency (Lap Time vs Lap Number across the session).
    """
    fig = go.Figure()

    def _extract_driver_times(code):
        try:
            dlaps = session_laps.pick_drivers(code)
        except AttributeError:
            dlaps = session_laps.pick_driver(code)
        
        if dlaps.empty:
            return pd.DataFrame()
        valid = dlaps[dlaps['LapTime'].notna()].copy()
        if valid.empty:
            return pd.DataFrame()
        valid['LapTimeSec'] = valid['LapTime'].dt.total_seconds()
        return valid

    laps_a = _extract_driver_times(driver_a)
    laps_b = _extract_driver_times(driver_b)

    def _format_sec(sec):
        m = int(sec // 60)
        s = sec % 60
        return f"{m}:{s:06.3f}"

    if not laps_a.empty:
        hover_a = [
            f"Lap {int(row['LapNumber'])}: {_format_sec(row['LapTimeSec'])}"
            + (f" ({row['Compound']})" if pd.notna(row.get('Compound')) else "")
            for _, row in laps_a.iterrows()
        ]
        fig.add_trace(
            go.Scatter(
                x=laps_a['LapNumber'],
                y=laps_a['LapTimeSec'],
                mode="lines+markers",
                name=driver_a,
                line=dict(color=DRIVER_A_COLOR, width=2),
                marker=dict(size=6, color=DRIVER_A_COLOR),
                text=hover_a,
                hovertemplate="%{text}<extra></extra>",
            )
        )
        if selected_lap_a is not None:
            sel_row = laps_a[laps_a['LapNumber'] == selected_lap_a]
            if not sel_row.empty:
                fig.add_trace(
                    go.Scatter(
                        x=sel_row['LapNumber'],
                        y=sel_row['LapTimeSec'],
                        mode="markers",
                        name=f"{driver_a} Compared Lap",
                        marker=dict(size=14, color=DRIVER_A_COLOR, symbol="star", line=dict(color="#FFFFFF", width=2)),
                        hoverinfo="skip",
                    )
                )

    if not laps_b.empty:
        hover_b = [
            f"Lap {int(row['LapNumber'])}: {_format_sec(row['LapTimeSec'])}"
            + (f" ({row['Compound']})" if pd.notna(row.get('Compound')) else "")
            for _, row in laps_b.iterrows()
        ]
        fig.add_trace(
            go.Scatter(
                x=laps_b['LapNumber'],
                y=laps_b['LapTimeSec'],
                mode="lines+markers",
                name=driver_b,
                line=dict(color=DRIVER_B_COLOR, width=2, dash="dot"),
                marker=dict(size=6, color=DRIVER_B_COLOR),
                text=hover_b,
                hovertemplate="%{text}<extra></extra>",
            )
        )
        if selected_lap_b is not None:
            sel_row = laps_b[laps_b['LapNumber'] == selected_lap_b]
            if not sel_row.empty:
                fig.add_trace(
                    go.Scatter(
                        x=sel_row['LapNumber'],
                        y=sel_row['LapTimeSec'],
                        mode="markers",
                        name=f"{driver_b} Compared Lap",
                        marker=dict(size=14, color=DRIVER_B_COLOR, symbol="star", line=dict(color="#FFFFFF", width=2)),
                        hoverinfo="skip",
                    )
                )

    return _apply_layout(
        fig,
        title="Session Lap Time Consistency",
        y_title="Lap Time (seconds)",
    )


