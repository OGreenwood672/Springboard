/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@springboard/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    deps: {
      optimizer: {
        web: {
          include: ['react', 'react-dom', 'react-router', 'react-router-dom', '@testing-library/react'],
        },
      },
    },
  },
});
