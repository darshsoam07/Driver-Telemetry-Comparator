import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.data.fastf1_client import get_session
from src.data.telemetry import get_driver_fastest_lap, get_lap_telemetry, align_telemetry
from src.viz.panels import (
    plot_speed_overlay,
    plot_throttle_overlay,
    plot_brake_overlay,
    plot_gear_overlay,
    plot_drs_overlay,
)

def verify_phase1():
    print("Loading 2023 Bahrain GP Race...")
    session = get_session(2023, "Bahrain", "R")
    session.load(telemetry=True, laps=True, weather=False)

    driver_a = "VER"
    driver_b = "ALO"

    lap_a = get_driver_fastest_lap(session, driver_a)
    lap_b = get_driver_fastest_lap(session, driver_b)

    time_a = lap_a['LapTime'].total_seconds()
    time_b = lap_b['LapTime'].total_seconds()
    print(f"Driver A ({driver_a}): {lap_a['LapTime']} ({time_a:.3f} s, Lap {lap_a['LapNumber']})")
    print(f"Driver B ({driver_b}): {lap_b['LapTime']} ({time_b:.3f} s, Lap {lap_b['LapNumber']})")
    print(f"Gap ({driver_b} vs {driver_a}): {time_b - time_a:+.3f} s (Positive = {driver_a} was faster)")

    tel_a = get_lap_telemetry(lap_a)
    tel_b = get_lap_telemetry(lap_b)

    df_a, df_b, dist_grid = align_telemetry(tel_a, tel_b, num_points=1000)

    print(f"\nAligned Grid: {len(dist_grid)} points from 0 to {dist_grid[-1]:.1f} meters.")
    print(f"Driver A ({driver_a}) Mean Speed: {df_a['Speed'].mean():.2f} km/h, Max Speed: {df_a['Speed'].max():.2f} km/h")
    print(f"Driver B ({driver_b}) Mean Speed: {df_b['Speed'].mean():.2f} km/h, Max Speed: {df_b['Speed'].max():.2f} km/h")

    # Corner and Straight sample comparisons
    faster_points_a = (df_a['Speed'] > df_b['Speed']).sum()
    faster_points_b = (df_b['Speed'] > df_a['Speed']).sum()
    print(f"Distance points where {driver_a} is faster: {faster_points_a} ({faster_points_a/len(dist_grid)*100:.1f}%)")
    print(f"Distance points where {driver_b} is faster: {faster_points_b} ({faster_points_b/len(dist_grid)*100:.1f}%)")

    # Verify figures generate without error
    fig_speed = plot_speed_overlay(df_a, df_b, driver_a, driver_b)
    fig_throttle = plot_throttle_overlay(df_a, df_b, driver_a, driver_b)
    fig_brake = plot_brake_overlay(df_a, df_b, driver_a, driver_b)
    fig_gear = plot_gear_overlay(df_a, df_b, driver_a, driver_b)
    fig_drs = plot_drs_overlay(df_a, df_b, driver_a, driver_b)

    print("\nFigure Generation:")
    print(f"- Speed overlay traces: {len(fig_speed.data)}")
    print(f"- Throttle overlay traces: {len(fig_throttle.data)}")
    print(f"- Brake overlay traces: {len(fig_brake.data)}")
    print(f"- Gear overlay traces: {len(fig_gear.data)}")
    print(f"- DRS overlay traces: {len(fig_drs.data)}")

    print("\n>> VERIFICATION COMPLETE: All 5 figures generated cleanly on real aligned telemetry.")

if __name__ == "__main__":
    verify_phase1()
