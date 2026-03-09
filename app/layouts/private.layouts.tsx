import { AppPreloader } from '@/components/loader/pre-loader'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { useRequestInfo } from '@/hooks/useRequestInfo'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { SITE_CONFIG } from '@/utils/config/site.config'
import { useAuth0 } from '@auth0/auth0-react'
import { Database, KeyRound, Server } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams, useSubmit } from 'react-router'
import { Layout, MainItemProps, TesseraProvider } from 'tessera-ui'

export function loader() {
  const identiesApiUrl = process.env.IDENTIES_API_URL
  // app host urls
  const quoreHostUrl = process.env.QUORE_HOST_URL
  const looplyHostUrl = process.env.LOOPLY_HOST_URL
  const vaultaHostUrl = process.env.VAULTA_HOST_URL
  const identiesHostUrl = process.env.IDENTIES_HOST_URL
  const orchaHostUrl = process.env.ORCHA_HOST_URL
  const conversaHostUrl = process.env.CONVERSA_HOST_URL
  const indexaHostUrl = process.env.INDEXA_HOST_URL
  const sendlyHostUrl = process.env.SENDLY_HOST_URL

  return {
    quoreHostUrl,
    looplyHostUrl,
    vaultaHostUrl,
    identiesHostUrl,
    orchaHostUrl,
    conversaHostUrl,
    indexaHostUrl,
    sendlyHostUrl,
    identiesApiUrl,
  }
}

export default function PrivateLayout() {
  const {
    identiesApiUrl,
    quoreHostUrl,
    looplyHostUrl,
    vaultaHostUrl,
    identiesHostUrl,
    orchaHostUrl,
    conversaHostUrl,
    indexaHostUrl,
    sendlyHostUrl,
  } = useLoaderData<typeof loader>()

  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [token, setToken] = useState<string>('')
  const handleApiError = useHandleApiError()
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const params = useParams()
  const isEditPage = useLocation().pathname.includes('edit')
  const shouldCollapseSidebar =
    (Boolean(params['credentialID']) ||
      Boolean(params['contextSourceID']) ||
      Boolean(params['mcpServerID'])) &&
    !isEditPage

  const onSetTheme = (theme: string) => {
    submit(
      { theme },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      }
    )
  }
  const fetchToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      setToken(token)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      handleApiError!(error)
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchToken()
    }
  }, [isLoading, isAuthenticated])

  const appHostUrls = {
    quore: quoreHostUrl!,
    looply: looplyHostUrl!,
    vaulta: vaultaHostUrl!,
    identies: identiesHostUrl!,
    orcha: orchaHostUrl!,
    conversa: conversaHostUrl!,
    indexa: indexaHostUrl!,
    sendly: sendlyHostUrl!,
    custos: '',
  }

  const menuItems: MainItemProps[] = [
    {
      title: 'Credentials',
      path: `/credentials`,
      icon: KeyRound,
    },
    {
      title: 'Context Sources',
      path: `/context-sources`,
      icon: Database,
    },
    {
      title: 'MCP Servers',
      path: `/mcp-servers`,
      icon: Server,
    },
  ]

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <TesseraProvider identiesApiUrl={identiesApiUrl!} token={token}>
      <Layout.Main menuItems={menuItems} collapseSidebar={shouldCollapseSidebar}>
        <Layout.Header
          appHostUrls={appHostUrls}
          actionLogout={() => {}}
          actionProfile={() => {}}
          onSetTheme={(theme) => onSetTheme(theme)}
          selectedTheme={requestInfo.userPrefs.theme || 'system'}
          title={SITE_CONFIG.siteTitle}
        />
        <Outlet />
      </Layout.Main>
    </TesseraProvider>
  )
}
