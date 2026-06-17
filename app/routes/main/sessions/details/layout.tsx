import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { Button } from '@/modules/shadcn/ui/button'
import { useSession } from '@/resources/hooks/sessions/use-session'
import { FileText } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'

export function loader({ params }: { params: { sessionID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.sessionID }
}

export default function SessionDetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/sessions/${params.sessionID}/overview`,
      icon: FileText,
    },
  ]

  const {
    data: session,
    isLoading,
    error,
  } = useSession({ apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }, params.sessionID as string, {
    enabled: !!token,
  })

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    apiUrl,
    nodeEnv,
    token: token ?? undefined,
  })

  const sessionID = params.sessionID

  if (!isLoading && (error || !session)) {
    return (
      <EmptyContent
        title="Session Not Found"
        image="/images/empty-session.png"
        description={`We can't find session with ID ${params.sessionID}. ${(error as Error)?.message ?? ''}`}>
        <Button onClick={() => navigate('/sessions')}>Back to Sessions</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length === 0 || !token || !sessionID}>
      <div className="max-w-screen-2xl mx-auto p-3">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
