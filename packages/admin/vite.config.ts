/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,       // Show errors as overlay instead of hanging
    },
    // Prevent memory leak from too many open file watchers
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
    fs: {
      strict: false,
    },
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/components/Sidebar.tsx',
        './src/components/ProtectedRoute.tsx',
        './src/hooks/useAuth.ts',
      ],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'lucide-react',
      'recharts',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
} as any);
