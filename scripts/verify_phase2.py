import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.data.fastf1_client import get_session
from src.data.telemetry import get_driver_fastest_lap, get_lap_telemetry, align_telemetry
from src.analytics.delta_time import compute_delta_time
from src.analytics.corners import compute_corner_gaps
from src.analytics.sectors import compute_sector_deltas

def run_validation():
    print("=== Phase 2 Validation: Panels 6-8 ===")
    session = get_session(2023, "Bahrain", "R")
    session.load(telemetry=True, laps=True, weather=False)

    driver_a = "VER"
    driver_b = "ALO"

    lap_a = get_driver_fastest_lap(session, driver_a)
    lap_b = get_driver_fastest_lap(session, driver_b)

    official_time_a = lap_a['LapTime'].total_seconds()
    official_time_b = lap_b['LapTime'].total_seconds()
    official_gap = official_time_b - official_time_a

    print(f"Official Lap Time {driver_a} (Lap {lap_a['LapNumber']}): {official_time_a:.3f} s")
    print(f"Official Lap Time {driver_b} (Lap {lap_b['LapNumber']}): {official_time_b:.3f} s")
    print(f"Official Lap Time Gap ({driver_b} vs {driver_a}): {official_gap:+.3f} s\n")

    tel_a = get_lap_telemetry(lap_a)
    tel_b = get_lap_telemetry(lap_b)

    df_a, df_b, dist_grid = align_telemetry(tel_a, tel_b, num_points=1500)
    delta_df = compute_delta_time(df_a, df_b)

    # 1. Final distance delta time check
    end_delta_time = delta_df['DeltaTime'].iloc[-1]
    diff_between_delta_and_official = abs(end_delta_time - official_gap)

    print(f"1. Delta Time at end of distance grid ({dist_grid[-1]:.1f}m): {end_delta_time:+.3f} s")
    print(f"   Official Lap Gap: {official_gap:+.3f} s")
    print(f"   Difference: {diff_between_delta_and_official:.4f} s ({diff_between_delta_and_official*1000:.1f} ms)")
    
    if diff_between_delta_and_official <= 0.10:
        print("   >> CHECK 1 PASSED: End-of-lap delta time matches official gap within 0.1s!")
    else:
        print("   >> CHECK 1 FAILED: Delta time discrepancy > 0.1s.")

    # 2. Corner gaps check
    circuit_info = session.get_circuit_info()
    corner_gaps_df = compute_corner_gaps(delta_df, circuit_info.corners, driver_a=driver_a, driver_b=driver_b)
    
    print("\n--- Corner Gaps Summary ---")
    print(corner_gaps_df[['Corner', 'Distance (m)', 'Cumulative Delta (s)', 'Segment Delta (s)', 'Faster Driver']].to_string(index=False))

    sum_segment_deltas = corner_gaps_df['Segment Delta (s)'].sum()
    final_corner_cum_delta = corner_gaps_df['Cumulative Delta (s)'].iloc[-1]
    corner_sum_diff = abs(sum_segment_deltas - final_corner_cum_delta)

    print(f"\n2. Sum of Corner Segment Deltas: {sum_segment_deltas:+.3f} s")
    print(f"   Cumulative Delta at final corner ({corner_gaps_df['Corner'].iloc[-1]} @ {corner_gaps_df['Distance (m)'].iloc[-1]}m): {final_corner_cum_delta:+.3f} s")
    print(f"   Discrepancy: {corner_sum_diff:.4f} s")

    if corner_sum_diff <= 0.05:
        print("   >> CHECK 2 PASSED: Corner segment deltas sum to the final corner cumulative delta!")
    else:
        print("   >> CHECK 2 FAILED: Corner segments sum discrepancy > 0.05s.")

    # 3. Sector comparison
    sector_df = compute_sector_deltas(lap_a, lap_b, driver_a=driver_a, driver_b=driver_b)
    print("\n--- Official Sector Times ---")
    print(sector_df.to_string(index=False))

    sum_sector_deltas = sector_df['Delta (s)'].sum()
    print(f"\n3. Sum of Sector Deltas: {sum_sector_deltas:+.3f} s vs Official Lap Gap: {official_gap:+.3f} s")

if __name__ == "__main__":
    run_validation()
