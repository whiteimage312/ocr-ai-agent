import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 10000,
    host: '0.0.0.0',
    allowedHosts: ['ocr-ai-agent-1.onrender.com'],
  },
})
