import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()],
  server: {
    // Bind to every interface, not just 127.0.0.1, so the dev server is
    // reachable from other devices on the LAN (phone, tablet, another PC).
    host: true,
  },
  preview: {
    host: true,
  },
})
