# Gosh WordPad Clone

A faithful clone of Microsoft WordPad from Windows 98, built with **React 19** and **Electron** for cross-platform compatibility.

**Built by Goshitsarch**

## Features

This application replicates the look and feel of Windows 98 WordPad, including:

### User Interface
- Authentic Windows 98 visual styling with 3D borders and classic color palette
- Toolbar with New, Open, Save, Print, Find, Cut, Copy, Paste, Undo buttons
- Format bar with font family, size, bold, italic, underline, text color, and alignment controls
- Ruler with draggable indent markers
- Status bar
- Dark mode support

### File Operations
- New document (Ctrl+N / Cmd+N)
- Open files (Ctrl+O / Cmd+O) - supports TXT and RTF formats
- Save (Ctrl+S / Cmd+S) and Save As
- Print (Ctrl+P / Cmd+P)

### Edit Operations
- Undo (Ctrl+Z / Cmd+Z) and Redo (Ctrl+Y / Cmd+Y)
- Cut (Ctrl+X / Cmd+X), Copy (Ctrl+C / Cmd+C), Paste (Ctrl+V / Cmd+V)
- Select All (Ctrl+A / Cmd+A)
- Find (Ctrl+F / Cmd+F) and Find Next (F3)
- Replace (Ctrl+H / Cmd+H)

### Formatting
- Font selection with family, style, and size
- Bold, Italic, Underline
- Text color
- Paragraph alignment (Left, Center, Right)
- Bullet lists

## Tech Stack

- **React 19** - Modern UI framework
- **Electron** - Cross-platform desktop application framework
- **Vite** - Fast build tooling
- **TypeScript** - Type-safe development

## Prerequisites

- **Node.js 18+**

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/goshitsarch-eng/Gosh-Wordpad-Clone.git
   cd Gosh-Wordpad-Clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode (web):
   ```bash
   npm run dev
   ```

4. Run with Electron:
   ```bash
   npm run electron:dev
   ```

## Building for Distribution

```bash
npm run electron:build
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd+N | New document |
| Ctrl/Cmd+O | Open file |
| Ctrl/Cmd+S | Save |
| Ctrl/Cmd+P | Print |
| Ctrl/Cmd+Z | Undo |
| Ctrl/Cmd+Y | Redo |
| Ctrl/Cmd+X | Cut |
| Ctrl/Cmd+C | Copy |
| Ctrl/Cmd+V | Paste |
| Ctrl/Cmd+A | Select All |
| Ctrl/Cmd+F | Find |
| Ctrl/Cmd+H | Replace |
| F3 | Find Next |
| Ctrl/Cmd+B | Bold |
| Ctrl/Cmd+I | Italic |
| Ctrl/Cmd+U | Underline |

## Project Structure

```
Gosh-Wordpad-Clone/
├── src/                         # Frontend (React)
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── app.css
│   ├── lib/
│   │   ├── electron-api.ts     # Electron API bridge
│   │   ├── stores/             # React state stores
│   │   └── types.ts
│   └── components/
│       ├── ui/                 # Base UI components
│       ├── layout/             # Layout components
│       ├── editor/             # Editor component
│       └── dialogs/            # Dialog components
├── electron/                    # Electron main process
│   ├── main.ts
│   └── preload.ts
├── assets/
│   ├── icons/                  # Application icons
│   └── toolbar/                # Toolbar button icons
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## License

MIT License

## Links

- **Repository**: https://github.com/goshitsarch-eng/Gosh-Wordpad-Clone

## Acknowledgments

This project is a tribute to the classic Microsoft WordPad application from Windows 98. It is not affiliated with or endorsed by Microsoft.
