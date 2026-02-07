# Gosh WordPad -- Improvement Plan

**Review date:** 2026-02-07
**Reviewers:**

| Name | Role |
|---|---|
| Daisy | UX |
| Socrates | Architecture |
| Catherine | Devil's Advocate |
| Vaughan | Cross-Platform |

**Stack:** React 19 / Electron 40 / Vite 7 / TypeScript 5.9

This document tracks every issue identified during the team review, organized into a phased remediation plan. Phases are ordered by dependency and severity: build blockers and security holes first, data safety second, then outward through platform, UX, architecture, and polish.

---

## Strategic Decision: Formatting Persistence

> **The core problem (flagged by all four reviewers):**
> Rich text formatting never persists to disk. The save path reads from `editor.innerText`, which strips all HTML/formatting. Bold, italic, font, and color changes are silently destroyed on every save. The application presents itself as a rich text editor but functions as a broken plain-text editor.

**Affected code:** `src/lib/electron-api.ts` (`AppAPI.getContent()`), `src/components/layout/MenuBar.tsx` (open handler sets `editor.innerText`), `src/components/layout/Toolbar.tsx` (same pattern).

### Two paths forward

| Option | Approach | Effort | Trade-offs |
|---|---|---|---|
| **A. Embrace plain text** | Remove all formatting UI. Rename to "Gosh Notepad." Save/load as `.txt` only. | Low (~1 week) | Abandons the WordPad premise entirely. |
| **B. Implement a real rich-text engine** | Replace `contentEditable` + `document.execCommand` with Tiptap (ProseMirror) or Lexical. Serialize to HTML or RTF on save; deserialize on open. | High (~3-5 weeks) | Solves the core promise of the app. Requires rework of editor store, format bar bindings, and all `execCommand` call sites. |

**Recommendation:** Option B. The project markets itself as a WordPad clone. Adopt Tiptap with an HTML serialization layer (RTF export can follow later). This also resolves issue #8 (`execCommand` deprecation) as a side effect.

The chosen path directly affects Phase 1 (data safety) and Phase 4 (architecture). All other phases can proceed independently.

---

## Phase 0: Build Fixes & Quick Security Wins

Items that are broken right now -- builds fail, or trivially exploitable security gaps exist. No feature work should start until these are resolved.

- [x] **[#3] Create `build/` icon directory with required assets** -- `package.json:59`, `electron/main.ts:18`. The `electron:build` script references `build/icon.png`, `build/icon.ico`, `build/icon.icns`, and `build/icons/` (Linux), but no `build/` directory exists. Create the directory and add placeholder icons in all required formats (PNG, ICO, ICNS, plus multiple-resolution PNGs for Linux).

- [x] **[#4] Add Windows `.ico` file** -- `package.json:62`. Windows NSIS builds fail because `build/icon.ico` is missing. Generate a multi-resolution `.ico` (16/32/48/256px) from the existing `wordpadimage.png` or a purpose-built icon.

- [x] **[#5] Add macOS hardened runtime and entitlements** -- `package.json:63-65`, `BUILDING.md`. The `mac` build config specifies only `"target": "dmg"` with no `hardenedRuntime`, `gatekeeperAssess`, or `entitlements` keys. The app will crash or be quarantined on macOS 10.15+. Add `hardenedRuntime: true` and a minimal `entitlements.plist` with `com.apple.security.cs.allow-jit`.

- [x] **[#1] Validate file paths in `fs:read` / `fs:write` IPC handlers** -- `electron/main.ts:94-100`. Both handlers accept arbitrary paths from the renderer with zero validation. A compromised renderer (or XSS) can read/write any file the user can access. Fix: resolve the path, reject traversal (e.g., `..`), and restrict operations to a known safe directory or paths previously returned by `dialog:open` / `dialog:save`.

- [x] **[#6] Add Content Security Policy** -- `src/index.html`, `electron/main.ts`. No CSP `<meta>` tag or `session.defaultSession.webRequest` CSP header exists. Add a strict CSP that blocks `unsafe-inline` scripts (use nonces or hashes for Vite-injected scripts in dev), restricts `connect-src`, and blocks remote resource loading in production.

- [x] **[#18] Replace synchronous `fs` calls with async equivalents** -- `electron/main.ts:62,95,99`. `readFileSync` and `writeFileSync` block the Electron main process, freezing the entire application on large files. Replace with `fs.promises.readFile` / `fs.promises.writeFile` (the handlers are already `async` functions, so this is a one-line change per call).

- [x] **[#19] Reconcile Node.js version requirement** -- `package.json:32`. `engines.node` declares `>=24.13.0`, but CI (if any) uses Node 20, and most users will not have Node 24. Either lower the requirement to `>=20.0.0` (if the codebase runs on 20) or update CI to match. Test the build on the declared minimum version.

---

## Phase 1: Data Safety

Prevent users from losing work. This is the highest-impact user-facing phase.

- [x] **[CORE] Persist rich-text formatting on save** -- `src/lib/electron-api.ts` (`getContent`), `src/components/layout/MenuBar.tsx:113-124`, `src/components/layout/Toolbar.tsx:13-24`. The content getter returns `editor.innerText`, which strips all formatting. After the strategic decision (see above), implement one of: (a) serialize editor HTML via `editor.innerHTML` with sanitization, or (b) integrate Tiptap/Lexical and serialize through its API. Update the open path to deserialize accordingly. Until this is fixed, formatting features are misleading.

- [x] **[#2] Prompt to save on window close** -- `electron/main.ts` (missing `close` handler). Clicking the OS close button (X) or using Alt+F4 bypasses the save prompt because there is no `mainWindow.on('close', ...)` handler. Add a `close` event listener that sends an IPC message to the renderer, lets `AppAPI.exitApp()` logic run, and only calls `event.preventDefault()` / allows close based on the user's response.

---

## Phase 2: Platform Compliance

Make the application behave correctly on Windows, macOS, and Linux.

- [x] **[#12] Show platform-correct modifier keys in shortcut labels** -- `src/components/layout/MenuBar.tsx:11-67`, `src/components/layout/FormatBar.tsx`, `src/components/layout/Toolbar.tsx`. All shortcut labels are hardcoded as `"Ctrl+X"`. On macOS, display `"Cmd+X"` (or the unicode glyph `\u2318`). Detect `navigator.platform` or `process.platform` at startup and apply a mapping function to all shortcut strings.

- [x] **[#13] Provide a native application menu on macOS** -- `electron/main.ts:37`. `Menu.setApplicationMenu(null)` removes the menu bar entirely, which breaks standard macOS conventions (no "Quit" in app menu, no "Edit" for system text services, no "Window" menu). On `darwin`, build and set a minimal native menu with the standard roles (`appMenu`, `editMenu`, `windowMenu`).

- [x] **[#14] Use cross-platform font fallbacks** -- `src/components/layout/FormatBar.tsx:6-9`, `src/components/dialogs/FontDialog.tsx:7`. The font lists include Windows-specific fonts (`MS Sans Serif`, `Comic Sans MS`, `Tahoma`) that are unavailable on Linux and may be unavailable on macOS. Detect available fonts at runtime (via `document.fonts.check()`) and filter the list, or provide sensible CSS fallback stacks.

- [x] **[#15] Remove unsupported format filters or implement parsing** -- `electron/main.ts:53,55,69,73`. The open/save dialogs advertise RTF and DOC filters, but the app cannot parse or produce either format. Users who open an `.rtf` file see raw RTF markup. Either remove these filters (short-term) or implement an RTF parser (long-term, pairs well with the Tiptap migration).

- [x] **[#29] Open external links in the default browser** -- `src/components/dialogs/AboutDialog.tsx:21`. The GitHub link uses `target="_blank"`, which in Electron opens a new BrowserWindow (not the user's browser). Use `shell.openExternal()` via an IPC call, or intercept `will-navigate` / `new-window` events in `electron/main.ts` and redirect to `shell.openExternal`.

- [x] **[#30] Add Wayland configuration for Linux** -- `electron/main.ts`. Electron requires `--ozone-platform-hint=auto` (or `wayland`) for native Wayland support on modern Linux desktops. Pass this flag via `app.commandLine.appendSwitch` before the app is ready, or document the `ELECTRON_OZONE_PLATFORM_HINT` env var.

- [x] **[#39] Add Linux desktop integration metadata** -- `package.json` (`build.linux`). The Linux build config has no `category`, `mimeTypes`, or desktop file metadata. Add at minimum `category: "Utility;TextEditor;"` and appropriate MIME types (`text/plain`, `text/rtf`, `application/rtf`) so the app integrates with file managers and application menus.

- [x] **[#40] Produce universal macOS binary** -- `package.json:65`. The mac target is `"dmg"` with no architecture specified, which produces an x64-only build. Set `"target": [{ "target": "dmg", "arch": ["x64", "arm64"] }]` or `"arch": "universal"` for a single fat binary.

---

## Phase 3: UX Integrity

Stop presenting UI elements that lie to the user or do nothing.

- [x] **[#7] Wire up or disable non-functional dialogs** -- `src/components/dialogs/PageSetupDialog.tsx`, `OptionsDialog.tsx`, `TabsDialog.tsx`, `ParagraphDialog.tsx`. These dialogs accept input (margins, indents, tab stops) but the OK button discards all values. Either connect them to the editor (paragraph indents, tab stops) or disable the controls and show "Not yet implemented" until they are functional.

- [x] **[#11] Replace native `alert()` calls with themed dialogs** -- `src/components/layout/MenuBar.tsx:152,158`, `src/components/dialogs/ReplaceDialog.tsx:60`, `src/components/dialogs/FindDialog.tsx`. Error and informational messages use `window.alert()`, which breaks the Win98 aesthetic and blocks the main thread. Create a reusable `<MessageDialog>` component styled to match the existing dialog system.

- [x] **[#16] Show useful information in StatusBar** -- `src/components/layout/StatusBar.tsx`. The status bar permanently displays "For Help, press F1" and nothing else. Add line number, column number, word count, and/or character count. Listen to selection/input events on the editor to update these values.

- [x] **[#20] Initialize FontDialog from current selection formatting** -- `src/components/dialogs/FontDialog.tsx:22-27`. The dialog always opens with hardcoded defaults (`MS Sans Serif`, `normal`, `10`, `#000000`) regardless of what is selected in the editor. Read the current format state from the `editorStore` (or query it fresh) and use those values as initial state.

- [x] **[#21] Show replacement count after Replace All** -- `src/components/dialogs/ReplaceDialog.tsx:72-95`. `replaceAll()` performs replacements but gives the user no feedback on how many were made. Count matches and display the total via the new themed message dialog (see #11).

- [x] **[#22] Preserve search term when Find/Replace dialog reopens** -- `src/components/dialogs/ReplaceDialog.tsx:38-41`, `FindDialog.tsx`. `findInput` is initialized as `useState('')` every time the component mounts, losing the previous search term. Read the last search term from `documentStore.lastSearchTerm` as the initial value, or lift the dialog state so it survives unmounting.

- [x] **[#23] Connect Ruler indent markers to the editor** -- `src/components/layout/Ruler.tsx`. The ruler renders draggable indent markers, but dragging them has no effect on text layout. Either wire the drag positions to CSS `margin-left`/`text-indent` on the editor (or paragraphs), or remove the drag affordance to avoid misleading users.

- [x] **[#24] Prevent dark-mode flash on page load** -- `src/index.html`, `src/main.tsx`, `src/lib/stores/view.ts`. The theme preference is read from `localStorage` inside React, so there is a visible flash of light mode on load. Inject a blocking `<script>` in `index.html` (before React) that reads `localStorage` and sets a `data-theme` attribute on `<html>` synchronously.

- [x] **[#33] Show unsaved-changes indicator in the editor area** -- `src/components/editor/Editor.tsx`, `src/lib/stores/document.ts`. The title bar shows a `*` when modified, but nothing in the editor area itself signals unsaved changes. Consider a subtle dot or icon near the title, or a colored border/bar, consistent with the Win98 aesthetic.

- [x] **[#34] Unify font lists between FormatBar and FontDialog** -- `src/components/layout/FormatBar.tsx:6-9`, `src/components/dialogs/FontDialog.tsx:7`. FormatBar lists 12 fonts (includes `Palatino Linotype`, `Lucida Console`); FontDialog lists 10 fonts (excludes those two). Extract a shared `AVAILABLE_FONTS` constant into a common module and use it in both places.

- [x] **[#35] Show version number in About dialog** -- `src/components/dialogs/AboutDialog.tsx:14`. The About dialog says "Windows 98 Style" where users expect a version number. Read the version from `package.json` (via a build-time define or IPC call) and display it (currently `3.0.4`).

- [x] **[#41] Add placeholder / empty state in editor** -- `src/components/editor/Editor.tsx`. When the editor is empty, it shows a blank white box with no affordance. Add a `placeholder` attribute or a CSS `::before` pseudo-element with ghost text (e.g., "Type here or open a file...") that disappears on input.

---

## Phase 4: Architecture Cleanup

Improve code quality, reduce technical debt, and prepare for sustainable development.

- [x] **[#8] Replace `document.execCommand` with an abstraction layer** -- `src/lib/stores/editor.ts` (11 calls), `src/components/layout/MenuBar.tsx` (8 calls), `src/components/layout/Toolbar.tsx` (5 calls), `src/components/dialogs/FontDialog.tsx` (8 calls), `src/components/dialogs/ReplaceDialog.tsx` (1 call), `src/components/editor/Editor.tsx` (indirect). There are 42+ `execCommand` calls across the codebase with no abstraction. `execCommand` is deprecated and has inconsistent cross-browser behavior. If adopting Tiptap (see Strategic Decision), this resolves itself. Otherwise, create a `CommandExecutor` service that wraps each command and can be swapped for a different implementation later.

- [x] **[#17] Eliminate duplicated state between `AppAPI` and `documentStore`** -- `src/lib/electron-api.ts:26-28,130-139`, `src/lib/stores/document.ts`. `AppAPI` tracks `currentFilePath` and `isDocumentModified` as private fields, while `documentStore` tracks `filePath` and `isModified` independently. These drift out of sync. Designate one as the single source of truth (preferably the store) and have `AppAPI` read from it.

- [x] **[#25] Replace `document.getElementById('editor')` with React ref/context** -- `src/components/layout/MenuBar.tsx:113,123`, `src/components/layout/Toolbar.tsx:13,22`, `src/components/layout/FormatBar.tsx:18,24,38-65`, `src/components/dialogs/FontDialog.tsx:53`, `src/components/dialogs/ReplaceDialog.tsx:46,74`. At least 12 call sites reach into the DOM with `document.getElementById('editor')`. Create an `EditorContext` that provides a ref to the editor element, and consume it in all components that need editor access.

- [x] **[#26] Deduplicate `handleNew` / `handleOpen` between MenuBar and Toolbar** -- `src/components/layout/MenuBar.tsx:110-125`, `src/components/layout/Toolbar.tsx:10-25`. Both components implement identical new/open logic (call `appAPI`, clear editor, dispatch). Extract these into shared action functions (e.g., in `electron-api.ts` or a new `actions.ts` module) and call them from both components.

- [x] **[#27] Remove side effects from reducers** -- `src/lib/stores/document.ts:23,27,30`. The `documentReducer` calls `appAPI.setDocumentModified()` (an async side effect) inside `MARK_MODIFIED`, `CLEAR`, and `SET_CONTENT` cases. Reducers should be pure functions. Move these side effects to middleware, thunks, or `useEffect` hooks that react to state changes.

- [x] **[#28] Eliminate `as any` type casts** -- `src/components/layout/MenuBar.tsx:200,208`. Menu items are cast to `any` to access properties, losing type safety. Define a proper discriminated union type for `MenuItem` (separators vs. action items vs. checkbox items) and use type narrowing instead of casts.

- [x] **[#37] Wrap the app in `React.StrictMode`** -- `src/main.tsx:5`. The entry point renders `<App />` without `<React.StrictMode>`. StrictMode helps catch impure renders, deprecated API usage, and missing cleanup in effects. Wrap the render call: `<React.StrictMode><App /></React.StrictMode>`.

- [x] **[#38] Add ESLint and Prettier configuration** -- project root. No `.eslintrc` or `.prettierrc` exists. Add ESLint (with `@typescript-eslint` and `eslint-plugin-react`) and Prettier configs. Add `lint` and `format` scripts to `package.json`. Run the formatter once to normalize the existing codebase.

---

## Phase 5: Accessibility & Polish

Final usability improvements and visual refinements.

- [x] **[#10] Add keyboard accessibility to menus** -- `src/components/layout/MenuBar.tsx`. Menu items have no `role="menuitem"`, no `aria-haspopup`, no `tabIndex`, and no arrow-key navigation. Implement WAI-ARIA menu pattern: `role="menubar"` on the container, `role="menuitem"` on items, arrow-key focus management, `Home`/`End` support, and `Enter`/`Space` activation.

- [x] **[#31] Add Redo button to toolbar and context menu** -- `src/components/layout/Toolbar.tsx`, `src/components/editor/ContextMenu.tsx`. The toolbar has an Undo button but no Redo. The Edit menu has Redo (`Ctrl+Y`) but neither the toolbar nor the context menu exposes it. Add a Redo toolbar button next to Undo, and add Redo to the context menu.

- [x] **[#32] Replace native `title` tooltips with Win98-styled tooltips** -- `src/components/ui/ToolbarButton.tsx`, `src/components/layout/FormatBar.tsx`. Toolbar buttons use the browser-native `title` attribute for tooltips, which renders as an unstyled OS tooltip after a delay. Implement a custom `<Tooltip>` component that matches the Win98 yellow tooltip style and appears on hover with a short delay.

- [x] **[#36] Differentiate Print Preview from Print** -- `src/lib/electron-api.ts:149-151`. `printPreview()` calls `window.print()`, which is identical to `print()`. Either implement a distinct preview mode (render the document in a read-only styled view with page breaks) or remove the Print Preview menu item and toolbar button to avoid confusion.

- [x] **[#42] Remember dialog positions across opens** -- `src/components/ui/DialogBase.tsx`. All dialogs reset to their default (centered) position every time they open. Track the last position for each dialog (in local state or a store) and restore it when the dialog reopens. This matches the behavior of the original WordPad.

---

## Phase 6: Testing Infrastructure

> **Note:** While this is listed last, testing should begin alongside Phase 1. Write tests for new code from the start; backfill tests for existing code as each phase lands.

- [x] **[#9] Establish a testing framework and write initial test suites** -- entire codebase. There are currently zero tests of any kind. Set up:
  - **Unit tests:** Vitest (already compatible with Vite 7). Cover stores/reducers (`document.ts`, `editor.ts`, `view.ts`, `dialogs.ts`), utility functions, and `AppAPI` logic.
  - **Component tests:** Vitest + React Testing Library. Cover dialogs, menu bar action dispatch, and toolbar interactions.
  - **E2E tests:** Playwright or Electron's built-in testing utilities. Cover file open/save round-trips, save prompt on close, and cross-platform shortcut behavior.
  - **CI integration:** Add a `test` script to `package.json` and a GitHub Actions workflow that runs on every PR.

---

## Progress Summary

| Phase | Items | Completed |
|---|---|---|
| 0 -- Build & Security | 7 | 7 |
| 1 -- Data Safety | 2 | 2 |
| 2 -- Platform Compliance | 8 | 8 |
| 3 -- UX Integrity | 13 | 13 |
| 4 -- Architecture Cleanup | 8 | 8 |
| 5 -- Accessibility & Polish | 5 | 5 |
| 6 -- Testing | 1 | 1 |
| **Total** | **44** | **44** |
