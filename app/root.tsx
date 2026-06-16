import type { LinksFunction, LoaderFunctionArgs } from 'react-router'
import {
  data,
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
} from 'react-router'
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react'

// Import global CSS styles for the application
// The ?url query parameter tells the bundler to handle this as a URL import
import { ClientHintCheck } from '@/components/misc/ClientHints'
import { GenericErrorBoundary } from '@/components/misc/ErrorBoundary'
import RootCSS from '@/styles/root.css?url'
import SpinnerCSS from '@/styles/spinner.css?url'
import ReactCountryStateCityCSS from 'react-country-state-city/dist/react-country-state-city.css?url'
import 'react-day-picker/style.css'
// import { Toaster } from '@shadcn/ui/sonner'
import { ProgressBar } from '@/components/loader/progress-bar'
import { getHints } from '@/hooks/useHints'
import { useNonce } from '@/hooks/useNonce'
import { getTheme, Theme, useTheme } from '@/hooks/useTheme'
import { ReactQueryProvider } from '@/modules/react-query'
import { csrf } from '@/utils/cookies/csrf.server'
import { getToastSession } from '@/utils/cookies/toast.server'
import { metaObject } from '@/utils/helpers/meta.helper'
import { combineHeaders, getDomainUrl } from '@/utils/helpers/misc.helper'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { AuthProvider, Toaster } from 'tessera-ui'

library.add(fab)

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  // Get the current page title from the pathname
  const getPageTitle = () => {
    const path = location.pathname
    // Remove leading slash and convert to title case
    if (path === '/') return 'Home'

    const pageName = path.split('/').pop() || ''
    return pageName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const pageTitle = getPageTitle()

  return metaObject(data ? pageTitle : 'Error')
}

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: RootCSS },
    { rel: 'stylesheet', href: SpinnerCSS },
    { rel: 'stylesheet', href: ReactCountryStateCityCSS },
  ]
}

export type LoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>

export async function loader({ request }: LoaderFunctionArgs) {
  const user = null

  const { toast, headers: toastHeaders } = await getToastSession(request)
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken()
  const clientID = process.env.AUTH0_CLIENT_ID
  const domain = process.env.AUTH0_DOMAIN
  const audience = process.env.AUTH0_AUDIENCE
  const hostUrl = process.env.HOST_URL
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const organizationID = process.env.AUTH0_ORGANIZATION_ID

  return data(
    {
      hostUrl,
      user,
      toast,
      csrfToken,
      clientID,
      domain,
      audience,
      identiesApiUrl,
      organizationID,
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: { theme: getTheme(request) },
      },
    } as const,
    {
      headers: combineHeaders(
        toastHeaders,
        csrfCookieHeader ? { 'Set-Cookie': csrfCookieHeader } : null
      ),
    }
  )
}

function Document({
  children,
  nonce,
  dir = 'ltr',
  theme = 'light',
}: {
  children: React.ReactNode
  nonce: string
  dir?: 'ltr' | 'rtl'
  theme?: Theme
}) {
  return (
    <html
      lang="en"
      dir={dir}
      className={`${theme} overflow-x-hidden`}
      style={{ colorScheme: theme }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"></link>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <Links />
      </head>
      <body className="h-auto w-full">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <Toaster position="top-right" theme={theme} richColors />
      </body>
    </html>
  )
}

export default function AppWithProviders() {
  const { csrfToken, clientID, domain, audience, hostUrl, identiesApiUrl, organizationID } =
    useLoaderData<typeof loader>()

  const nonce = useNonce()
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Document nonce={nonce} theme={theme}>
      <ProgressBar />
      <AuthenticityTokenProvider token={csrfToken}>
        <AuthProvider
          auth0={{
            domain: domain ?? '',
            clientId: clientID ?? '',
            audience: audience ?? '',
            organizationID: organizationID ?? '',
            redirectUri: hostUrl || 'http://localhost:3000',
          }}
          identiesApiUrl={identiesApiUrl ?? ''}
          onUnauthenticated={() => {
            navigate('/')
          }}
          requireAuth={false}>
          <ReactQueryProvider>
            <Outlet />
          </ReactQueryProvider>
        </AuthProvider>
      </AuthenticityTokenProvider>
    </Document>
  )
}

export function ErrorBoundary() {
  const nonce = useNonce()
  const theme = useTheme()

  return (
    <Document nonce={nonce} theme={theme}>
      <GenericErrorBoundary
        statusHandlers={{
          403: ({ error }) => <p>You are not allowed to do that: {error?.data.message}</p>,
        }}
      />
    </Document>
  )
}
