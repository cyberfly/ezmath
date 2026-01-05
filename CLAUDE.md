# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EzMath is a kid-friendly math learning game built with vanilla JavaScript. Kids practice addition, subtraction, multiplication, and division through multiple game modes with progress tracking.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Tech Stack

- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling (configured via @tailwindcss/vite plugin, no config file needed)
- **Alpine.js** - Reactivity and state management
- **@alpinejs/persist** - LocalStorage persistence for profiles

## Architecture

### State Management

The app uses Alpine.js global stores accessed via `$store`:

- **`$store.profile`** (`src/stores/profileStore.js`) - Multi-user profiles with stats persistence
- **`$store.game`** (`src/stores/gameStore.js`) - Game state, scoring, timer, level progression

Stores are registered in `src/main.js` and use `Alpine.$persist()` for localStorage.

### View System

Single-page app with view switching in `index.html`. Views are controlled by `x-data="{ view: 'home' }"` at the root and toggled with `x-show`:
- `home` - Profile selection/creation
- `menu` - Game mode selection
- `settings` - Difficulty/operation config
- `game` - Active gameplay
- `stats` - Profile statistics

### Utilities

- `src/utils/mathProblems.js` - Problem generation by difficulty/operation
- `src/utils/sounds.js` - Web Audio API sound effects (no external files)

### Key Patterns

- **Alpine x-data must be defined in main.js**, not inline in HTML templates
- Constants (`AVATARS`, `DIFFICULTY_CONFIG`, `OPERATION_SYMBOLS`) are exposed on `window` for template access
- Game modes: `practice` (endless), `timed` (countdown), `level` (progression)
- Difficulty levels: `easy`, `medium`, `hard` with different number ranges and operations
