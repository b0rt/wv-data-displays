import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../dist/pilot',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/upload': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
      '/fonts': 'http://localhost:3000',
      '/lib': 'http://localhost:3000',
    },
  },
})
