import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  root: 'assets',
  publicDir: '../',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'assets/index.html'),
        login: resolve(__dirname, 'assets/pages/login.html'),
        register: resolve(__dirname, 'assets/pages/register.html'),
        dashboard: resolve(__dirname, 'assets/pages/sme-dashboard.html'),
        'admin-dashboard': resolve(__dirname, 'assets/pages/admin-dashboard.html'),
        'bank-dashboard': resolve(__dirname, 'assets/pages/bank-dashboard.html'),
        profile: resolve(__dirname, 'assets/pages/profile.html'),
        'invoice-detail': resolve(__dirname, 'assets/pages/invoice-detail.html'),
        'kyc-verification': resolve(__dirname, 'assets/pages/kyc-verification.html'),
        'kyb-verification': resolve(__dirname, 'assets/pages/kyb-verification.html'),
        'kyc-onboard': resolve(__dirname, 'assets/pages/kyc-onboard.html'),
        'bank-review': resolve(__dirname, 'assets/pages/bank-review.html'),
        'animation-showcase': resolve(__dirname, 'assets/pages/animation-showcase.html'),
        'i18n-demo': resolve(__dirname, 'assets/pages/i18n-demo.html')
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
        manualChunks: {
          vendor: ['swiper-bundel.min.js'],
          core: ['./js/api.js', './js/auth.js', './js/auth-guard.js']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: true,
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5500,
    open: '/pages/login.html',
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: []
  }
});
