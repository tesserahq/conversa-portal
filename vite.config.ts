import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig((config) => {
  const isProduction = process.env.NODE_ENV === 'production'
  const aliases: { [key: string]: string } = {
    '@': resolve(__dirname, './app'),
  }

  if (isProduction) {
    aliases['react-dom/server'] = 'react-dom/server.node'
  }

  // Build plugins array - exclude React Router plugin during tests
  const plugins = [tailwindcss(), tsconfigPaths(), reactRouter()]

  return {
    resolve: {
      alias: aliases,
    },
    server: {
      port: 3000,
    },
    plugins,
  }
})
