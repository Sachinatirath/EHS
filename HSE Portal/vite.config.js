import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // backend/ holds the Python APIs kept for future use; the portal never imports them.
  server: { watch: { ignored: ['**/backend/**'] } },
})
