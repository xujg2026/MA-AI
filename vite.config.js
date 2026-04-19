import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/qcc-api': {
        target: 'https://agent.qcc.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qcc-api/, ''),
        secure: false,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
