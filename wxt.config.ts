import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    permissions: ['identity', 'tabs', 'storage'],
    host_permissions: ['https://tysfpsvjzjzimiipykol.supabase.co/*'],
  },
});
