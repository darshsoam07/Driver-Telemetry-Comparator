"""Cumulative delta time calculation across the shared distance grid."""
import numpy as np
import pandas as pd

def compute_delta_time(df_a: pd.DataFrame, df_b: pd.DataFrame) -> pd.DataFrame:
    """
    Compute cumulative time delta vs distance:
    dt(d) = cumulative_time_B(d) - cumulative_time_A(d)
    
    Positive delta means Driver B has taken more cumulative time (Driver A is ahead).
    Negative delta means Driver B has taken less cumulative time (Driver B is ahead).
    """
    if 'Distance' not in df_a.columns or 'TimeInSeconds' not in df_a.columns:
        raise ValueError("df_a must contain 'Distance' and 'TimeInSeconds' columns")
    if 'Distance' not in df_b.columns or 'TimeInSeconds' not in df_b.columns:
        raise ValueError("df_b must contain 'Distance' and 'TimeInSeconds' columns")

    delta_time = df_b['TimeInSeconds'].to_numpy() - df_a['TimeInSeconds'].to_numpy()

    return pd.DataFrame({
        'Distance': df_a['Distance'],
        'DeltaTime': delta_time,
        'Time_A': df_a['TimeInSeconds'],
        'Time_B': df_b['TimeInSeconds'],
    })
