import '@testing-library/jest-dom/vitest'

// Node 22.4+ exposes a built-in (experimental) Web Storage API that shadows
// the one jsdom installs on `window`, leaving `localStorage.clear` etc.
// undefined under vitest's jsdom environment. Install a minimal in-memory
// Storage polyfill on both the global and window so tests behave identically
// across Node and jsdom versions.
function createStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() { return map.size },
    clear() { map.clear() },
    getItem(key) { return map.has(key) ? (map.get(key) ?? null) : null },
    key(index) { return Array.from(map.keys())[index] ?? null },
    removeItem(key) { map.delete(key) },
    setItem(key, value) { map.set(String(key), String(value)) },
  }
}
const localStoragePolyfill = createStorage()
const sessionStoragePolyfill = createStorage()
Object.defineProperty(globalThis, 'localStorage', { value: localStoragePolyfill, configurable: true, writable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStoragePolyfill, configurable: true, writable: true })
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: localStoragePolyfill, configurable: true, writable: true })
  Object.defineProperty(window, 'sessionStorage', { value: sessionStoragePolyfill, configurable: true, writable: true })
}
