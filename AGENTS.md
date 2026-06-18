# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3 + Vite SSG site for the Bailuyuan Minecraft server. Application code lives in `src/`: `components/` holds reusable UI, `pages/` maps to routes, `composables/` contains shared state/data helpers, `utils/` contains SEO and content utilities, and `styles/` plus `styles.css` hold global styling. Static runtime assets and content live in `public/`, especially `public/data/` for announcements, towns, facilities, sponsors, and docs, and `public/stats/` for generated player statistics. `scripts/statsprocess.py` updates stats data. Production output is written to `dist/`.

## Build, Test, and Development Commands

- `npm install` or `npm ci`: install Node dependencies; prefer `npm ci` in clean or CI environments.
- `npm run dev`: start the local Vite development server.
- `npm run build`: run `vite-ssg build` and generate the static site in `dist/`.
- `npm run preview`: preview the built site locally.
- `npm run update:stats`: run `python scripts/statsprocess.py` to refresh `public/stats/summary.json` and player JSON files.

## Coding Style & Naming Conventions

Use ES modules, Vue single-file components, and the existing Options/Composition patterns already present in nearby files. Name Vue components in PascalCase, for example `BaseButton.vue` or `TownDetailModal.vue`; name composables with `use`, for example `useTheme.js`. Keep route-level components under `src/pages/`. Use two-space indentation in JavaScript, Vue, JSON, and CSS. Preserve existing public data schemas instead of renaming fields casually.

## Testing Guidelines

There is currently no dedicated test script or framework in `package.json`. Before submitting changes, run `npm run build` as the baseline verification. For content-only edits, validate affected JSON or Markdown syntax and preview pages with `npm run dev` when practical. For stats updates, confirm required Python packages (`requests`, `tqdm`) and environment variables are available before running `npm run update:stats`.

## Commit & Pull Request Guidelines

Recent history uses short conventional prefixes such as `feat:` and `fix:`. Keep commit subjects imperative and specific, for example `fix: update maintenance schedule dates`. Pull requests should describe the user-visible change, list verification performed, and call out data updates under `public/data/` or generated stats changes under `public/stats/`. Include screenshots for visual page changes.

## Security & Configuration Tips

Do not commit secrets. Stats generation uses `STATS_BASE_URL`, optional `STATS_USER`, `STATS_PASS`, and CI secrets such as `INDEXNOW_KEY`. Keep deployment assumptions compatible with GitHub Pages, `CNAME`, `robots.txt`, `sitemap.xml`, and legacy `.html` route aliases.
