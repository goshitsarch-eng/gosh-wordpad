# Gosh WordPad

A faithful recreation of Windows 98 WordPad, built with React 19 and Electron.

**By Goshitsarch**

## About

Gosh WordPad replicates the look and feel of the original — authentic 3D borders, the classic color palette, toolbar, format bar, ruler with draggable indent markers, and status bar. It supports rich text formatting (bold, italic, underline, font/size/color selection, paragraph alignment, bullet lists), file operations for TXT and RTF, find & replace, undo/redo, and standard clipboard shortcuts. There's also a dark mode if the retro aesthetic gets too bright.

## Getting Started

Requires **Node.js 18+**.

```bash
git clone https://github.com/goshitsarch-eng/Gosh-Wordpad-Clone.git
cd Gosh-Wordpad-Clone
npm install
```

Run in the browser with `npm run dev`, or as a desktop app with `npm run electron:dev`.

To build a distributable package:

```bash
npm run electron:build
```

## Tech Stack

React 19, Electron, Vite, TypeScript.

## Project Structure

```
src/                  React frontend (components, stores, editor, dialogs)
electron/             Electron main process (main.ts, preload.ts)
assets/               Icons and toolbar images
```

## Keyboard Shortcuts

All standard WordPad shortcuts work — Ctrl+N/O/S/P for file ops, Ctrl+Z/Y for undo/redo, Ctrl+X/C/V for clipboard, Ctrl+F/H for find/replace, F3 for find next, and Ctrl+B/I/U for formatting. On macOS, use Cmd instead of Ctrl.

## Disclaimer

This software is provided as-is with no warranty. Use at your own risk.

## License

MIT

## Acknowledgments

A tribute to the classic Microsoft WordPad from Windows 98. Not affiliated with or endorsed by Microsoft.
