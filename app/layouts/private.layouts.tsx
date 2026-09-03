import { useRequestInfo } from '@/hooks/useRequestInfo'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { SITE_CONFIG } from '@/utils/config/site.config'
import { Database, KeyRound, MessageCircle, MessagesSquare } from 'lucide-react'
import { Outlet, useLocation, useNavigate, useParams, useSubmit } from 'react-router'
import { Layout, MainItemProps } from 'tessera-ui'

export default function PrivateLayout() {
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const params = useParams()
  const navigate = useNavigate()
  const isEditPage = useLocation().pathname.includes('edit')
  const shouldCollapseSidebar =
    (Boolean(params['credentialID']) ||
      Boolean(params['contextSourceID']) ||
      Boolean(params['sessionID'])) &&
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
      title: 'Sessions',
      path: `/sessions`,
      icon: MessagesSquare,
    },
    {
      title: 'Chat',
      path: `/chat`,
      icon: MessageCircle,
    },
  ]

  return (
    <Layout.Main menuItems={menuItems} collapseSidebar={shouldCollapseSidebar}>
      <Layout.Header
        actionLogout={() => navigate('/logout')}
        actionProfile={() => {}}
        onSetTheme={(theme) => onSetTheme(theme)}
        selectedTheme={requestInfo.userPrefs.theme || 'system'}
        title={SITE_CONFIG.siteTitle}
      />
      <Outlet />
    </Layout.Main>
  )
}
