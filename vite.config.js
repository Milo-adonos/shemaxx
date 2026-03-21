import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    /** Ouvre le navigateur au lancement de `npm run dev` */
    open: true,
    /** Accessible aussi depuis ton réseau local (URL affichée dans le terminal) */
    host: true,
    port: 5173,
  },
})
