# Amiguesser (Next.js + Electron)

<img src="assets/logo.png" alt="Amiguesser Logo" width="50%" />

Desktop geography/year guessing game built with Next.js and packaged with Electron.

## Stack

- Next.js (App Router, TypeScript)
- Electron (secure preload + IPC)
- Leaflet + OpenStreetMap
- shadcn-style UI primitives

## Persistence Model

In Electron mode (`.exe` / `.dmg`):

- Game data is stored in the user app data directory (`app.getPath('userData')/data/timeguessr_data.json`).
- Images are saved as files in `app.getPath('userData')/data/images`.
- Data and images persist across app restarts and are not removed when the app closes.
- Data is retained as long as files remain on disk and user storage has capacity.

In browser mode:

- JSON import/export fallback is still available.

## Project Structure

- `app/`: Next.js renderer UI
- `components/teamguessr/`: tab UI components (`Admin`, `Play`, `Sets`)
- `hooks/use-teamguessr-game.ts`: game business logic
- `hooks/use-leaflet-maps.ts`: Leaflet lifecycle + marker orchestration
- `electron/main.js`: Electron main process and IPC handlers
- `electron/preload.js`: secure renderer bridge
- `types/electron.d.ts`: typed `window.electronAPI`

## Install

```bash
pnpm install
```

## Web Dev

```bash
pnpm dev
```

## Electron Dev

```bash
pnpm electron:dev
```

## Build Web (static export)

```bash
pnpm build:web
```

## Package Desktop App

Generate platform icons from `assets/logo.png` first:

```bash
pnpm icon:generate
```

Windows `.exe`:

```bash
pnpm dist:win
```

macOS `.dmg`:

```bash
pnpm dist:mac
```

Unpacked Electron build:

```bash
pnpm electron:build
```

## Rebuild Native Modules

```bash
pnpm rebuild
```

## Misc
Gameplay:
1. Choose 5 images of your mates, pick the location, give the image description and enter the year
2. Group them into a set. Create few sets if it's a competition
3. Once it's grouped, go to the Play tab and pick the game set that you want
4. Take notes of the score and see who's winning!
