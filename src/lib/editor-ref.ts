let _editor: HTMLDivElement | null = null

export function registerEditor(el: HTMLDivElement | null): void {
  _editor = el
}

export function getEditor(): HTMLDivElement | null {
  return _editor
}

export function focusEditor(): void {
  _editor?.focus()
}
