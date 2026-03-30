# Project Guidelines

## Code Style
- Stay in the existing JavaScript + Vue 3 SFC stack unless the task explicitly requires something else.
- Prefer the current Vue patterns: route-level pages in `src/pages/`, reusable UI in `src/components/`, and client-side data helpers in `src/composables/`.
- Preserve the existing Chinese copy and naming unless the task is explicitly a content rewrite.

## Architecture
- This repo is a statically hosted Vite + Vue site. There is no backend; site content comes from files under `public/data/` and `public/stats/`.
- Treat [`../src/router.js`](../src/router.js) and [`../src/utils/seo.js`](../src/utils/seo.js) as linked sources of truth. When adding or renaming a page, keep route definitions, `.html` aliases, and page SEO metadata in sync.
- Use `old-html-ver/` as the migration baseline when reproducing legacy page structure, deep links, and behavior.
- If you add another iframe-style page like `doc`, `map`, or `photo`, update the layout exception in [`../src/App.vue`](../src/App.vue).

## Build And Validation
- Use `npm install`, `npm run dev`, `npm run build`, and `npm run preview` for normal frontend work.
- There is no automated test suite configured. For UI, router, SEO, or content changes, run `npm run build` as the default validation step.
- Only run `npm run update:stats` when the stats environment variables from [`workflows/deploy.yml`](workflows/deploy.yml) are available and Python dependencies (`requests`, `tqdm`) are installed.

## Conventions
- Preserve legacy `.html` route aliases for static-hosting compatibility.
- Keep shareable deep links and existing page information architecture intact. For site migration work, prioritize fidelity to the legacy site over redesign.
- Use `https://bailuyuan.lunadeer.cn` for canonical and site URLs. `mcpure.lunadeer.cn` is only the Minecraft server connection address, not the website canonical domain.
- Keep the existing data formats stable. If you change content consumed from static files, update all consumers consistently and check the format guidance in [`../README.md`](../README.md).
- Do not hand-edit generated player stats snapshots under `public/stats/`; regenerate them through the stats script instead.

## References
- See [`../README.md`](../README.md) for setup, data sources, and static hosting constraints.
- See [`../public/data/convention.md`](../public/data/convention.md) for the server covenant and moderation wording.
- See [`workflows/deploy.yml`](workflows/deploy.yml) for deployment automation and stats update requirements.
- For GEO or AI-search work, prefer the existing skill at [`skills/seo-geo/SKILL.md`](skills/seo-geo/SKILL.md) instead of duplicating that guidance here.