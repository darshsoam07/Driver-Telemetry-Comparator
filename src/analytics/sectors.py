"""Official sector time comparison from session.laps."""
import pandas as pd

def compute_sector_deltas(
    lap_a,
    lap_b,
    driver_a: str = "Driver A",
    driver_b: str = "Driver B",
) -> pd.DataFrame:
    """
    Extract official sector times and deltas directly from session.laps
    for the selected laps.
    """
    sectors = ["Sector 1", "Sector 2", "Sector 3"]
    cols = ["Sector1Time", "Sector2Time", "Sector3Time"]

    records = []
    for sector_name, col in zip(sectors, cols):
        s_a = lap_a.get(col, pd.NaT)
        s_b = lap_b.get(col, pd.NaT)

        t_a = s_a.total_seconds() if pd.notna(s_a) and hasattr(s_a, 'total_seconds') else None
        t_b = s_b.total_seconds() if pd.notna(s_b) and hasattr(s_b, 'total_seconds') else None

        if t_a is not None and t_b is not None:
            delta = t_b - t_a  # Positive means Driver A faster
            if delta > 0.0001:
                faster_driver = driver_a
            elif delta < -0.0001:
                faster_driver = driver_b
            else:
                faster_driver = "Equal"
        else:
            delta = 0.0
            faster_driver = "N/A"

        records.append({
            "Sector": sector_name,
            f"{driver_a} Time (s)": round(t_a, 3) if t_a is not None else None,
            f"{driver_b} Time (s)": round(t_b, 3) if t_b is not None else None,
            "Delta (s)": round(delta, 3),
            "Faster Driver": faster_driver,
        })

    return pd.DataFrame(records)
