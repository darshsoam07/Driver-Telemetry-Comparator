"""Telemetry loading, interpolation, and distance-grid alignment helpers."""
import numpy as np
import pandas as pd
import fastf1

def is_drs_open(drs_value) -> bool:
    """
    Check if DRS was active/open based on FastF1 integer DRS status.
    Values 10, 12, 14 indicate DRS open; 0, 1, 8 indicate closed/disabled.
    """
    try:
        val = int(drs_value)
        return val in (10, 12, 14)
    except (ValueError, TypeError):
        return False

def is_braking(brake_value) -> bool:
    """
    Normalize brake channel to boolean True/False.
    Handles boolean, numeric (0/1 or 0-100), and string values.
    """
    if pd.isna(brake_value):
        return False
    if isinstance(brake_value, bool):
        return brake_value
    try:
        val = float(brake_value)
        return val > 0.0
    except (ValueError, TypeError):
        return bool(brake_value)

def get_driver_fastest_lap(session, driver_code: str):
    """
    Extract the fastest valid green-flag lap for a driver,
    explicitly excluding pit-in, pit-out, and safety-car / non-green laps.
    """
    # Use pick_drivers or pick_driver with fallback
    try:
        driver_laps = session.laps.pick_drivers(driver_code)
    except AttributeError:
        driver_laps = session.laps.pick_driver(driver_code)

    if driver_laps.empty:
        raise ValueError(f"No laps found for driver {driver_code}")

    # Exclude pit in / pit out laps
    valid_laps = driver_laps[driver_laps['PitInTime'].isna() & driver_laps['PitOutTime'].isna()]

    # Filter for green-flag laps (TrackStatus == '1' in FastF1)
    if 'TrackStatus' in valid_laps.columns:
        green_flag_laps = valid_laps[valid_laps['TrackStatus'] == '1']
        if not green_flag_laps.empty:
            valid_laps = green_flag_laps

    # Fallback to general valid laps or fastest lap if green flag filtering returned empty
    if valid_laps.empty:
        valid_laps = driver_laps[driver_laps['PitInTime'].isna() & driver_laps['PitOutTime'].isna()]
    if valid_laps.empty:
        valid_laps = driver_laps

    fastest = valid_laps.pick_fastest()
    if fastest is None or (isinstance(fastest, pd.DataFrame) and fastest.empty):
        # Fallback to driver's overall fastest lap
        fastest = driver_laps.pick_fastest()

    return fastest

def get_lap_telemetry(lap) -> pd.DataFrame:
    """
    Fetch merged car + position telemetry for a single lap and compute
    Distance, normalized Brake (0/1), and DRS (0/1).
    """
    tel = lap.get_telemetry()
    if tel is None or tel.empty:
        raise ValueError(f"No telemetry available for lap {lap}")

    tel = tel.add_distance()

    # Normalize elapsed time in seconds from lap start
    if 'Time' in tel.columns:
        time_series = tel['Time']
        if pd.api.types.is_timedelta64_dtype(time_series):
            tel['TimeInSeconds'] = (time_series - time_series.iloc[0]).dt.total_seconds()
        else:
            tel['TimeInSeconds'] = (time_series - time_series.iloc[0])
    else:
        tel['TimeInSeconds'] = 0.0

    # Normalize boolean/discrete channels
    tel['BrakeBool'] = tel['Brake'].apply(is_braking).astype(int)
    tel['DRSBool'] = tel['DRS'].apply(is_drs_open).astype(int)

    return tel

def align_telemetry(tel_a: pd.DataFrame, tel_b: pd.DataFrame, num_points: int = 1500):
    """
    Align two drivers' lap telemetry onto a shared distance grid
    capped at the shorter lap's max distance using numpy.interp.
    
    Each driver's distance axis is scaled to span [0, max_common_distance],
    guaranteeing that 0m is the start line and max_common_distance is the finish line
    with exact time delta consistency.
    
    Returns (df_a_aligned, df_b_aligned, distance_grid).
    """
    max_dist_a = tel_a['Distance'].max()
    max_dist_b = tel_b['Distance'].max()
    max_common_distance = min(max_dist_a, max_dist_b)

    # Common distance grid (metres from start/finish line)
    distance_grid = np.linspace(0, max_common_distance, num_points)

    def _interpolate_telemetry(tel_df: pd.DataFrame) -> pd.DataFrame:
        df_sorted = tel_df.sort_values('Distance').drop_duplicates(subset=['Distance'])
        df_max_dist = df_sorted['Distance'].max()
        scale = max_common_distance / df_max_dist if df_max_dist > 0 else 1.0
        x = df_sorted['Distance'].to_numpy() * scale

        aligned = pd.DataFrame({'Distance': distance_grid})

        # Continuous channels
        for col in ['Speed', 'Throttle', 'TimeInSeconds', 'RPM']:
            if col in df_sorted.columns:
                aligned[col] = np.interp(distance_grid, x, df_sorted[col].to_numpy())

        # Track coordinates (X, Y, Z) if present
        for col in ['X', 'Y', 'Z']:
            if col in df_sorted.columns:
                aligned[col] = np.interp(distance_grid, x, df_sorted[col].to_numpy())

        # Discrete / Categorical channels
        if 'nGear' in df_sorted.columns:
            # Round interpolated gear to nearest integer (1-8)
            interp_gear = np.interp(distance_grid, x, df_sorted['nGear'].to_numpy())
            aligned['nGear'] = np.clip(np.round(interp_gear), 1, 8).astype(int)

        if 'BrakeBool' in df_sorted.columns:
            interp_brake = np.interp(distance_grid, x, df_sorted['BrakeBool'].to_numpy())
            aligned['Brake'] = (interp_brake > 0.5).astype(int)
        elif 'Brake' in df_sorted.columns:
            b_vals = df_sorted['Brake'].apply(is_braking).astype(int).to_numpy()
            interp_brake = np.interp(distance_grid, x, b_vals)
            aligned['Brake'] = (interp_brake > 0.5).astype(int)

        if 'DRSBool' in df_sorted.columns:
            interp_drs = np.interp(distance_grid, x, df_sorted['DRSBool'].to_numpy())
            aligned['DRS'] = (interp_drs > 0.5).astype(int)
        elif 'DRS' in df_sorted.columns:
            d_vals = df_sorted['DRS'].apply(is_drs_open).astype(int).to_numpy()
            interp_drs = np.interp(distance_grid, x, d_vals)
            aligned['DRS'] = (interp_drs > 0.5).astype(int)

        return aligned

    df_a_aligned = _interpolate_telemetry(tel_a)
    df_b_aligned = _interpolate_telemetry(tel_b)

    return df_a_aligned, df_b_aligned, distance_grid

