const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

/** Replace "Ctrl" with macOS symbols on Apple platforms */
export function platformShortcut(shortcut: string): string {
  if (!isMac) return shortcut
  return shortcut
    .replace('Ctrl+', '\u2318')
    .replace('Alt+', '\u2325')
}
