import { spawnSync } from 'node:child_process';

// These are public client credentials, not server secrets. Supabase publishable
// keys are designed to be embedded in browser bundles and public source code.
// Environment variables still take precedence so another project can override
// them without changing this file.
const DEFAULT_SUPABASE_URL = 'https://mxmmffwntosvwaviippd.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kf5n3mcse_1n8pTw-xHnQg__mNSn3iD';

const env = {
  ...process.env,
  VITE_SUPABASE_URL:
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY:
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY,
};

const commands = [
  'tsx scripts/generate-product-routes.ts',
  'vite build',
  'tsx scripts/prerender-static.ts',
  'tsx scripts/generate-sitemap.ts',
];

for (const command of commands) {
  const result = spawnSync(command, {
    cwd: process.cwd(),
    env,
    shell: true,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`[build-site] Failed to start: ${command}`, result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
