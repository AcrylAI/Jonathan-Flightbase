import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@src', replacement: '/src' },
      { find: '@tools', replacement: '/src/marker-tools' },
    ],
  },
  build: {
    outDir: "build"
  },
  envDir: './configs/app-config/vite-env/',
  server: {
    cors: false,
  },
  preview: {
    open: true,
    port: 9999,
  },
});
