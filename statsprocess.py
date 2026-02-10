import os
import json
import requests
import re
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

BASE_URL = "http://x2.sjcmc.cn:15960/stats/"
STATS_DIR = "stats"
IMAGE_DIR = os.path.join(STATS_DIR, "images")

# Ensure directories exist
os.makedirs(STATS_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)

print("Fetching file list...")
try:
    response = requests.get(BASE_URL, timeout=10)
    response.raise_for_status()
    content = response.text
    # Regex for UUID.json
    files = re.findall(r'href="([0-9a-f-]{36}\.json)"', content)
    files = list(set(files))
    print(f"Found {len(files)} player stats files.")
except Exception as e:
    print(f"Error fetching file list: {e}")
    files = []

def get_player_name(uuid):
    # Try Ashcon first
    try:
        r = requests.get(f"https://api.ashcon.app/mojang/v2/user/{uuid}", timeout=5)
        if r.status_code == 200:
            return r.json().get('username')
    except:
        pass
    
    # Try Mojang Session
    try:
        r = requests.get(f"https://sessionserver.mojang.com/session/minecraft/profile/{uuid}", timeout=5)
        if r.status_code == 200:
            return r.json().get('name')
    except:
        pass
    
    return "Unknown"

def process_player(filename):
    uuid = filename.replace(".json", "")
    json_path = os.path.join(STATS_DIR, filename)
    # img_path = os.path.join(IMAGE_DIR, f"{uuid}.png") # No longer used
    
    print(f"Processing {uuid}...")

    # 1. Download/Load JSON
    data = None
    try:
        # Check if we already have it locally and it's valid, maybe skip download? 
        # User implies fetching updates, so we download.
        r = requests.get(BASE_URL + filename, timeout=10)
        if r.status_code == 200:
            data = r.json()
        else:
            print(f"Failed to download {filename}")
            return None
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
        return None

    if not data:
        return None

    # 2. Get Name
    # We can check if name is already in the processing file to avoid API calls if scraping repeatedly?
    # For this task, we assume we need to fetch it.
    # To save API calls, we could check if we have a saved version with a name.
    player_name = "Unknown"
    
    # Check if 'extra' exists in downloaded data (unlikely if strictly from server)
    # But checking if we have a local cache of this file with a name is smart
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                local_data = json.load(f)
                if 'extra' in local_data and local_data['extra'].get('player_name') != "Unknown":
                    player_name = local_data['extra']['player_name']
        except:
            pass

    if player_name == "Unknown":
        player_name = get_player_name(uuid)
        # Sleep slightly to be nice to APIs if meaningful massive parallel
        time.sleep(0.1)

    # 3. Download Avatar - SKIPPED to avoid rate limits
    # The frontend will handle dynamic loading of avatars using Minotar/Crafatar URLs.

    # 4. Calculate Stats
    stats = data.get('stats', {})
    
    # Walk
    # Handle both modern ':' and potentially flattened or different versions if necessary, 
    # but usually proper JSON has "minecraft:custom"
    # "minecraft:walk_one_cm"
    
    custom = stats.get('minecraft:custom', {})
    walk_cm = custom.get('minecraft:walk_one_cm', 0)
    
    def format_dist(cm):
        m = cm / 100
        if m < 1000:
            return f"{m:.1f} m"
        else:
            return f"{m/1000:.2f} km"

    walk_fmt = format_dist(walk_cm)

    # Mined
    mined = stats.get('minecraft:mined', {})
    total_mined = sum(mined.values())

    # Placed (Used)
    used = stats.get('minecraft:used', {})
    total_placed = sum(used.values())

    # Deaths (Killed By)
    killed_by = stats.get('minecraft:killed_by', {})
    total_deaths = sum(killed_by.values())

    # Inject into JSON
    data['extra'] = {
        'player_name': player_name,
        'formatted_walk': walk_fmt,
        'walk_cm': walk_cm,
        'total_mined': total_mined,
        'total_placed': total_placed,
        'total_deaths': total_deaths
    }

    # Save
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    return {
        'uuid': uuid,
        'name': player_name,
        'avatar': f"https://minotar.net/avatar/{player_name}/64" if player_name != "Unknown" else f"https://minotar.net/avatar/{uuid}/64",
        'stats': {
            'walk_fmt': walk_fmt,
            'walk_raw': walk_cm,
            'mined': total_mined,
            'placed': total_placed,
            'deaths': total_deaths
        }
    }

# Process in parallel
# Reduce max_workers to avoid hitting API limits too hard locally
results = []
with ThreadPoolExecutor(max_workers=4) as executor:
    # Process only first 50 for testing? No, user wants all.
    # But for a script I am writing for them, I should let them run it.
    # I will process ALL found files.
    results = list(executor.map(process_player, files))

results = [r for r in results if r is not None]

# Sort by name perhaps? Or just raw list.
results.sort(key=lambda x: x['name'])

summary = {
    'updated_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    'players': results
}

with open(os.path.join(STATS_DIR, 'summary.json'), 'w', encoding='utf-8') as f:
    json.dump(summary, f, ensure_ascii=False, indent=4)

print("Processing complete. Summary saved to stats/summary.json")
