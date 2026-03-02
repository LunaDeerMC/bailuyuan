# Project Guidelines

## Code Style
- This repo is framework-free: plain HTML + CSS + vanilla JavaScript (`index.html`, `sponsor.html`, `stats.html`, `script.js`, `sponsor_script.js`, `stats_script.js`, `components.js`).
- Keep existing naming style: `camelCase` for JS functions/variables and descriptive DOM ids/classes (for example `fetchCrowdfunding`, `setupMobileMenu`, `#players-grid`).
- Preserve current formatting patterns: 4-space indentation in HTML/CSS, simple function-based JS (no classes/modules/build tooling).
- Reuse shared tokens in `style.css` (`:root` variables such as `--bg-color`, `--accent-color`) instead of introducing new ad-hoc styles.
- Keep page-local style overrides scoped to their page blocks; avoid broad visual refactors unless explicitly requested.
- Keep user-facing copy in Chinese unless the surrounding section is already English.

## Architecture
- Public pages are static entry points:
  - `index.html` + `script.js`: landing page, sponsors, fundraising progress, live server status.
  - `sponsor.html` + `sponsor_script.js`: donation total, sponsor list, search/filter, donation modal.
  - `stats.html` + `stats_script.js`: player leaderboard + searchable player cards + modal details.
- Shared structure is injected by `components.js` into `#navbar-component` / `#footer-component` and handles mobile menu/current-link highlighting.
- Shared visual system lives in `css/style.css`; page-specific styles live in `css/pages/` (for example `css/pages/sponsor.css`, `css/pages/stats.css`).
- Data flow for stats:
  1. `statsprocess.py` fetches raw player JSON files and writes normalized outputs to `stats/`.
  2. It generates `stats/summary.json` consumed by `stats_script.js` via `fetch('stats/summary.json')`.
  3. `stats_script.js` lazy-loads `stats/{uuid}.json` when opening player details.

## Build and Test
- No package manager/build step exists in this workspace.
- Local static preview:
  - `python3 -m http.server 8000`
  - open `http://localhost:8000/`
- Regenerate player summary data:
  - `python3 statsprocess.py`
- Python script dependencies are runtime imports in `statsprocess.py` (not pinned): `requests`, `tqdm`.

## Project Conventions
- Prefer progressive enhancement with `DOMContentLoaded` initializers (all page scripts and `components.js`).
- Keep network fetch paths relative for local assets (`data/fund_progress.txt`, `data/sponsors.txt`, `stats/summary.json`, `stats/{uuid}.json`).
- For unavailable remote APIs, follow existing behavior: log errors and render fallback text instead of throwing.
- Preserve current text-data contracts: `data/sponsors.txt` is parsed as comma-separated fields (`name, project, amount, [date]`), and `data/fund_progress.txt` is line-parsed by frontend scripts.
- Do not introduce bundlers/framework migrations unless explicitly requested.

## Integration Points
- External APIs/services currently used:
  - Server status: `https://api.mcstatus.io/v2/status/java/mcpure.lunadeer.cn`
  - Avatars: `https://minotar.net/...` and `https://crafatar.com/...`
  - Player name resolution in pipeline: Ashcon + Mojang Session APIs (`statsprocess.py`).
  - Source stats endpoint: `http://x2.sjcmc.cn:15960/stats/`.
- Navbar external links are centralized in `components.js` (outline docs, map, photo, QQ group).
- External assets are loaded directly from CDNs (Google Fonts, Font Awesome) and image hosts.

## Security
- Treat player UUID/name datasets in `stats/` as production content; avoid destructive bulk edits.
- Preserve SEO/verification metadata in page `<head>` blocks unless a task explicitly targets SEO.
- Avoid adding secrets/tokens to repository files; keep any future credentials out of static HTML/JS.
- Frontend rendering uses `innerHTML` with fetched txt/json content in several views; keep those data sources trusted or sanitize before accepting untrusted input.
