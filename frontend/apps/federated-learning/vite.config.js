import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
const path = require('path');

// https://vitejs.dev/config/
const config = ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, './src'),
        '@images': path.resolve(__dirname, './src/static/images'),
      },
    },
    plugins: [react()],
    build: { outDir: 'build' },
    preview: {
      open: true,
    },
  });
};

export default config;
