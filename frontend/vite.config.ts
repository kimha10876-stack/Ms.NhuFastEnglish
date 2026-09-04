import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      // Docker stack: nginx frontend on :80 proxies /api → backend. Local dotnet: :5122
      '/api': {
        target: process.env.VITE_DEV_API_TARGET ?? 'http://localhost',
        changeOrigin: true,
      },
    },
  },
})
