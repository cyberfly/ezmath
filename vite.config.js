import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  // Prefer CI-provided BASE_URL, fall back to the repo subpath in production.
  base: process.env.BASE_URL || (mode === 'production' ? '/ezmath/' : '/'),
  plugins: [
    tailwindcss(),
  ],
}))
