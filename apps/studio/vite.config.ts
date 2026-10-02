import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      '@beatwave/protocol': resolve(__dirname, '../../packages/protocol/src'),
      '@beatwave/vision': resolve(__dirname, '../../packages/vision/src'),
      '@beatwave/gesture-runtime': resolve(__dirname, '../../packages/gesture-runtime/src'),
      '@beatwave/audio-engine': resolve(__dirname, '../../packages/audio-engine/src'),
      '@beatwave/midi': resolve(__dirname, '../../packages/midi/src'),
      '@beatwave/spotify': resolve(__dirname, '../../packages/spotify/src'),
      '@beatwave/storage': resolve(__dirname, '../../packages/storage/src')
    }
  }
});
