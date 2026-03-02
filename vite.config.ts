import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig((config) => {
  const isProduction = process.env.NODE_ENV === 'production'
  // Check if we're running tests (Vitest sets VITEST env var automatically)
  const isTest = process.env.VITEST !== undefined
  const aliases: { [key: string]: string } = {
    '@': resolve(__dirname, './app'),
  }

  if (isProduction) {
    aliases['react-dom/server'] = 'react-dom/server.node'
  }

  // Build plugins array - exclude React Router plugin during tests
  const plugins = [tailwindcss(), tsconfigPaths()]
  if (!isTest) {
    plugins.push(reactRouter())
  }

  return {
    resolve: {
      alias: aliases,
    },
    server: {
      port: 3000,
    },
    plugins,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
      clearMocks: true,
      isolate: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', '**/*.d.ts', '**/__tests__/**', '**/*.{test,spec}.{ts,tsx}'],
      },
    },
  }
})
