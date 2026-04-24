import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  preview: {
    allowedHosts: ['.trycloudflare.com', 'localhost'],
    host: true,
    port: 4173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
