import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';

export default defineConfig({
  plugins: [vue()],
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    includedRoutes(paths) {
      // Only pre-render primary routes, skip .html aliases
      return paths.filter((path) => !path.endsWith('.html'));
    },
  },
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    }
  }
});