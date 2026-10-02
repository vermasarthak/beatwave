import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: [
      'packages/**/*.{test,spec}.ts',
      'benchmarks/**/*.{test,spec}.ts',
      'fixtures/**/*.{test,spec}.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      '@beatwave/protocol': resolve(__dirname, './packages/protocol/src'),
      '@beatwave/audio-engine': resolve(__dirname, './packages/audio-engine/src'),
      '@beatwave/vision': resolve(__dirname, './packages/vision/src'),
      '@beatwave/gesture-runtime': resolve(__dirname, './packages/gesture-runtime/src'),
      '@beatwave/midi': resolve(__dirname, './packages/midi/src'),
      '@beatwave/spotify': resolve(__dirname, './packages/spotify/src'),
      '@beatwave/storage': resolve(__dirname, './packages/storage/src')
    }
  }
});
