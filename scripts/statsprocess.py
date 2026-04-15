import json
import os
import re
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from tqdm import tqdm
from urllib3.util.retry import Retry

PROJECT_ROOT = Path(__file__).resolve().parent.parent
STATS_DIR = PROJECT_ROOT / "public" / "stats"
MAX_WORKERS = max(4, min(16, int(os.environ.get("STATS_MAX_WORKERS", (os.cpu_count() or 4) * 2))))

BASE_URL = os.environ.get("STATS_BASE_URL", "").rstrip("/")
if BASE_URL:
    BASE_URL += "/"

STATS_USER = os.environ.get("STATS_USER", "")
STATS_PASS = os.environ.get("STATS_PASS", "")
BASE_AUTH = (STATS_USER, STATS_PASS) if STATS_USER else None

retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
)
thread_local = threading.local()


def create_session():
    session = requests.Session()
    session.trust_env = False
    adapter = HTTPAdapter(
        max_retries=retry_strategy,
        pool_connections=MAX_WORKERS,
        pool_maxsize=MAX_WORKERS,
    )
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def get_session():
    session = getattr(thread_local, "session", None)
    if session is None:
        session = create_session()
        thread_local.session = session
    return session


def load_name_cache():
    summary_path = STATS_DIR / "summary.json"
    if not summary_path.exists():
        return {}

    try:
        with summary_path.open("r", encoding="utf-8") as file_handle:
            summary = json.load(file_handle)
    except Exception:
        return {}

    return {
        player.get("uuid"): player.get("name")
        for player in summary.get("players", [])
        if player.get("uuid") and player.get("name") and player.get("name") != "Unknown"
    }


def get_player_name(uuid):
    try:
        response = get_session().get(f"https://api.ashcon.app/mojang/v2/user/{uuid}", timeout=5)
        if response.status_code == 200:
            return response.json().get("username")
    except Exception:
        pass

    try:
        response = get_session().get(
            f"https://sessionserver.mojang.com/session/minecraft/profile/{uuid}",
            timeout=5,
        )
        if response.status_code == 200:
            return response.json().get("name")
    except Exception:
        pass

    return "Unknown"


def format_dist(cm):
    meters = cm / 100
    if meters < 1000:
        return f"{meters:.1f} m"
    return f"{meters / 1000:.2f} km"


def format_time(ticks):
    seconds = ticks / 20
    if seconds < 60:
        return f"{seconds:.3f} 秒"

    minutes = seconds / 60
    if minutes < 60:
        return f"{minutes:.3f} 分钟"

    hours = minutes / 60
    if hours < 24:
        return f"{hours:.3f} 小时"

    return f"{hours / 24:.3f} 天"


def process_player(filename, name_cache):
    uuid = filename.replace(".json", "")
    json_path = STATS_DIR / filename

    try:
        response = get_session().get(f"{BASE_URL}{filename}", timeout=10, auth=BASE_AUTH)
        response.raise_for_status()
        data = response.json()
    except Exception as exc:
        print(f"Error downloading {filename}: {exc}")
        return None

    player_name = name_cache.get(uuid, "Unknown")
    if player_name == "Unknown":
        player_name = get_player_name(uuid)

    stats = data.get("stats", {})
    custom = stats.get("minecraft:custom", {})
    
    walk_cm = custom.get("minecraft:walk_one_cm", 0)
    avuate_cm = custom.get("minecraft:aviate_one_cm", 0)
    fly_cm = custom.get("minecraft:fly_one_cm", 0)
    sprint_cm = custom.get("minecraft:sprint_one_cm", 0)
    minecart_cm = custom.get("minecraft:minecart_one_cm", 0)
    fall_cm = custom.get("minecraft:fall_one_cm", 0)
    walk_under_water_cm = custom.get("minecraft:walk_under_water_one_cm", 0)
    walk_on_water_cm = custom.get("minecraft:walk_on_water_one_cm", 0)
    boat_cm = custom.get("minecraft:boat_one_cm", 0)
    climb_cm = custom.get("minecraft:climb_one_cm", 0)
    swim_cm = custom.get("minecraft:swim_one_cm", 0)
    horse_cm = custom.get("minecraft:horse_one_cm", 0)
    happy_cm = custom.get("minecraft:happy_ghast_one_cm", 0)
    crouch_cm = custom.get("minecraft:crouch_one_cm", 0)
    travel_cm = walk_cm + avuate_cm + fly_cm + sprint_cm + minecart_cm + fall_cm + walk_under_water_cm + walk_on_water_cm + boat_cm + climb_cm + swim_cm + horse_cm + happy_cm + crouch_cm
    
    play_time_ticks = custom.get("minecraft:play_time", 0)
    total_mined = sum(stats.get("minecraft:mined", {}).values())
    total_placed = sum(stats.get("minecraft:used", {}).values())
    total_deaths = sum(stats.get("minecraft:killed_by", {}).values())
    total_kills = sum(stats.get("minecraft:killed", {}).values())

    data["extra"] = {
        "player_name": player_name,
        "formatted_travel": format_dist(travel_cm),
        "travel_cm": travel_cm,
        "total_mined": total_mined,
        "total_placed": total_placed,
        "total_deaths": total_deaths,
        "total_kills": total_kills,
        "play_time_fmt": format_time(play_time_ticks),
        "play_time_ticks": play_time_ticks,
    }

    with json_path.open("w", encoding="utf-8") as file_handle:
        json.dump(data, file_handle, ensure_ascii=False, indent=4)

    return {
        "uuid": uuid,
        "name": player_name,
        "avatar": f"https://minotar.net/avatar/{player_name}/64"
        if player_name != "Unknown"
        else f"https://minotar.net/avatar/{uuid}/64",
        "stats": {
            "travel_fmt": format_dist(travel_cm),
            "travel_raw": travel_cm,
            "mined": total_mined,
            "placed": total_placed,
            "deaths": total_deaths,
            "kills": total_kills,
            "play_time_fmt": format_time(play_time_ticks),
            "play_time_raw": play_time_ticks,
        },
    }


def main():
    STATS_DIR.mkdir(parents=True, exist_ok=True)

    if BASE_AUTH:
        print(f"Using authentication for BASE_URL (user: {STATS_USER})")
    else:
        print("No STATS_USER/STATS_PASS set, accessing BASE_URL without auth.")

    if not BASE_URL:
        raise SystemExit("STATS_BASE_URL is not set.")

    print("Fetching file list...")
    fetch_failed = False
    files = []

    try:
        response = get_session().get(BASE_URL, timeout=10, auth=BASE_AUTH)
        response.raise_for_status()
        files = sorted(set(re.findall(r'href="([0-9a-f-]{36}\.json)"', response.text)))
        print(f"Found {len(files)} player stats files.")
    except Exception as exc:
        print(f"Error fetching file list: {exc}")
        fetch_failed = True

    if fetch_failed:
        raise SystemExit(1)

    name_cache = load_name_cache()
    results = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_map = {
            executor.submit(process_player, filename, name_cache): filename
            for filename in files
        }
        for future in tqdm(as_completed(future_map), total=len(future_map), desc="Processing players"):
            try:
                result = future.result()
            except Exception as exc:
                print(f"Worker failed for {future_map[future]}: {exc}")
                continue

            if result is not None:
                results.append(result)

    results.sort(key=lambda item: item["name"])
    summary = {
        "updated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "players": results,
    }

    with (STATS_DIR / "summary.json").open("w", encoding="utf-8") as file_handle:
        json.dump(summary, file_handle, ensure_ascii=False, indent=4)

    print(f"Processing complete. Summary saved to {STATS_DIR / 'summary.json'}")


if __name__ == "__main__":
    main()