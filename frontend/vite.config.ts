import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/monthly-consumption': 'http://localhost:8000',
      '/settings': 'http://localhost:8000',
      '/electricity-prices': 'http://localhost:8000',
      '/electricity-price': 'http://localhost:8000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react-dom/') || id.includes('/react/')) return 'react'
            if (id.includes('/@mui/')) return 'mui'
          }
          return undefined
        },
      }
    }
  }
})
