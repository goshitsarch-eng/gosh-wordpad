# Building WordPad 98

This document covers building, signing, and distributing WordPad 98 for macOS.

## Prerequisites

- macOS with Xcode Command Line Tools
- Node.js 24.13+
- Apple Developer account (for signing/notarization)
- Developer ID Application certificate installed in Keychain

## Quick Build (Unsigned)

For development and testing:

```bash
npm install
npm run build:mac
```

This creates an unsigned app at `build/mac-arm64/WordPad.app`.

## Signed & Notarized Build (Distribution)

### Step 1: Set Environment Variables

```bash
export APPLE_ID="your@email.com"
export APPLE_TEAM_ID="YOURTEAMID"
export APPLE_APP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
```

Create an app-specific password at https://appleid.apple.com/account/manage under "Sign-In and Security" > "App-Specific Passwords".

### Step 2: Run the Build Script

```bash
./scripts/build-mac.sh
```

This will:
1. Build the unsigned app with electron-builder
2. Sign all components with your Developer ID certificate
3. Submit to Apple for notarization
4. Staple the notarization ticket
5. Create a signed and notarized DMG

Output: `build/WordPad.dmg`

### Manual Build Steps

If you prefer to run steps manually:

#### 1. Build the App

```bash
npm run build:mac
```

#### 2. Sign All Components

```bash
APP="build/mac-arm64/WordPad.app"
IDENTITY="Developer ID Application: Your Name (TEAMID)"
ENTITLEMENTS="entitlements.plist"

# Sign dylibs
find "$APP/Contents/Frameworks" -type f -name "*.dylib" \
  -exec codesign --force --timestamp --options runtime \
  --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" {} \;

# Sign chrome_crashpad_handler (critical!)
codesign --force --timestamp --options runtime \
  --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
  "$APP/Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler"

# Sign ShipIt
codesign --force --timestamp --options runtime \
  --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
  "$APP/Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt"

# Sign helper apps
for helper in "WordPad Helper" "WordPad Helper (GPU)" "WordPad Helper (Plugin)" "WordPad Helper (Renderer)"; do
  codesign --force --timestamp --options runtime \
    --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
    "$APP/Contents/Frameworks/$helper.app"
done

# Sign frameworks
for framework in "Electron Framework" "Mantle" "ReactiveObjC" "Squirrel"; do
  codesign --force --timestamp --options runtime \
    --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
    "$APP/Contents/Frameworks/$framework.framework"
done

# Sign main app (must be last!)
codesign --force --timestamp --options runtime \
  --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" "$APP"
```

#### 3. Notarize the App

```bash
# Create zip for upload
ditto -c -k --keepParent build/mac-arm64/WordPad.app WordPad.zip

# Submit for notarization
xcrun notarytool submit WordPad.zip \
  --apple-id "$APPLE_ID" \
  --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_APP_PASSWORD" \
  --wait

# Staple the ticket
xcrun stapler staple build/mac-arm64/WordPad.app

# Clean up
rm WordPad.zip
```

#### 4. Create DMG

```bash
# Create DMG
hdiutil create -volname "WordPad" \
  -srcfolder build/mac-arm64/WordPad.app \
  -ov -format UDZO build/WordPad.dmg

# Sign DMG
codesign --force --timestamp \
  --sign "Developer ID Application: Your Name (TEAMID)" \
  build/WordPad.dmg

# Notarize DMG
xcrun notarytool submit build/WordPad.dmg \
  --apple-id "$APPLE_ID" \
  --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_APP_PASSWORD" \
  --wait

# Staple DMG
xcrun stapler staple build/WordPad.dmg
```

## Required Files

### entitlements.plist

The entitlements file is critical for Electron apps. Without these entitlements, the app will crash on launch with a `pthread_jit_write_protect_np` error.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

### Icon Generation

To regenerate the `.icns` file from a 1024x1024 PNG:

```bash
mkdir -p icon.iconset
sips -z 16 16 source.png --out icon.iconset/icon_16x16.png
sips -z 32 32 source.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 source.png --out icon.iconset/icon_32x32.png
sips -z 64 64 source.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 source.png --out icon.iconset/icon_128x128.png
sips -z 256 256 source.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 source.png --out icon.iconset/icon_256x256.png
sips -z 512 512 source.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 source.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 source.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o icon.icns
```

## Lessons Learned

### macOS Code Signing

1. **`--deep` is insufficient** - The `codesign --deep` flag does NOT properly sign all nested Electron binaries. You must sign each component individually, from the inside out.

2. **Timestamps are required** - Always use the `--timestamp` flag. Without it, notarization will fail with "signature does not include a secure timestamp".

3. **Hardened runtime needs entitlements** - The `--options runtime` flag enables hardened runtime (required for notarization), but Electron apps need JIT entitlements to function.

4. **Sign order matters** - Sign in this order:
   1. dylibs first
   2. Helper binaries (`chrome_crashpad_handler`, `ShipIt`)
   3. Helper apps
   4. Frameworks
   5. Main app last

5. **Don't forget `chrome_crashpad_handler`** - This binary is easily missed and will cause notarization to fail.

6. **electron-builder notarization can be buggy** - We disable electron-builder's built-in notarization (`"notarize": false` in package.json) and handle it manually for more reliable results.

### electron-builder Configuration

Key settings in `package.json`:

```json
{
  "build": {
    "mac": {
      "target": [{"target": "dir", "arch": ["arm64"]}],
      "icon": "assets/icons/icon.icns",
      "category": "public.app-category.productivity",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "entitlements.plist",
      "entitlementsInherit": "entitlements.plist",
      "notarize": false
    }
  }
}
```

- Use `"target": "dir"` to get just the `.app` bundle for manual signing
- Set `"notarize": false` to prevent electron-builder from attempting notarization
- `hardenedRuntime: true` is required for notarization
- Both `entitlements` and `entitlementsInherit` should point to your entitlements file

### Development Tips

To show your app name (not "Electron") in the menu bar during `npm start`:

```bash
# Update Info.plist
PLIST="node_modules/electron/dist/Electron.app/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleName WordPad" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName WordPad" "$PLIST"

# Replace icon
cp assets/icons/icon.icns \
  node_modules/electron/dist/Electron.app/Contents/Resources/electron.icns
```

Note: These changes are in `node_modules/` and will reset on `npm install`.

### Finding Your Signing Identity

List available Developer ID certificates:

```bash
security find-identity -v -p codesigning | grep "Developer ID Application"
```

### Verifying Signatures

```bash
# Verify app signature
codesign --verify --deep --strict --verbose=2 build/mac-arm64/WordPad.app

# Check notarization status
spctl --assess --type execute --verbose build/mac-arm64/WordPad.app

# Verify DMG
codesign --verify --verbose build/WordPad.dmg
```

## Troubleshooting

### "pthread_jit_write_protect_np" crash
Missing JIT entitlements. Ensure `entitlements.plist` includes:
- `com.apple.security.cs.allow-jit`
- `com.apple.security.cs.allow-unsigned-executable-memory`

### "signature does not include a secure timestamp"
Add `--timestamp` flag to all codesign commands.

### Notarization fails with unsigned binaries
Sign components individually instead of using `--deep`. Check that `chrome_crashpad_handler` is signed.

### "The application is damaged" on launch
The app wasn't notarized or the ticket wasn't stapled. Re-run notarization and stapling.

### electron-builder "Cannot destructure property 'appBundleId'" error
Set `"notarize": false` in the mac build config and handle notarization manually.
