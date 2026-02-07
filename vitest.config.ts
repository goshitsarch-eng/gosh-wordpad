import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@/lib': resolve(__dirname, 'src/lib'),
      '@/components': resolve(__dirname, 'src/components'),
      '@': resolve(__dirname, 'src'),
    },
  },
})
