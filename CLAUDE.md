# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```powershell
npm run dev        # Vite dev server (HMR)
npm run build      # tsc -b (typecheck, noEmit) then vite build
npm run lint       # eslint .
npm run preview    # serve dist/
```

There is **no test framework** in this project — no runner, no config, no test files. Don't invent `npm test`.

Component validation (AST check for a `*Props` interface + no hardcoded hex in `className`) lives in the vendored skill, not the root package:

```powershell
node .agents\skills\react-components\scripts\validate.js src\components\ui\IconButton.tsx
```

It needs `@swc/core`, declared in `.agents/skills/react-components/package.json` — run `npm install` inside that directory first. Skill docs and `resources/architecture-checklist.md` refer to `npm run validate`; that script does **not** exist in the root `package.json`.

### Environment notes for this machine

- `git` is **not** initialized here.
- The **Bash/msys tool is broken** (`add_item ... failed` fatal error). Use PowerShell. That also means `scripts/fetch-stitch.sh` cannot be run as-is.
- `npx` is blocked by PowerShell execution policy. Invoke tools through node directly:
  `& "C:\Program Files\nodejs\node.exe" ".\node_modules\typescript\bin\tsc" -b`
- **Never** round-trip source files through `Get-Content`/`Set-Content`. PS 5.1 reads as ANSI and writes UTF-8 with a BOM, which corrupts every non-ASCII character (`—` → `â€"`) and prepends a BOM that breaks the TS parser. Use the Edit/Write tools, or `[System.IO.File]::ReadAllText/WriteAllText` with an explicit `UTF8Encoding($false)`.
- Vite 8 bundles **rolldown, not esbuild**. To run a one-off TS script in node:
  `node .\node_modules\rolldown\bin\cli.mjs script.mts -d <outdir> --platform node --format esm`

## Architecture

Vite 8 + React 19 + TypeScript 6 + Tailwind **v4** + react-router-dom v7. Client-only SPA: no backend, no data fetching, no auth.

It is a **working music player** — real `HTMLAudioElement` playback, queue, shuffle/repeat, seeking, persistence — built on a static catalog.

### Layers, outermost first

```
src/data/mockData.ts     the entire catalog (tracks, albums, artists, playlists, genres, lyrics)
src/lib/catalog.ts       O(1) selectors over it — components never index the raw arrays
src/lib/audio/           imperative audio: engine.ts (HTMLAudioElement) + synth.ts (fallback)
src/context/             state: player, library, ui, toast
src/components/          layout/ · player/ · media/ · ui/
src/pages/               one file per route
```

### Playback (the part to understand first)

`src/context/PlayerProvider.tsx` is the **only** place that talks to the audio engine, and state flows one way:

```
UI → action → playerReducer (pure) → new state → effect → engine (imperative)
                     ↑                                        │
                     └──────── ENGINE_STATUS / NEXT ──────────┘
```

- **`src/context/playerReducer.ts`** is pure and has no React or audio imports — all queue semantics (advance, wrap, repeat-one, shuffle, reorder, removal) live here. This is the right place to change playback *behaviour*, and it is testable in isolation.
- The engine reports back through `ENGINE_STATUS` (buffering, autoplay-blocked, stream failure) and `NEXT` (track ended), so the UI can never drift from the actual audio element.
- **Effect order in `PlayerProvider` is load-bearing.** Engine wiring is declared first, then the state mirrors (`intentRef`/`stateRef`/`progressRef`), then load, then play/pause. `skipTransportRef` stops the play/pause effect from double-firing on the commit where a track loads. Reordering these effects will break autoplay or cause reload loops.
- **Three contexts, deliberately.** `PlayerSnapshotContext` (discrete state), `PlayerActionsContext` (stable — every action only dispatches or seeks), and `ProgressContext` (the clock, ~10Hz). Progress is separate so a playing track doesn't re-render every list on screen; this only works because `children` is a stable element, so don't move page content inside the provider's own JSX.
- **`QueueEntry` has a `key`** because the same track can appear in a queue twice. Address queue items by `key`, never by track id.
- **Synth fallback**: if a stream errors or doesn't become playable within 7s, the engine switches that track to a generative Web Audio voice (`synth.ts`) and keeps its own clock, so the transport, progress, seeking and auto-advance stay functional offline. `player.mode === 'synth'` / `player.errored` surface this in the UI as "Offline mix".

### Data

`src/data/mockData.ts` is the single source of static content, and it is relational — tracks carry `albumId`/`artistId` so album, artist, genre, playlist and search pages are all views over one dataset. Components must not hardcode strings, lists or image URLs.

Two invariants worth preserving:

- `Track.duration` is the **measured** length of the source MP3 (all SoundHelix samples, 192kbps CBR), so list times match what the seekbar reports. If you change a track's `src`, re-measure its duration.
- Every `genres[].name` must match a real `Track.genre`, or the browse tiles lead to empty pages.

### Persistence

Two independent localStorage keys via `src/lib/storage.ts` (namespaced, versioned, every read try/caught):

- `library` — likes (with `likedAt` timestamps), user playlists, follows, recents, search history.
- `session` — the queue, its exact shuffle permutation (stored as index positions into `order`), the current index, playhead, volume, shuffle and repeat. Restores **paused**, since browsers block autoplay without a gesture.

Bump `VERSION` in `storage.ts` when a persisted shape changes.

### Provider order

`Toast → Library → Ui → Player → Layout`. Player calls into Library (`recordPlay`), so it must sit inside it. `Layout` mounts the transport, queue panel, dialogs and global keyboard shortcuts, and lives inside every provider.

### Layout coupling

`Sidebar` is `fixed w-64`, `Header` is `fixed w-[calc(100%-16rem)]`, and `<main>` compensates with `ml-64 pt-24 pb-32` for the floating `NowPlayingBar`. Changing the sidebar width means changing all of them.

## Conventions

Match the existing components; `src/components/ui/IconButton.tsx` and `src/components/media/TrackRow.tsx` are good references. `resources/component-template.tsx` is the starting skeleton.

- `export interface [Name]Props { className?: string; ... }`, component typed `React.FC<Readonly<[Name]Props>>`, `className = ''` merged into the root element's template-literal class string. Both a named and a `default` export. JSDoc above the component.
- **Contexts are split in two files**: `xStore.ts` holds the context + hooks (no JSX), `XProvider.tsx` holds only the component. This keeps `react-refresh/only-export-components` quiet — don't merge them back.
- **Tailwind v4**: design tokens are CSS variables in the `@theme` block of `src/index.css` — that is what the `@tailwindcss/vite` plugin reads. `tailwind.config.js` is a leftover v3-style duplicate that is **not loaded**; prefer editing `src/index.css`, and if you touch the config keep it in sync rather than trusting it.
- Never write hex colors in `className` — use token classes (`bg-surface-container-low`, `text-on-surface-variant`, `text-tertiary`). The skill validator fails on hex.
- **No 1px borders for sectioning.** Separate regions with tonal shifts (`surface-container-lowest` → `surface` → `surface-container-low` → `surface-container-highest`). Borders are accents only.
- Icons are Material Symbols as text: `<span className="material-symbols-outlined">name</span>`, filled via `style={{ fontVariationSettings: "'FILL' 1" }}`. Manrope is the only font family.
- Dynamic Tailwind class strings must be **complete literals** so the scanner sees them — see the `GRIDS` map in `TrackList.tsx`. Never build a class name by concatenation.
- Utilities in `src/index.css`: `.glass-player`, `.text-glow`, `.no-scrollbar`, `.eq-bar`, `.animate-rise`, `.animate-fade`, plus a `prefers-reduced-motion` block. A global 200ms transition applies to every element but its `transition-property` list does **not** include `width` — animate `transform: scaleX()` for progress fills instead.
- Strict TS: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` (no enums, no parameter properties), `verbatimModuleSyntax` (use `import type`).
- `eslint-plugin-react-hooks` v7 is strict and its rules are **errors**: no `setState` in an effect body, no ref reads/writes during render. Derive from props/URL instead of mirroring into state (see `Header.tsx`, where the URL is the source of truth for the search query), and write ref mirrors inside effects.

## Stitch skills

`.agents/skills/` vendors three skills from `google-labs-code/stitch-skills` (pinned in `skills-lock.json`): `react:components` (design → React), `stitch-design` (prompt enhancement, screen generation, DESIGN.md synthesis), and `stitch-loop` (baton-passing build loop driven by `.stitch/next-prompt.md`, which does not exist yet). They call the Stitch MCP server in `.vscode/mcp.json` (VS Code-scoped; contains a plaintext API key). `.agents` is excluded from ESLint — it is upstream code.

The original designs live in `.stitch/`: `DESIGN.md` is the authoritative design-system spec ("Sonic Curator" — read it before changing anything visual), `designs/{home,search,library,player}.{html,png}` are the generated screens, and `metadata.json` holds the Stitch project/screen ids. Before re-downloading a design, check whether the local files exist and ask before overwriting.
