import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
const path = require('path');

function I18nHotReload() {
  return {
    name: 'i18n-hot-reload',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.json')) {
        server.ws.send({
          type: 'custom',
          event: 'locales-update',
        });
      }
    },
  };
}

// https://vitejs.dev/config/
const config = ({ mode }) => {
  // process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, './src'),
        '@images': path.resolve(__dirname, './src/static/images'),
      },
    },
    envDir: './configs/app-config/vite-env/',
    plugins: [react(), I18nHotReload()],
    build: {
      outDir: 'build',
    },
    server: {
      usePolling: true,
    },
    preview: {
      open: true,
    },
  });
};

export default config;
