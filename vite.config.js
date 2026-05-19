import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Plugin to copy index.html as 200.html for Render SPA routing
const renderSPAPlugin = {
  name: 'render-spa',
  closeBundle() {
    try {
      copyFileSync(
        resolve(__dirname, 'dist/index.html'),
        resolve(__dirname, 'dist/200.html')
      )
      console.log('✅ Created dist/200.html for Render SPA routing')
    } catch (e) {
      console.warn('⚠️ Could not create 200.html:', e.message)
    }
  }
}

export default defineConfig({
  plugins: [react(), renderSPAPlugin],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    minify: 'terser',
    target: 'es2015',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          stripe: ['@stripe/stripe-js'],
          icons: ['react-icons'],
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    }
  }
})
