import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss()
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''),
      'process.env.SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.SUPABASE_URL || ''),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor';
            if (id.includes('node_modules/react/')) return 'react-vendor';
            if (id.includes('motion')) return 'motion';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('i18next')) return 'i18n';
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('react-simple-maps') || id.includes('d3-geo')) return 'maps';
            // Don't put md-editor in manualChunks — let it stay in AdminProductForm's lazy chunk
          }
        }
      }
    }
  };
});
