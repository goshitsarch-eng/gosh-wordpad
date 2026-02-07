/**
 * Sanitize HTML content loaded from files before inserting into the editor.
 * Strips script tags, iframes, and event handler attributes to prevent XSS.
 */
export function sanitizeHTML(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script, iframe, object, embed, link[rel="import"]').forEach(el => el.remove())
  doc.body.querySelectorAll('*').forEach(el => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('on') || attr.name === 'srcdoc') {
        el.removeAttribute(attr.name)
      }
    }
  })
  return doc.body.innerHTML
}
