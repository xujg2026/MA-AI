import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 企查查API代理
      '/qcc-api': {
        target: 'https://agent.qcc.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qcc-api/, ''),
        // 不验证 SSL 证书
        secure: false,
      },
    },
  },
})
