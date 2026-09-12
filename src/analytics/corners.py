"""Corner-by-corner gap analysis and delta lookup table."""
import numpy as np
import pandas as pd

def compute_corner_gaps(
    delta_df: pd.DataFrame,
    circuit_corners: pd.DataFrame,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> pd.DataFrame:
    """
    Compute time delta at each corner's apex and the delta gained/lost
    in that corner-to-corner segment.
    """
    if circuit_corners is None or circuit_corners.empty:
        return pd.DataFrame(columns=['Corner', 'Distance', 'CumulativeDelta', 'SegmentDelta', 'FasterDriver', 'Advantage'])

    grid_distances = delta_df['Distance'].to_numpy()
    delta_times = delta_df['DeltaTime'].to_numpy()

    # Sort corners by distance around the lap
    corners_sorted = circuit_corners.sort_values('Distance').copy()

    records = []
    prev_apex_delta = 0.0

    for _, row in corners_sorted.iterrows():
        corner_dist = float(row['Distance'])
        corner_num = row.get('Number', '')
        corner_letter = row.get('Letter', '')
        letter_str = str(corner_letter) if pd.notna(corner_letter) and str(corner_letter).strip() else ''
        corner_name = f"Turn {int(corner_num)}{letter_str}" if pd.notna(corner_num) and str(corner_num) != '' else f"Turn @ {corner_dist:.0f}m"

        # Interpolate cumulative delta at this corner's distance
        if corner_dist > grid_distances[-1]:
            apex_delta = float(delta_times[-1])
        elif corner_dist < grid_distances[0]:
            apex_delta = float(delta_times[0])
        else:
            apex_delta = float(np.interp(corner_dist, grid_distances, delta_times))

        segment_delta = apex_delta - prev_apex_delta
        prev_apex_delta = apex_delta

        # Positive delta = Driver A faster (Driver B lost time)
        # Negative delta = Driver B faster (Driver B gained time)
        if segment_delta > 0.0001:
            faster_driver = driver_a
            advantage = f"+{segment_delta:.3f} s"
        elif segment_delta < -0.0001:
            faster_driver = driver_b
            advantage = f"{segment_delta:.3f} s"
        else:
            faster_driver = "Equal"
            advantage = "0.000 s"

        records.append({
            'Corner': corner_name,
            'Distance (m)': round(corner_dist, 1),
            'Cumulative Delta (s)': round(apex_delta, 3),
            'Segment Delta (s)': round(segment_delta, 3),
            'Faster Driver': faster_driver,
            'Advantage': advantage,
        })

    return pd.DataFrame(records)
