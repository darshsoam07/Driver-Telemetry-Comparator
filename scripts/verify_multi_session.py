import sys
import os
import pandas as pd

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.data.fastf1_client import get_session
from src.data.telemetry import get_driver_fastest_lap, get_lap_telemetry, align_telemetry
from src.analytics.delta_time import compute_delta_time
from src.analytics.corners import compute_corner_gaps
from src.analytics.sectors import compute_sector_deltas
from src.viz.panels import (
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

def test_single_session(year, gp, session_type, driver_a, driver_b):
    print(f"\n========================================================")
    print(f"Testing Session: {year} {gp} [{session_type}] ({driver_a} vs {driver_b})")
    print(f"========================================================")

    session = get_session(year, gp, session_type)
    session.load(telemetry=True, laps=True, weather=False)

    lap_a = get_driver_fastest_lap(session, driver_a)
    lap_b = get_driver_fastest_lap(session, driver_b)

    time_a = lap_a['LapTime'].total_seconds()
    time_b = lap_b['LapTime'].total_seconds()
    print(f"{driver_a} Fastest Lap: {lap_a['LapTime']} ({time_a:.3f} s, Lap {int(lap_a['LapNumber'])})")
    print(f"{driver_b} Fastest Lap: {lap_b['LapTime']} ({time_b:.3f} s, Lap {int(lap_b['LapNumber'])})")
    print(f"Official Gap: {time_b - time_a:+.3f} s")

    tel_a = get_lap_telemetry(lap_a)
    tel_b = get_lap_telemetry(lap_b)

    df_a, df_b, dist_grid = align_telemetry(tel_a, tel_b)
    delta_df = compute_delta_time(df_a, df_b)

    circuit_info = session.get_circuit_info()
    corners_df = circuit_info.corners if circuit_info is not None else None
    corner_gaps_df = compute_corner_gaps(delta_df, corners_df, driver_a, driver_b)
    sector_df = compute_sector_deltas(lap_a, lap_b, driver_a, driver_b)

    # Generate all 13 panels
    p1 = plot_speed_overlay(df_a, df_b, driver_a, driver_b)
    p2 = plot_throttle_overlay(df_a, df_b, driver_a, driver_b)
    p3 = plot_brake_overlay(df_a, df_b, driver_a, driver_b)
    p4 = plot_gear_overlay(df_a, df_b, driver_a, driver_b)
    p5 = plot_drs_overlay(df_a, df_b, driver_a, driver_b)
    p6 = plot_delta_time(delta_df, driver_a, driver_b)
    # p7 is the corner gap table: verify rows exist
    assert not corner_gaps_df.empty, "Corner gap table is empty"
    p8 = plot_sector_comparison(sector_df, driver_a, driver_b)
    p9 = plot_speed_track_map(df_a, df_b, driver_a, driver_b, corners_df)
    p10 = plot_braking_point_map(df_a, df_b, driver_a, driver_b, corners_df)
    p11 = plot_gear_shift_map(df_a, df_b, driver_a, driver_b, corners_df)
    p12 = plot_speed_traps(lap_a, lap_b, driver_a, driver_b)
    p13 = plot_stint_consistency(session.laps, driver_a, driver_b, float(lap_a['LapNumber']), float(lap_b['LapNumber']))

    print(f"All 13 panels generated successfully without errors!")
    end_delta = delta_df['DeltaTime'].iloc[-1]
    print(f"End Delta Time: {end_delta:+.3f} s vs Official Gap: {time_b - time_a:+.3f} s (Error: {abs(end_delta - (time_b - time_a)):.4f} s)")
    return True

def run_multi_session_verification():
    sessions = [
        (2023, "Bahrain", "R", "VER", "ALO"),     # 1. Race session
        (2023, "Bahrain", "Q", "VER", "LEC"),     # 2. Qualifying session
        (2023, "Monaco", "Q", "VER", "ALO"),      # 3. Different circuit qualifying
    ]

    for year, gp, stype, da, db in sessions:
        success = test_single_session(year, gp, stype, da, db)
        assert success

    print("\n>> MULTI-SESSION CHECKPOINT PASSED: All 3 distinct sessions loaded and all 13 panels rendered flawlessly.")

if __name__ == "__main__":
    run_multi_session_verification()
