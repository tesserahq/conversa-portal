import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { Button } from '@/modules/shadcn/ui/button'
import { useContextSource } from '@/resources/hooks/context-sources/use-context-source'
import { FileText } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'

export function loader({ params }: { params: { contextSourceID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.contextSourceID }
}

export default function ContextSourceDetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/context-sources/${params.contextSourceID}/overview`,
      icon: FileText,
    },
  ]

  const {
    data: contextSource,
    isLoading,
    error,
  } = useContextSource(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv },
    params.contextSourceID as string,
    { enabled: !!token }
  )

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    apiUrl,
    nodeEnv,
    token: token ?? undefined,
  })

  const contextSourceID = params.contextSourceID

  if (!isLoading && (error || !contextSource)) {
    return (
      <EmptyContent
        title="Context Source Not Found"
        image="/images/empty-credential.png"
        description={`We can't find context source with ID ${params.contextSourceID}. ${(error as Error)?.message ?? ''}`}>
        <Button onClick={() => navigate('/context-sources')}>Back to Context Sources</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length === 0 || !token || !contextSourceID}>
      <div className="max-w-screen-2xl mx-auto p-3">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
