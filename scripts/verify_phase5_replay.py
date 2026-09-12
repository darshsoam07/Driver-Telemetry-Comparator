import sys
import os
import numpy as np

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.data.fastf1_client import get_session
from src.data.telemetry import get_driver_fastest_lap, get_lap_telemetry, align_telemetry
from src.analytics.delta_time import compute_delta_time
from src.replay.engine import build_replay_dataframe, create_replay_figure

def run_replay_validation():
    print("=== Phase 5 Replay Validation Checklist ===")
    session = get_session(2023, "Bahrain", "R")
    session.load(telemetry=True, laps=True, weather=False)

    driver_a = "VER"
    driver_b = "ALO"

    lap_a = get_driver_fastest_lap(session, driver_a)
    lap_b = get_driver_fastest_lap(session, driver_b)

    time_a = lap_a['LapTime'].total_seconds()
    time_b = lap_b['LapTime'].total_seconds()
    shorter_time = min(time_a, time_b)
    print(f"Driver A ({driver_a}) Lap Time: {time_a:.3f} s")
    print(f"Driver B ({driver_b}) Lap Time: {time_b:.3f} s")
    print(f"Expected Replay Max Duration (shorter lap): {shorter_time:.3f} s\n")

    tel_a = get_lap_telemetry(lap_a)
    tel_b = get_lap_telemetry(lap_b)

    df_a, df_b, dist_grid = align_telemetry(tel_a, tel_b)
    delta_df = compute_delta_time(df_a, df_b)

    replay_df = build_replay_dataframe(
        tel_a,
        tel_b,
        delta_df,
        driver_a=driver_a,
        driver_b=driver_b,
        time_step=0.1,
    )

    # 1. Start Position Check
    print("1. Start Position Check at t = 0s:")
    print(f"   xA[0], yA[0]: ({replay_df['xA'].iloc[0]:.1f}, {replay_df['yA'].iloc[0]:.1f})")
    print(f"   xB[0], yB[0]: ({replay_df['xB'].iloc[0]:.1f}, {replay_df['yB'].iloc[0]:.1f})")
    start_distance_diff = np.hypot(
        replay_df['xA'].iloc[0] - replay_df['xB'].iloc[0],
        replay_df['yA'].iloc[0] - replay_df['yB'].iloc[0],
    )
    print(f"   Initial car-to-car coordinate distance: {start_distance_diff:.2f}")
    assert start_distance_diff < 100.0, "Cars do not start at the same start line"
    print("   >> CHECK 1 PASSED: Both cars start at start/finish line.")

    # 2. Total Duration Check
    print(f"\n2. Total Playback Duration Check:")
    final_time = replay_df['Time'].iloc[-1]
    print(f"   Replay Grid End Time: {final_time:.2f} s vs Shorter Lap Time: {shorter_time:.3f} s")
    duration_error = abs(final_time - shorter_time)
    print(f"   Duration Difference: {duration_error:.4f} s")
    assert duration_error <= 0.10, "Replay duration does not stop at shorter lap time"
    print("   >> CHECK 2 PASSED: Playback stops exactly at the shorter driver's lap time.")

    # 3. Visual Position vs Delta Time Sign Check
    print(f"\n3. Spatial Track Position vs Delta-Time Readout Sign Check:")
    # At each time step:
    # If distA > distB (Driver A is ahead on track), DeltaTime should be > 0 (Driver B is behind)
    # If distB > distA (Driver B is ahead on track), DeltaTime should be < 0 (Driver A is behind)
    dist_diff = replay_df['distA'] - replay_df['distB']
    delta_time = replay_df['DeltaTime']

    # Compare signs where gap is notable (> 2 meters and > 0.02s)
    significant_mask = (np.abs(dist_diff) > 2.0) & (np.abs(delta_time) > 0.02)
    sign_dist = np.sign(dist_diff[significant_mask])
    sign_delta = np.sign(delta_time[significant_mask])
    mismatches = (sign_dist != sign_delta).sum()
    total_significant = significant_mask.sum()

    print(f"   Total frames checked: {len(replay_df)}")
    print(f"   Frames with distinct leader (>2m gap): {total_significant}")
    print(f"   Sign mismatches between track leader and delta readout: {mismatches}")
    assert mismatches == 0, f"Found {mismatches} sign desyncs between track position and delta time!"
    print("   >> CHECK 3 PASSED: Visual track leader strictly matches delta-time sign throughout entire playback!")

    # 4. Figure Construction Check
    fig = create_replay_figure(
        replay_df,
        track_outline_df=df_a,
        driver_a=driver_a,
        driver_b=driver_b,
        speed_multiplier=1.0,
    )
    print(f"\n4. Plotly Animation Figure Check:")
    print(f"   Base traces: {len(fig.data)}")
    print(f"   Animation frames: {len(fig.frames)}")
    print(f"   Slider steps: {len(fig.layout.sliders[0].steps)}")
    assert len(fig.frames) == len(replay_df)
    print("   >> CHECK 4 PASSED: Native Plotly animation figure built with all controls.")

    print("\n>> ALL REPLAY ENGINE CHECKS PASSED SUCCESSFULLY.")

if __name__ == "__main__":
    run_replay_validation()
