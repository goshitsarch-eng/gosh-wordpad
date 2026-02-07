import { describe, it, expect } from 'vitest'

// platformShortcut reads navigator.platform at module load time.
// In jsdom, navigator.platform is not Mac, so shortcuts stay as-is.

describe('platformShortcut (non-Mac)', () => {
  it('returns shortcut unchanged on non-Mac', async () => {
    const { platformShortcut } = await import('@/lib/platform')
    expect(platformShortcut('Ctrl+S')).toBe('Ctrl+S')
  })

  it('preserves shortcuts without Ctrl', async () => {
    const { platformShortcut } = await import('@/lib/platform')
    expect(platformShortcut('F1')).toBe('F1')
    expect(platformShortcut('Del')).toBe('Del')
  })

  it('preserves Alt shortcuts', async () => {
    const { platformShortcut } = await import('@/lib/platform')
    expect(platformShortcut('Alt+F4')).toBe('Alt+F4')
  })
})
