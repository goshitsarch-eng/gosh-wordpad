# Gosh WordPad

A faithful recreation of Windows 98's WordPad, built with Electron, React 19, and TypeScript. It looks and feels like the real thing — toolbar, format bar, ruler, status bar — just running on modern tech.

![License](https://img.shields.io/github/license/goshitsarch-eng/gosh-wordpad)

## What It Does

Gosh WordPad is a rich text editor that supports **HTML** (.html, .htm) and **plain text** (.txt) files. There is no RTF support. The editor uses a `contentEditable` div backed by `document.execCommand` — deprecated but still functional in all major browsers. The command layer is centralized in `editor-commands.ts` to make a future migration straightforward.

Rich text formatting includes bold, italic, underline, strikethrough, font family and size, font color, text alignment (left, center, right), and bullet lists. Font sizes map to the browser's 1–7 scale (roughly 8pt to 72pt), which is a lossy conversion — don't expect pixel-perfect fidelity to the original.

## Features

The app ships with most of the dialogs you'd expect: Find, Replace, Font, Color, Date/Time, Paragraph (alignment only), and About. A few dialogs — Page Setup, Options, and Tabs — have full UI but their OK buttons don't do anything yet. They're stubs waiting for implementation.

Other things that work: dark mode (persisted in localStorage), toggling the toolbar/format bar/ruler/status bar (also persisted), word and line/column counts in the status bar, a right-click context menu with undo/redo/clipboard/select-all, printing via `window.print()`, and opening external links in the default browser.

The ruler is decorative. It looks right but the indent markers aren't draggable. A few menu items — Send, Links, and Object Properties — are permanently disabled. Insert Object shows a placeholder message.

The HTML sanitizer strips scripts, iframes, and event handlers when opening files.

## Keyboard Shortcuts

The editor responds to these shortcuts (defined in `Editor.tsx`):

| Shortcut | Action |
|---|---|
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+U | Underline |
| Ctrl+L | Align left |
| Ctrl+E | Align center |
| Ctrl+R | Align right |

Standard clipboard shortcuts (Ctrl+C/X/V), undo/redo (Ctrl+Z/Y), and file operations (Ctrl+N/O/S) are handled through the menu bar.

## Tech Stack

- **Electron 40** — desktop shell
- **React 19** + **React DOM 19** — the only runtime dependencies
- **Vite** + **@vitejs/plugin-react** — build tooling
- **TypeScript** — strict mode, everywhere
- **Vitest** + **@testing-library/react** + **jsdom** — testing
- **ESLint** + **Prettier** — linting and formatting
- **electron-builder** — packaging and distribution

State management uses a custom store system in `src/lib/stores/create.ts` — a lightweight pattern built on `useSyncExternalStore`, no external state library needed.

## Project Structure

```
electron/
  main.ts          # Main process (ESM)
  preload.cts      # Preload script (CommonJS — .cts is intentional)
src/
  components/      # React components (Editor, MenuBar, dialogs, etc.)
  lib/
    stores/        # Custom store system (document, editor, view, dialogs, message)
    editor-commands.ts
    sanitize.ts
    platform.ts
dist/              # Vite build output (frontend)
dist-electron/     # Compiled Electron code
release/           # Packaged app output
```

The preload script uses the `.cts` extension to force CommonJS output. This is required — ESM preload scripts silently fail in Electron, leaving `window.electronAPI` undefined and breaking all file operations without any visible error.

## Requirements

- **Node.js >= 20.0.0**
- **npm** (ships with Node)

## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/goshitsarch-eng/gosh-wordpad.git
cd gosh-wordpad
npm install
```

To launch the desktop app in development mode:

```bash
npm run electron:dev
```

This builds the frontend with Vite, compiles the Electron TypeScript, and launches the app. If you just want the browser-only dev server (no Electron shell), run `npm run dev` and open `http://localhost:5173`.

## NPM Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server on port 5173 (browser only, no Electron) |
| `npm run build` | Type-checks frontend, builds with Vite, compiles Electron code |
| `npm run electron:dev` | Builds everything and launches the Electron app |
| `npm run electron:build` | Full production build + packages with electron-builder |
| `npm test` | Runs the test suite once with Vitest |
| `npm run test:watch` | Runs Vitest in watch mode |
| `npm run lint` | Lints `src/` and `electron/` with ESLint |
| `npm run format` | Formats source with Prettier (note: currently misses `.cts` files) |

## Platform Support

The app runs on Linux, Windows, and macOS. Platform-specific behavior:

- **Linux**: Appends `ozone-platform-hint=auto` for Wayland compatibility. Packages as AppImage, deb, rpm, and tar.gz.
- **Windows**: NSIS installer. Standard app menu behavior.
- **macOS**: DMG for both x64 and arm64. Sets the standard macOS application menu. Hardened runtime with entitlements.
- **Other platforms**: The app menu is removed entirely.

CI builds target Linux (x64 + arm64) and Windows (x64 + arm64). There is currently no macOS CI job.

## Tests

Eight test files cover the stores, sanitizer, platform detection, editor ref handling, and editor commands. Run them with:

```bash
npm test
```

Tests use Vitest with jsdom as the browser environment.

## Building for Production

See [BUILDING.md](BUILDING.md) for the full build pipeline, packaging details, and platform-specific notes (including macOS code signing).

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
