import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Google sign-in only works from the exact address registered in Google
  // Cloud (http://localhost:5173). Without this, Vite quietly moves to 5174
  // when 5173 is busy and Google rejects the sign-in.
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
  },
})
