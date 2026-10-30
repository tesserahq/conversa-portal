import { NonceProvider } from '@/hooks/useNonce'
import { initEnvs } from '@/utils/config/env.config'
import { createReadableStreamFromReadable } from '@react-router/node'
import { isbot } from 'isbot'
import { PassThrough } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server.node'
import { I18nextProvider } from 'react-i18next'
import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getInstance } from '@/modules/i18n/i18n.server'
import * as i18n from '@/modules/i18n/i18n'
import type { EntryContext, RouterContextProvider } from 'react-router'
import { ServerRouter } from 'react-router'

/**
 * Environment Variables.
 */
initEnvs()

const ABORT_DELAY = 5_000
const fallbackI18n = createInstance()
const fallbackI18nReady = fallbackI18n.use(initReactI18next).init({ ...i18n })

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  routerContext: RouterContextProvider
) {
  const callbackName = isbot(request.headers.get('user-agent')) ? 'onAllReady' : 'onShellReady'
  let requestI18n
  try {
    requestI18n = getInstance(routerContext)
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'No value found for context') throw error
    await fallbackI18nReady
    requestI18n = fallbackI18n
  }

  /**
   * Content Security Policy.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
   */
  const nonce = request.headers.get('x-conversa-csp-nonce') ?? ''

  /**
   * Currently, we're not setting the CSP headers due to lack of support on deferred scripts.
   * @see https://github.com/remix-run/remix/issues/5156
   *
  responseHeaders.set(
    'Content-Security-Policy',
    `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none';`,
  )
  */

  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <I18nextProvider i18n={requestI18n}>
          <ServerRouter context={reactRouterContext} url={request.url} />
        </I18nextProvider>
      </NonceProvider>,
      {
        [callbackName]: () => {
          shellRendered = true
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set('Content-Type', 'text/html')

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          )

          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          if (shellRendered) {
            console.error(error)
          }
        },
        nonce,
      }
    )

    setTimeout(abort, ABORT_DELAY)
  })
}
