import { describe, it, expect } from 'vitest'
import { getFontSizeIndex } from '@/lib/stores/editor'

describe('getFontSizeIndex', () => {
  it('maps size 8 to index 1', () => {
    expect(getFontSizeIndex('8')).toBe(1)
  })

  it('maps size 10 to index 2', () => {
    expect(getFontSizeIndex('10')).toBe(2)
  })

  it('maps size 12 to index 3', () => {
    expect(getFontSizeIndex('12')).toBe(3)
  })

  it('maps size 14 to index 4', () => {
    expect(getFontSizeIndex('14')).toBe(4)
  })

  it('maps size 18 to index 5', () => {
    expect(getFontSizeIndex('18')).toBe(5)
  })

  it('maps size 24 to index 6', () => {
    expect(getFontSizeIndex('24')).toBe(6)
  })

  it('maps size 36 to index 7', () => {
    expect(getFontSizeIndex('36')).toBe(7)
  })

  it('maps size 72 to index 7', () => {
    expect(getFontSizeIndex('72')).toBe(7)
  })

  it('maps size 9 to index 2 (boundary)', () => {
    expect(getFontSizeIndex('9')).toBe(2)
  })

  it('maps size 11 to index 3 (boundary)', () => {
    expect(getFontSizeIndex('11')).toBe(3)
  })
})
