import os
import sys

# Ensure root directory is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.data.fastf1_client import get_session

def run_smoke_test():
    print("=== FastF1 Telemetry Smoke Test ===")
    print("Loading 2023 Bahrain Grand Prix Race session...")
    session = get_session(2023, "Bahrain", "R")
    session.load(telemetry=True, laps=True, weather=False)

    driver_code = "VER"
    print(f"Extracting laps for driver: {driver_code}...")
    driver_laps = session.laps.pick_driver(driver_code)
    
    fastest_lap = driver_laps.pick_fastest()
    print(f"Fastest lap time: {fastest_lap['LapTime']} (Lap {fastest_lap['LapNumber']})")

    print("Fetching merged lap telemetry...")
    telemetry = fastest_lap.get_telemetry()
    telemetry.add_distance()

    columns_to_show = ["Distance", "Speed", "Throttle", "Brake", "DRS", "nGear"]
    sample_df = telemetry[columns_to_show].dropna()

    # Pick 10 evenly spaced rows across the lap
    step = max(1, len(sample_df) // 10)
    sample_rows = sample_df.iloc[::step].head(10)

    print("\n--- Sample Telemetry Rows ---")
    print(sample_rows.to_string(index=False))

    # Sanity checks
    min_speed = telemetry["Speed"].min()
    max_speed = telemetry["Speed"].max()
    print(f"\nSpeed Range: {min_speed:.1f} km/h to {max_speed:.1f} km/h")
    
    if 0 <= min_speed and max_speed <= 360 and max_speed > 250:
        print(">> CHECKPOINT PASSED: Speed values are in a sane 0-350+ km/h range for a real F1 lap.")
    else:
        print(">> WARNING: Speed values outside expected range.")

if __name__ == "__main__":
    run_smoke_test()
