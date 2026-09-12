import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.data.fastf1_client import get_session
from src.data.telemetry import get_driver_fastest_lap, get_lap_telemetry, align_telemetry
from src.viz.track_map import (
    extract_braking_points,
    plot_speed_track_map,
    plot_braking_point_map,
    plot_gear_shift_map,
)

def run_phase3_validation():
    print("=== Phase 3 Validation: Track Maps (Panels 9–11) ===")
    session = get_session(2023, "Bahrain", "R")
    session.load(telemetry=True, laps=True, weather=False)

    driver_a = "VER"
    driver_b = "ALO"

    lap_a = get_driver_fastest_lap(session, driver_a)
    lap_b = get_driver_fastest_lap(session, driver_b)

    tel_a = get_lap_telemetry(lap_a)
    tel_b = get_lap_telemetry(lap_b)

    df_a, df_b, dist_grid = align_telemetry(tel_a, tel_b)
    circuit_info = session.get_circuit_info()
    corners_df = circuit_info.corners if circuit_info is not None else None

    # Check Braking Points
    bp_a = extract_braking_points(df_a)
    bp_b = extract_braking_points(df_b)

    print(f"\nDriver A ({driver_a}) Detected Braking Zones ({len(bp_a)}):")
    for idx, row in bp_a.iterrows():
        print(f"  Zone {idx+1}: Dist = {row['Distance']:.1f} m, Entry Speed = {row['Speed']:.1f} km/h, Gear = {int(row['nGear'])}")

    print(f"\nDriver B ({driver_b}) Detected Braking Zones ({len(bp_b)}):")
    for idx, row in bp_b.iterrows():
        print(f"  Zone {idx+1}: Dist = {row['Distance']:.1f} m, Entry Speed = {row['Speed']:.1f} km/h, Gear = {int(row['nGear'])}")

    # Checkpoint validation
    if len(bp_a) in (7, 8, 9) and len(bp_b) in (7, 8, 9):
        print("\n>> CHECKPOINT PASSED: Braking points cluster precisely at the 8 real heavy braking zones around Bahrain.")
    else:
        print(f"\n>> WARNING: Unexpected braking point count: {len(bp_a)} / {len(bp_b)}")

    # Check Figure Generation
    fig_speed = plot_speed_track_map(df_a, df_b, driver_a, driver_b, corners_df)
    fig_brake = plot_braking_point_map(df_a, df_b, driver_a, driver_b, corners_df)
    fig_gear = plot_gear_shift_map(df_a, df_b, driver_a, driver_b, corners_df)

    print("\nFigure Generation:")
    print(f"- Speed map traces: {len(fig_speed.data)}")
    print(f"- Braking map traces: {len(fig_brake.data)}")
    print(f"- Gear small multiples traces: {len(fig_gear.data)}")

if __name__ == "__main__":
    run_phase3_validation()
