import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src',
  publicDir: '../assets',
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@/lib': resolve(__dirname, 'src/lib'),
      '@/components': resolve(__dirname, 'src/components'),
      '@': resolve(__dirname, 'src')
    }
  },
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
