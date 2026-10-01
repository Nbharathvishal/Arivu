import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SPA fallback plugin - ensures all non-file requests serve index.html
// This fixes the 404 error when refreshing the page on a client-side route
function spaFallback() {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      // This middleware runs BEFORE Vite's built-in middleware
      server.middlewares.use((req, res, next) => {
        const url = req.url

        // Skip API requests, HMR, assets with file extensions, and Vite internals
        if (
          url.startsWith('/@') ||      // Vite internals (HMR, module resolution)
          url.startsWith('/src/') ||    // Source files
          url.startsWith('/node_modules/') ||
          url.includes('.')             // Files with extensions (.js, .css, .png, etc.)
        ) {
          return next()
        }

        // For all other requests (SPA routes like /main, /profile, etc.),
        // rewrite to index.html so React Router handles the routing
        req.url = '/index.html'
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [spaFallback(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.js',
    css: false,
  },
})
