import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  // Prefer CI-provided BASE_URL, fall back to the repo subpath in production.
  base: process.env.BASE_URL || (mode === 'production' ? '/ezmath/' : '/'),
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'EzMath - Fun Math for Kids',
        short_name: 'EzMath',
        description: 'Kid-friendly math learning game with multiple game modes and progress tracking',
        theme_color: '#9333ea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: './',
        start_url: './',
        icons: [
          {
            src: './icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: './icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['education', 'games']
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
}))
