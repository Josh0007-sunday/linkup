import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': {},
    'global': 'globalThis',
  },
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    host: true
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser polyfills
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer', // Polyfill buffer
    },
  },
})
