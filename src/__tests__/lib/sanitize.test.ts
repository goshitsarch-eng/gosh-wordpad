import { describe, it, expect } from 'vitest'
import { sanitizeHTML } from '@/lib/sanitize'

describe('sanitizeHTML', () => {
  it('preserves safe HTML', () => {
    const input = '<p>Hello <b>world</b></p>'
    expect(sanitizeHTML(input)).toBe('<p>Hello <b>world</b></p>')
  })

  it('removes script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>'
    expect(sanitizeHTML(input)).toBe('<p>Hello</p>')
  })

  it('removes iframe tags', () => {
    const input = '<p>Hello</p><iframe src="evil.com"></iframe>'
    expect(sanitizeHTML(input)).toBe('<p>Hello</p>')
  })

  it('removes object tags', () => {
    const input = '<p>Hello</p><object data="evil.swf"></object>'
    expect(sanitizeHTML(input)).toBe('<p>Hello</p>')
  })

  it('removes embed tags', () => {
    const input = '<p>Hello</p><embed src="evil.swf">'
    expect(sanitizeHTML(input)).toBe('<p>Hello</p>')
  })

  it('removes link[rel=import] tags', () => {
    const input = '<link rel="import" href="evil.html"><p>Safe</p>'
    expect(sanitizeHTML(input)).toBe('<p>Safe</p>')
  })

  it('removes onclick event handlers', () => {
    const input = '<p onclick="alert(1)">Hello</p>'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('onclick')
    expect(result).toContain('Hello')
  })

  it('removes onload event handlers', () => {
    const input = '<img onload="alert(1)" src="img.png">'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('onload')
  })

  it('removes onerror event handlers', () => {
    const input = '<img onerror="alert(1)" src="x">'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('onerror')
  })

  it('removes srcdoc attribute', () => {
    const input = '<iframe srcdoc="<script>alert(1)</script>"></iframe>'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('srcdoc')
  })

  it('handles empty input', () => {
    expect(sanitizeHTML('')).toBe('')
  })

  it('handles plain text', () => {
    expect(sanitizeHTML('Hello world')).toBe('Hello world')
  })

  it('removes multiple dangerous elements', () => {
    const input = '<script>bad</script><p>Good</p><iframe></iframe><object></object>'
    expect(sanitizeHTML(input)).toBe('<p>Good</p>')
  })

  it('strips multiple event handlers from same element', () => {
    const input = '<div onclick="a()" onmouseover="b()">Content</div>'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('onmouseover')
    expect(result).toContain('Content')
  })
})
