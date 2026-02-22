# Changelog

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
