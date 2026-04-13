import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';

let httpsConfig = undefined

if (process.env.NODE_ENV === 'development') {
  try {
    httpsConfig = {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    }
  } catch (e) {
    console.warn('⚠️ HTTPS cert not found, fallback to HTTP')
  }
}

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
  server: httpsConfig,
});