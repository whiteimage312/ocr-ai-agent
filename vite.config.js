// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Adaugă numele domeniului Render aici
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['ocr-ai-agent-1.onrender.com'], // sau înlocuiește cu hostul tău real
  },
})
