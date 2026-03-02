import { createRequestHandler } from '@react-router/express'
import crypto from 'crypto'
import express from 'express'
import compression from 'compression'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Info about Single Fetch and `installGlobals`:
// https://remix.run/docs/en/main/guides/single-fetch#enabling-single-fetch

const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV ?? 'development'

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: {
            middlewareMode: true,
            hmr: {
              port: process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT) : undefined,
            },
          },
        })
      )

const app = express()

/**
 * Good practices: Disable x-powered-by.
 * @see http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
 */
app.disable('x-powered-by')

app.use(compression())
app.use(
  morgan('dev', {
    skip: (req) => {
      // Skip logging for static assets and HMR requests
      return req.url?.startsWith('/assets') || req.url?.startsWith('/@')
    },
  })
)

/**
 * Content Security Policy.
 * Implementation based on github.com/epicweb-dev/epic-stack
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
app.use((_, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
  next()
})

app.use(
  helmet({
    contentSecurityPolicy: {
      referrerPolicy: { policy: 'same-origin' },
      crossOriginEmbedderPolicy: false,
      // ❗Important: Remove `reportOnly` to enforce CSP. (Development only).
      reportOnly: true,
      directives: {
        // Controls allowed endpoints for fetch, XHR, WebSockets, etc.
        'connect-src': [NODE_ENV === 'development' ? 'ws:' : null, "'self'"].filter(Boolean),
        // Defines which origins can serve fonts to your site.
        'font-src': ["'self'"],
        // Specifies origins allowed to be embedded as frames.
        'frame-src': ["'self'"],
        // Determines allowed sources for images.
        'img-src': ["'self'", 'data:'],
        // Sets restrictions on sources for <script> elements.
        'script-src': ["'strict-dynamic'", "'self'", (_, res) => `'nonce-${res.locals.cspNonce}'`],
        // Controls allowed sources for inline JavaScript event handlers.
        'script-src-attr': [(_, res) => `'nonce-${res.locals.cspNonce}'`],
        // Enforces that requests are made over HTTPS.
        'upgrade-insecure-requests': null,
      },
    },
  })
)

/**
 * Clean route paths. (No ending slashes, Better SEO)
 */
app.use((req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length)
    const safePath = req.path.slice(0, -1).replace(/\/+/g, '/')
    res.redirect(301, safePath + query)
  } else {
    next()
  }
})

/**
 * Rate Limit.
 * Implementation based on github.com/epicweb-dev/epic-stack
 *
 * NOTE: Running in development or tests, we want to disable rate limiting.
 */
const MAX_LIMIT_MULTIPLE = NODE_ENV !== 'production' ? 10_000 : 1

const defaultRateLimit = {
  windowMs: 60 * 1000,
  max: 1000 * MAX_LIMIT_MULTIPLE,
  standardHeaders: true,
  legacyHeaders: false,
}
const strongestRateLimit = rateLimit({
  ...defaultRateLimit,
  windowMs: 60 * 1000,
  max: 10 * MAX_LIMIT_MULTIPLE,
})
const strongRateLimit = rateLimit({
  ...defaultRateLimit,
  windowMs: 60 * 1000,
  max: 100 * MAX_LIMIT_MULTIPLE,
})
const generalRateLimit = rateLimit(defaultRateLimit)

app.use((req, res, next) => {
  const STRONG_PATHS = ['/auth/login']

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (STRONG_PATHS.some((path) => req.path.includes(path))) {
      return strongestRateLimit(req, res, next)
    }
    return strongRateLimit(req, res, next)
  }

  return generalRateLimit(req, res, next)
})

// Handle assets requests.
if (viteDevServer) {
  app.use(viteDevServer.middlewares)
} else {
  app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }))
  // Everything else (like favicon.ico) is cached for an hour.
  // You may want to be more aggressive with this caching.
  app.use(express.static('build/client', { maxAge: '1h' }))

  app.use(['/img', '/favicons'], (req, res) => {
    // If we've gone beyond express.static for these, it means something is missing.
    // In this case, we'll simply send a 404 and skip calling other middleware.
    return res.status(404).send('Not found')
  })
}

// Handle SSR requests.
let build
if (viteDevServer) {
  build = async () => {
    try {
      const mod = await viteDevServer.ssrLoadModule('virtual:react-router/server-build')
      // Vite returns a module namespace; React Router expects the build object.
      return mod.default ?? mod
    } catch (error) {
      console.error('Error loading React Router build:', error)
      throw error
    }
  }
} else {
  const mod = await import('./build/server/index.js')
  build = mod.default ?? mod
}

app.all(
  /.*/,
  createRequestHandler({
    getLoadContext: (_, res) => ({
      cspNonce: res.locals.cspNonce,
    }),

    build,
    mode: NODE_ENV,
  })
)

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', 1 /* number of proxies between user and server */)
}

app.listen(PORT, '0.0.0.0', () => console.log(`Express server listening at http://0.0.0.0:${PORT}`))
