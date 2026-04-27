import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig((config) => {
  const isProduction = process.env.NODE_ENV === 'production'
  const aliases: { [key: string]: string } = {
    '@': resolve(__dirname, './app'),
    '@shadcn': resolve(__dirname, './app/modules/shadcn'),
  }

  if (isProduction) {
    aliases['react-dom/server'] = 'react-dom/server.node'
  }

  const plugins = [tailwindcss(), reactRouter()]

  return {
    resolve: {
      alias: aliases,
      tsconfigPaths: true,
    },
    server: {
      port: 3000,
    },
    plugins,
  }
})
