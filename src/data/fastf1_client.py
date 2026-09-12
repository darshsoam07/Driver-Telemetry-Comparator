import os
import fastf1

# Enable FastF1 disk cache pointing to cache/
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

try:
    fastf1.set_cache_dir(CACHE_DIR)
except AttributeError:
    fastf1.Cache.enable_cache(CACHE_DIR)

def get_session(year: int, gp: str, session_type: str):
    """Load and return a FastF1 Session object."""
    session = fastf1.get_session(year, gp, session_type)
    return session
