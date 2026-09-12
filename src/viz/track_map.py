"""Shared track outline and track-map visualization helpers (Panels 9–11)."""
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from src.viz.panels import DRIVER_A_COLOR, DRIVER_B_COLOR

# Discrete colormap for gears 1 through 8
GEAR_COLORS = {
    1: "#7C3AED",  # Purple
    2: "#EC4899",  # Pink
    3: "#3B82F6",  # Blue
    4: "#06B6D4",  # Cyan
    5: "#10B981",  # Emerald
    6: "#84CC16",  # Lime
    7: "#EAB308",  # Amber/Yellow
    8: "#F97316",  # Orange
}

TRACK_LAYOUT_DEFAULTS = dict(
    template="plotly_dark",
    paper_bgcolor="#0E1117",
    plot_bgcolor="#0E1117",
    font=dict(family="sans-serif", color="#FAFAFA", size=12),
    margin=dict(l=20, r=20, t=50, b=20),
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
)


def extract_braking_points(df: pd.DataFrame, min_gap_meters: float = 50.0) -> pd.DataFrame:
    """
    Extract the initial onset (False -> True transition) of each braking zone.
    Filters out noise/chatter closer than min_gap_meters.
    """
    if 'Brake' not in df.columns or 'X' not in df.columns or 'Y' not in df.columns:
        return pd.DataFrame()

    brake = (df['Brake'] > 0.5).to_numpy()
    if len(brake) == 0:
        return pd.DataFrame()

    onsets = np.where(brake[1:] & ~brake[:-1])[0] + 1
    if brake[0]:
        onsets = np.insert(onsets, 0, 0)

    selected_indices = []
    last_dist = -9999.0
    for idx in onsets:
        d = df['Distance'].iloc[idx]
        if d - last_dist > min_gap_meters:
            selected_indices.append(idx)
            last_dist = d

    return df.iloc[selected_indices].copy()


def add_corner_annotations(fig: go.Figure, corners_df: pd.DataFrame, row: int = None, col: int = None):
    """Optionally annotate corner numbers on the track layout."""
    if corners_df is None or corners_df.empty:
        return

    for _, c_row in corners_df.iterrows():
        c_num = c_row.get('Number', '')
        c_letter = c_row.get('Letter', '')
        letter_str = str(c_letter) if pd.notna(c_letter) and str(c_letter).strip() else ''
        text = f"{int(c_num)}{letter_str}" if pd.notna(c_num) and str(c_num) != '' else ''
        
        annotation = dict(
            x=c_row['X'],
            y=c_row['Y'],
            text=text,
            showarrow=False,
            font=dict(size=9, color="#94A3B8"),
            opacity=0.7,
        )
        if row is not None and col is not None:
            fig.add_annotation(annotation, row=row, col=col)
        else:
            fig.add_annotation(annotation)


def plot_speed_track_map(
    df_a: pd.DataFrame,
    df_b: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
    corners_df: pd.DataFrame = None,
) -> go.Figure:
    """
    Panel 9: Speed-colored track map.
    Binary coloring showing which driver was faster at each point along the circuit.
    """
    fig = go.Figure()

    # Determine faster driver at each point
    faster_is_a = (df_a['Speed'] >= df_b['Speed']).to_numpy()
    x = df_a['X'].to_numpy()
    y = df_a['Y'].to_numpy()
    speed_a = df_a['Speed'].to_numpy()
    speed_b = df_b['Speed'].to_numpy()
    dist = df_a['Distance'].to_numpy()

    # Base track outline
    fig.add_trace(
        go.Scatter(
            x=x,
            y=y,
            mode="lines",
            line=dict(color="#2D3139", width=8),
            hoverinfo="skip",
            showlegend=False,
        )
    )

    # Segment colored lines
    # Split into contiguous segments to draw clean vector lines
    n = len(x)
    i = 0
    added_a_legend = False
    added_b_legend = False

    while i < n - 1:
        is_a = faster_is_a[i]
        j = i
        while j < n - 1 and faster_is_a[j] == is_a:
            j += 1
        
        # Include overlapping boundary point for continuous line
        seg_slice = slice(i, min(j + 1, n))
        color = DRIVER_A_COLOR if is_a else DRIVER_B_COLOR
        name = f"{driver_a} Faster" if is_a else f"{driver_b} Faster"
        
        show_leg = False
        if is_a and not added_a_legend:
            show_leg = True
            added_a_legend = True
        elif not is_a and not added_b_legend:
            show_leg = True
            added_b_legend = True

        seg_customdata = np.stack(
            (dist[seg_slice], speed_a[seg_slice], speed_b[seg_slice]),
            axis=-1,
        )

        fig.add_trace(
            go.Scatter(
                x=x[seg_slice],
                y=y[seg_slice],
                mode="lines",
                name=name,
                line=dict(color=color, width=4),
                showlegend=show_leg,
                customdata=seg_customdata,
                hovertemplate=(
                    "Distance: %{customdata[0]:.0f} m<br>"
                    f"{driver_a} Speed: %{{customdata[1]:.1f}} km/h<br>"
                    f"{driver_b} Speed: %{{customdata[2]:.1f}} km/h<br>"
                    f"Faster: <b>{driver_a if is_a else driver_b}</b>"
                    "<extra></extra>"
                ),
            )
        )
        i = j

    add_corner_annotations(fig, corners_df)

    fig.update_layout(
        title=dict(text=f"Speed Dominance Map ({driver_a} vs {driver_b})", font=dict(size=14, color="#FFFFFF")),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
        ),
        **TRACK_LAYOUT_DEFAULTS,
    )
    return fig


def plot_braking_point_map(
    df_a: pd.DataFrame,
    df_b: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
    corners_df: pd.DataFrame = None,
) -> go.Figure:
    """
    Panel 10: Braking-point map.
    Track outline with markers highlighting initial braking onset points per driver.
    """
    fig = go.Figure()

    # Base track outline
    fig.add_trace(
        go.Scatter(
            x=df_a['X'],
            y=df_a['Y'],
            mode="lines",
            name="Track Outline",
            line=dict(color="#333842", width=4),
            hoverinfo="skip",
            showlegend=False,
        )
    )

    bp_a = extract_braking_points(df_a)
    bp_b = extract_braking_points(df_b)

    # Driver A braking points
    if not bp_a.empty:
        fig.add_trace(
            go.Scatter(
                x=bp_a['X'],
                y=bp_a['Y'],
                mode="markers",
                name=f"{driver_a} Braking Points ({len(bp_a)})",
                marker=dict(
                    color=DRIVER_A_COLOR,
                    size=12,
                    symbol="circle",
                    line=dict(color="#FFFFFF", width=1.5),
                ),
                customdata=np.stack((bp_a['Distance'], bp_a['Speed']), axis=-1),
                hovertemplate=(
                    f"<b>{driver_a} Braking Point</b><br>"
                    "Distance: %{customdata[0]:.0f} m<br>"
                    "Entry Speed: %{customdata[1]:.1f} km/h"
                    "<extra></extra>"
                ),
            )
        )

    # Driver B braking points
    if not bp_b.empty:
        fig.add_trace(
            go.Scatter(
                x=bp_b['X'],
                y=bp_b['Y'],
                mode="markers",
                name=f"{driver_b} Braking Points ({len(bp_b)})",
                marker=dict(
                    color=DRIVER_B_COLOR,
                    size=10,
                    symbol="diamond",
                    line=dict(color="#FFFFFF", width=1.5),
                ),
                customdata=np.stack((bp_b['Distance'], bp_b['Speed']), axis=-1),
                hovertemplate=(
                    f"<b>{driver_b} Braking Point</b><br>"
                    "Distance: %{customdata[0]:.0f} m<br>"
                    "Entry Speed: %{customdata[1]:.1f} km/h"
                    "<extra></extra>"
                ),
            )
        )

    add_corner_annotations(fig, corners_df)

    fig.update_layout(
        title=dict(text="Braking Point Comparison", font=dict(size=14, color="#FFFFFF")),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
        ),
        **TRACK_LAYOUT_DEFAULTS,
    )
    return fig


def plot_gear_shift_map(
    df_a: pd.DataFrame,
    df_b: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
    corners_df: pd.DataFrame = None,
) -> go.Figure:
    """
    Panel 11: Gear-shift map.
    Side-by-side small multiples colored by discrete integer gear (1–8).
    """
    fig = make_subplots(
        rows=1,
        cols=2,
        subplot_titles=[f"{driver_a} Gear Selection", f"{driver_b} Gear Selection"],
        horizontal_spacing=0.05,
    )

    def _render_gear_map(df: pd.DataFrame, driver_name: str, col_idx: int):
        x = df['X'].to_numpy()
        y = df['Y'].to_numpy()
        gear = df['nGear'].to_numpy()
        dist = df['Distance'].to_numpy()
        n = len(x)

        # Base track outline
        fig.add_trace(
            go.Scatter(
                x=x,
                y=y,
                mode="lines",
                line=dict(color="#1F242E", width=7),
                hoverinfo="skip",
                showlegend=False,
            ),
            row=1,
            col=col_idx,
        )

        i = 0
        added_gears = set()
        while i < n - 1:
            g = int(gear[i])
            j = i
            while j < n - 1 and int(gear[j]) == g:
                j += 1
            
            seg_slice = slice(i, min(j + 1, n))
            color = GEAR_COLORS.get(g, "#94A3B8")
            show_leg = (col_idx == 1) and (g not in added_gears)
            if show_leg:
                added_gears.add(g)

            seg_customdata = np.stack((dist[seg_slice], gear[seg_slice]), axis=-1)

            fig.add_trace(
                go.Scatter(
                    x=x[seg_slice],
                    y=y[seg_slice],
                    mode="lines",
                    name=f"Gear {g}",
                    line=dict(color=color, width=4),
                    showlegend=show_leg,
                    legendgroup=f"gear_{g}",
                    customdata=seg_customdata,
                    hovertemplate=(
                        f"<b>{driver_name}</b><br>"
                        "Distance: %{customdata[0]:.0f} m<br>"
                        "Gear: <b>%{customdata[1]}</b>"
                        "<extra></extra>"
                    ),
                ),
                row=1,
                col=col_idx,
            )
            i = j

        add_corner_annotations(fig, corners_df, row=1, col=col_idx)

    _render_gear_map(df_a, driver_a, 1)
    _render_gear_map(df_b, driver_b, 2)

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="#0E1117",
        plot_bgcolor="#0E1117",
        font=dict(family="sans-serif", color="#FAFAFA", size=12),
        margin=dict(l=20, r=20, t=50, b=20),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="center",
            x=0.5,
            title=dict(text="Gear: "),
        ),
    )

    fig.update_xaxes(showgrid=False, zeroline=False, showticklabels=False, showline=False)
    fig.update_yaxes(showgrid=False, zeroline=False, showticklabels=False, showline=False, scaleanchor="x", scaleratio=1)

    return fig
