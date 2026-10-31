import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

/**
 * FFmpeg's WebAssembly build, which the admin falls back to when a browser
 * cannot decode a video itself (src/utils/videoFrameReader.ts). The raw 32 MB
 * file is over Cloudflare's 25 MiB limit for one static asset, so it ships
 * gzipped (about 10 MB) and the browser unpacks it. Public pages never load it.
 */
function ffmpegCoreWasm(): Plugin {
  const coreDir = path.resolve(__dirname, 'node_modules/@ffmpeg/core');
  const {version} = JSON.parse(readFileSync(path.join(coreDir, 'package.json'), 'utf8'));
  const publicPath = `/ffmpeg/ffmpeg-core-${version}.wasm.gz`;
  let packed: Buffer | undefined;
  const pack = () => (packed ??= gzipSync(readFileSync(path.join(coreDir, 'dist/esm/ffmpeg-core.wasm')), {level: 9}));
  return {
    name: 'ffmpeg-core-wasm',
    config: () => ({define: {__FFMPEG_CORE_WASM__: JSON.stringify(publicPath)}}),
    configureServer(server) {
      server.middlewares.use(publicPath, (_req, res) => {
        res.setHeader('Content-Type', 'application/gzip');
        res.end(pack());
      });
    },
    generateBundle() {
      this.emitFile({type: 'asset', fileName: publicPath.slice(1), source: pack()});
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      ffmpegCoreWasm(),
    ],
    define: {
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
    // @ffmpeg/ffmpeg starts its worker from `new URL('./worker.js', import.meta.url)`;
    // pre-bundling would move it away from that file.
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg'],
    },
    // That worker is a module worker that import()s the FFmpeg core.
    worker: {
      format: 'es',
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
