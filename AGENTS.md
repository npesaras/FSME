# AI Guide (Nuxt 4 Workspace)

## Purpose
Use this file as the first-stop map for where to look, which skill to use, and which commands matter.

## File Routing
- `app/app.vue`: root app shell
- `app/pages/`: route pages (file-based routing)
- `app/components/`: shared UI components
- `app/composables/`: reusable composables
- `app/assets/`: global styles/assets (register CSS in `nuxt.config.ts`)
- `public/`: static files (`favicon.ico`, `robots.txt`, etc.)
- `nuxt.config.ts`: Nuxt modules, build/runtime config
- `specs/`: project notes/spec docs (not executable tests)

## Skills To Use
- `.codex/skills/nuxt/SKILL.md`
Use for Nuxt architecture, routing, server routes, rendering, data fetching, modules, config.

- `.codex/skills/nuxt-ui/SKILL.md`
Use for `@nuxt/ui` components, theming, forms, and layout patterns.

## Important Commands
Run from repository root:
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run generate`

## Important Notes
- Do not edit generated folders: `.nuxt/`, `.output/`, `node_modules/`.
- Keep code style consistent: 2-space indent, concise SFCs, PascalCase components, camelCase vars/functions.
- Before finalizing changes, verify with `npm run build` and `npm run preview`.
- Keep framework-level config changes in `nuxt.config.ts` intentional and documented.
