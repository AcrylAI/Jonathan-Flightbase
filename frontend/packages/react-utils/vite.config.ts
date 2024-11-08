import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: '@src', replacement: '/src' }],
  },
  server: {
    cors: false,
  },
});
