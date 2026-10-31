/// <reference types="vite/client" />

/** Same-origin path of the gzipped FFmpeg WebAssembly build (see vite.config.ts). */
declare const __FFMPEG_CORE_WASM__: string;

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    GEMINI_API_KEY: string;
  }
}
