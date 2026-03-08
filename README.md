# F2F 2025 TeamGuessr (Next.js)

This repository now runs as a Next.js frontend app.

## Tech

- Next.js (App Router)
- React
- Leaflet + OpenStreetMap tiles
- JSON file import/export for game data

## Project Structure

- `app/page.js`: Main game UI and all client-side game logic
- `app/layout.js`: Root layout and metadata
- `app/globals.css`: Global styles (includes Leaflet CSS import)
- `public/assets/`: Existing sample/exported assets copied for static hosting
- `f2f-teamguessr.html`, `dummy.js`, `style.css`: legacy static version kept for reference

## Run Locally

1. Install dependencies:

```bash
pnpm install
```

2. Start dev server:

```bash
pnpm dev
```

3. Open:

```text
http://localhost:3000
```

## Build

```bash
pnpm build
pnpm start
```

## Notes

- Data is still loaded/saved as JSON from the browser.
- The app uses File System Access API when available, with download fallback.
- The game logic and scoring were ported from the original static page.
