const ALL_FONTS = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino Linotype',
  'Lucida Console', 'Tahoma', 'MS Sans Serif',
  'Liberation Sans', 'Liberation Serif', 'Liberation Mono',
  'DejaVu Sans', 'DejaVu Serif', 'DejaVu Sans Mono',
  'Noto Sans', 'Noto Serif'
]

let cached: string[] | null = null

/** Returns only fonts available on the current system */
export function getAvailableFonts(): string[] {
  if (cached) return cached
  cached = ALL_FONTS.filter(font => {
    try {
      return document.fonts.check(`12px "${font}"`)
    } catch {
      return true
    }
  })
  if (cached.length === 0) cached = ['Arial', 'Times New Roman', 'Courier New']
  return cached
}

export const FONT_SIZES = ['8','9','10','11','12','14','16','18','20','22','24','26','28','36','48','72']
