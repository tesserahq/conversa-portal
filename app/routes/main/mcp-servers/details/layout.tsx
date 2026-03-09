import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { Button } from '@/modules/shadcn/ui/button'
import { useMcpServer } from '@/resources/hooks/mcp-servers/use-mcp-server'
import { FileText } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'

export function loader({ params }: { params: { mcpServerID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.mcpServerID }
}

export default function McpServerDetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/mcp-servers/${params.mcpServerID}/overview`,
      icon: FileText,
    },
  ]

  const {
    data: mcpServer,
    isLoading,
    error,
  } = useMcpServer(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv },
    params.mcpServerID as string,
    { enabled: !!token }
  )

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    apiUrl,
    nodeEnv,
    token: token ?? undefined,
  })

  const mcpServerID = params.mcpServerID

  if (!isLoading && (error || !mcpServer)) {
    return (
      <EmptyContent
        title="MCP Server Not Found"
        image="/images/empty-credential.png"
        description={`We can't find MCP server with ID ${params.mcpServerID}. ${(error as Error)?.message ?? ''}`}>
        <Button onClick={() => navigate('/mcp-servers')}>Back to MCP Servers</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length === 0 || !token || !mcpServerID}>
      <div className="max-w-screen-2xl mx-auto p-3">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
