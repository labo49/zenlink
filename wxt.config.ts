import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: ({ browser }) => ({
    permissions: ['identity', 'tabs', 'storage', 'alarms'],
    host_permissions: ['https://tysfpsvjzjzimiipykol.supabase.co/*'],
    // Firefox requires a stable extension ID for OAuth redirect URLs to work
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'zenlink@labo49',
          strict_min_version: '109.0',
        },
      },
    }),
  }),
});
