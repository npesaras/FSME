import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    viteReact(),
  ],
  test: {
    clearMocks: true,
    css: true,
    environment: 'node',
    exclude: ['dist/**', 'node_modules/**'],
    include: ['test/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    setupFiles: ['./test/setup.ts'],
  },
})
