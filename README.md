# Chaos Gambit

**Live demo:** [chaos-gambit-sable.vercel.app](https://chaos-gambit-sable.vercel.app)

Chaos Gambit is a browser-based chess playground with six local variants, configurable variant rules, an optional computer opponent in Classic Clash, and English and Arabic interface support. Games are played on one device; no account or API key is required.

## Game modes

- **Classic Clash** — standard chess with configurable clocks, local two-player play, or a lightweight local computer opponent. The computer opponent is available only in this mode and is not a rated chess engine.
- **Mystery Piece** — each player secretly selects a piece, then tries to identify the opponent's selection while playing.
- **Dice Gambit** — dice determine which piece types can move during a turn.
- **Spellbound** — use limited Freeze and Jump spells to change what can happen on the board.
- **King of the Hill** — win by reaching the center; the Workshop can expand the target area and control whether checkmate also wins.
- **Duck Chess** — move a chess piece, then reposition the duck blocker. Capturing the opposing king wins.

## Features

- The **Workshop** lets you tune clocks and mode-specific rules. Settings are saved in the browser and apply to new games.
- The **Archive** saves completed games locally and supports replay and PGN export.
- The interface supports English and Arabic. Chess coordinates such as `h6` and `g5` remain in English notation.
- Display settings include board themes and motion preferences.

## Run locally

You need Node.js and npm installed.

```bash
npm ci
npm run dev
```

Vite starts the development server on port `3000` by default. Open [http://localhost:3000](http://localhost:3000).

## Validate and preview a production build

```bash
npm run lint
npm run build
npx tsx src/game/variantSecurity.test.ts
npm run preview
```

The production build is written to `dist/`. Vite's preview server serves that build locally, on port `4173` by default.

## Project structure

```text
src/
  components/  Shared screens and interface components
  game/        Chess engine, variant rules, archive, and AI search
  modes/       Implementations of the six game modes
  assets/      Mode card artwork
```

The app uses React, TypeScript, Vite, Tailwind CSS, and Motion. Game preferences, variant settings, and archived matches are stored in the browser's local storage for that browser profile.
