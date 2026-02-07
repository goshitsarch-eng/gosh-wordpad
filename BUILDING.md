# Building Gosh WordPad

This document covers building Gosh WordPad for distribution on Linux, Windows, and macOS. For day-to-day development, `npm run electron:dev` is all you need — see the [README](README.md) for that.

## Prerequisites

- **Node.js >= 20.0.0** and npm
- Platform-specific toolchains if you're cross-compiling (see platform sections below)

Install dependencies first:

```bash
npm install
```

## The Build Pipeline

The production build happens in stages. Running `npm run electron:build` triggers all of them in sequence:

1. **Type-check the frontend** — `tsc` runs against the React/Vite source with `noEmit` (catches type errors without producing output).
2. **Build the frontend** — `vite build` outputs the bundled app to `dist/` with a relative base path. It injects `__APP_VERSION__` from `package.json` at build time.
3. **Compile Electron code** — `tsc -p tsconfig.electron.json` compiles everything in `electron/` to `dist-electron/`. Because the project uses `"module": "NodeNext"`, TypeScript respects file extensions: `.ts` files compile to ESM `.js`, and `.cts` files compile to CommonJS `.cjs`. This distinction matters — the preload script *must* be CommonJS.
4. **Package with electron-builder** — bundles `dist/` and `dist-electron/` into platform-specific installers, outputting to `release/`.

You can also run just the first three steps without packaging:

```bash
npm run build
```

This is useful for verifying the build compiles cleanly without producing installer artifacts.

## electron-builder Configuration

The packaging config lives in `package.json` under the `"build"` key. The key settings:

- **appId**: `com.goshitsarch.wordpad`
- **productName**: `Gosh WordPad`
- **executableName**: `gosh-wordpad`
- **Output directory**: `release/`

### Linux

```bash
npm run electron:build
```

Produces AppImage, deb, rpm, and tar.gz packages. Both x64 and arm64 are supported.

The main process appends `--ozone-platform-hint=auto` on Linux for Wayland compatibility, so users on Wayland desktops should have a native experience without extra flags.

### Windows

```bash
npm run electron:build
```

Produces an NSIS installer. Both x64 and arm64 targets are configured.

### macOS

```bash
npm run electron:build
```

Produces a DMG targeting both x64 (Intel) and arm64 (Apple Silicon).

macOS builds use hardened runtime. The entitlements file is at `build/entitlements.mac.plist` and contains two entitlements:

- `com.apple.security.cs.allow-jit`
- `com.apple.security.cs.allow-unsigned-executable-memory`

These are standard for Electron apps — JIT is needed for V8, and unsigned executable memory is needed for some native modules.

## macOS Code Signing and Notarization

> **Note:** There is currently no macOS CI job. macOS builds must be done locally on a Mac. The CI pipeline only builds Linux and Windows targets.

If you're distributing the macOS build outside the App Store, you'll need to code sign and notarize it. This section covers the process — it's fiddly but doable.

### What You'll Need

An Apple Developer account ($99/year) with a **Developer ID Application** certificate. You'll also need an app-specific password for notarization, since Apple's notary service doesn't accept your regular Apple ID password.

To generate an app-specific password, go to [appleid.apple.com](https://appleid.apple.com), sign in, and look under Security > App-Specific Passwords.

### Environment Variables

electron-builder picks up signing credentials from environment variables. Set these before building:

```bash
export CSC_LINK="/path/to/DeveloperIDApplication.p12"
export CSC_KEY_PASSWORD="your-certificate-password"
export APPLE_ID="your@apple.id"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="YOUR_TEAM_ID"
```

`CSC_LINK` can be a path to the `.p12` file or a base64-encoded string of the certificate (useful in CI). `APPLE_TEAM_ID` is your 10-character team identifier from the Apple Developer portal.

With these set, `npm run electron:build` will sign the app and submit it for notarization automatically. electron-builder handles the `notarytool` submission, waits for Apple's response, and staples the ticket to the DMG.

### Troubleshooting

**"The signature is invalid"** — Make sure you're using a *Developer ID Application* certificate, not a Mac App Store or development cert. Only Developer ID certs work for distribution outside the App Store.

**Notarization fails with "package is not signed"** — The signing step may have been skipped. Check that `CSC_LINK` points to a valid `.p12` and that `CSC_KEY_PASSWORD` is correct.

**"spctl --assess" rejects the app** — After notarization, the ticket needs to be stapled. electron-builder should do this automatically, but you can run it manually:

```bash
xcrun stapler staple "release/mac/Gosh WordPad.app"
```

*(The exact path in `release/` may vary depending on your electron-builder version and architecture settings. Check `release/` for the actual output structure.)*

**Hardened runtime crashes** — If the app crashes at launch after signing, it's usually a missing entitlement. The current entitlements at `build/entitlements.mac.plist` should be sufficient for a standard Electron app, but if you add native modules that need additional capabilities, you may need to expand them.

## CI/CD

The project has two GitHub Actions workflows:

**Build workflow** (triggered on `v*` tags): Builds packages for Linux (x64 + arm64, producing deb/rpm/tar.gz) and Windows (x64 + arm64, NSIS). There is no macOS CI build — macOS packages must be built and signed locally.

**Test workflow** (triggered on push/PR to main): Runs on ubuntu-latest with Node 20. Executes the full build and test suite.

## Quick Reference

| What you want | Command |
|---|---|
| Dev server (browser only) | `npm run dev` |
| Launch desktop app (dev) | `npm run electron:dev` |
| Full build without packaging | `npm run build` |
| Build + package for distribution | `npm run electron:build` |
| Run tests | `npm test` |
| Run tests in watch mode | `npm run test:watch` |
