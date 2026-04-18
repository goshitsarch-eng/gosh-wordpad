# Changelog

## 3.2.0

### Security
- **Electron 40 → 41.2.1**: resolves 18+ HIGH-severity CVEs (context-isolation bypass via VideoFrame, use-after-free in permission/PowerMonitor/download callbacks, HTTP header injection, registry-key injection on Windows, AppleScript injection on macOS, and more)
- **Sandbox enabled** on the BrowserWindow renderer (`webPreferences.sandbox: true`) alongside existing `contextIsolation`/`nodeIntegration: false`
- **`shell.openExternal` scheme-checked**: `setWindowOpenHandler` now only hands off `http(s):` URLs, blocking `javascript:` / `file:` / `data:` URIs smuggled via opened HTML documents
- **CSP aligned**: the HTML `<meta>` CSP now matches the session HTTP-header CSP (adds `connect-src 'self' ws://localhost:*`) so Vite HMR isn't blocked and the two policies can't drift
- `npm audit`: 0 vulnerabilities (was 18+ HIGH on Electron 40 alone plus transitive HIGH/MODERATE in brace-expansion, minimatch, lodash, flatted, ajv, xmldom)

### Performance
- **Tooltip** cleans up its hover timer on unmount (prevents timer accumulation when toolbars re-render)
- **StatusBar** coalesces its five input/selection listeners through a single `requestAnimationFrame` scheduler; stats recompute at most once per frame instead of once per event
- **DialogBase** rAF-throttles `mousemove` during drag so position writes coalesce per frame
- **Editor** drops the redundant `onClick` handler (`onMouseUp` already covers it) — one fewer reducer dispatch per click
- **ToolbarButton** wrapped in `React.memo` so format-state changes no longer re-render the full toolbar cascade
- **Replace All** snapshots text nodes and processes them in 200-node batches via `requestIdleCallback` (fallback: `setTimeout`), keeping the UI responsive on large documents

### Dependencies
- electron 40 → 41.2.1
- vite 7 → 8.0.8, @vitejs/plugin-react 5 → 6.0.1
- typescript 5 → 6.0.3 (added `ignoreDeprecations: "6.0"` for `baseUrl`; added ambient `*.css` module declarations now required by TS 6 for side-effect CSS imports)
- eslint 9 → 10.2.1, @eslint/js 9 → 10.0.1, typescript-eslint → 8.58.2
- jsdom 28 → 29.0.2, vitest 4.0 → 4.1.4
- react / react-dom 19.2.4 → 19.2.5, @types/react → 19.2.14
- electron-builder → 26.8.1, prettier → 3.8.3

### Fixed
- **Test setup**: Node 22.4+ ships a built-in Web Storage API that shadowed jsdom's on `window`, breaking the view-store tests with `localStorage.clear is not a function`. Setup now installs an in-memory Storage polyfill on both the global and window so tests behave identically across Node versions.

## 3.1.3

### Fixed
- **AppImage launch crash**: Fix `electron-updater` ESM import — use default import since the package is CommonJS (`import pkg from 'electron-updater'`)

## 3.1.2

### Fixed
- **macOS build**: Remove missing `entitlements.mac.plist`, `hardenedRuntime`, and `icon.icns` references that caused codesign failure in CI

## 3.1.1

### Added
- **Font bundling**: Bundle Noto Sans (Regular + Bold) TTF fonts in `assets/fonts/` for systems missing standard fonts
- **Fontconfig integration**: Linux fontconfig setup that writes a temporary XML config pointing Chromium/Skia to bundled fonts, ensuring correct rendering on immutable distros (Bazzite, Fedora Atomic)
- **Auto-updater**: `electron-updater` integration for automatic updates on AppImage (Linux) and NSIS (Windows) builds
- **AppImage builds**: Added AppImage to Linux CI build targets
- **macOS CI builds**: Added macOS arm64 build job to CI workflow
- **Noto Sans CSS fallbacks**: Added `@fontsource/noto-sans` woff2 imports and `'Noto Sans'` fallback across all sans-serif `font-family` declarations

### Fixed
- **Repository URLs**: Corrected `homepage` and `repository.url` from `Gosh-Wordpad-Clone` to `gosh-wordpad` (was causing 404 on auto-update checks)

### Changed
- **CI workflow**: Rewritten `.github/workflows/build.yml` with multi-platform matrix (Linux x64/arm64, Windows x64/arm64, macOS arm64) and GitHub release job
- **Publish config**: Replaced `"publish": null` with GitHub provider config for `electron-updater`
- **extraResources**: Added font bundling via `extraResources` in electron-builder config
