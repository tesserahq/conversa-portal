import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import {
  useDeleteMcpServer,
  useMcpServer,
  useRefreshMcpServerTools,
} from '@/resources/hooks/mcp-servers/use-mcp-server'
import { Button } from '@shadcn/ui/button'
import { Edit, EllipsisVertical, RefreshCw, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { ResourceID, useApp } from 'tessera-ui'
import { DateTime } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'

export async function loader({ params }: { params: { mcpServerID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.mcpServerID }
}

export default function McpServerOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data: mcpServer, isLoading } = useMcpServer(config, id)

  const { mutateAsync: deleteMcpServer } = useDeleteMcpServer(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
      navigate('/mcp-servers')
    },
  })

  const { mutateAsync: refreshTools } = useRefreshMcpServerTools(config, {
    onSuccess: () => setIsRefreshing(false),
    onError: () => setIsRefreshing(false),
  })

  const handleDelete = () => {
    if (!mcpServer) return
    deleteConfirmationRef.current?.open({
      title: 'Delete MCP Server',
      description: `Are you sure you want to delete "${mcpServer.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteMcpServer(mcpServer.id)
      },
    })
  }

  const handleRefreshTools = () => {
    if (!mcpServer) return
    setIsRefreshing(true)
    refreshTools(mcpServer.id)
  }

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent
        title={mcpServer?.name || ''}
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="px-0">
                <EllipsisVertical size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="left" className="w-48 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2"
                onClick={() => navigate(`/mcp-servers/${params.mcpServerID}/edit`)}>
                <Edit size={18} />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2"
                onClick={handleRefreshTools}
                disabled={isRefreshing}>
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : undefined} />
                <span>{isRefreshing ? 'Refreshing…' : 'Refresh tools'}</span>
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                  justify-start gap-2"
                onClick={handleDelete}>
                <Trash2 size={18} />
                <span>Delete</span>
              </Button>
            </PopoverContent>
          </Popover>
        }>
        <div className="d-list">
          <div className="d-item pb-1!">
            <dt className="d-label w-44">ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={mcpServer?.id || ''} />
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Server ID</dt>
            <dd className="d-content">{mcpServer?.server_id || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Name</dt>
            <dd className="d-content">{mcpServer?.name || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">URL</dt>
            <dd className="d-content break-all">{mcpServer?.url || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1! mt-1!">
            <dt className="d-label w-44">Credential ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={mcpServer?.credential_id || ''} />
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Tool prefix</dt>
            <dd className="d-content">{mcpServer?.tool_prefix || '—'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Tool cache TTL (seconds)</dt>
            <dd className="d-content">{mcpServer?.tool_cache_ttl_seconds ?? 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Enabled</dt>
            <dd className="d-content">{mcpServer?.enabled ? 'Yes' : 'No'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Created At</dt>
            <dd className="d-content">
              {mcpServer?.created_at && <DateTime date={mcpServer.created_at} />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Updated At</dt>
            <dd className="d-content">
              {mcpServer?.updated_at && <DateTime date={mcpServer.updated_at} />}
            </dd>
          </div>
        </div>
      </DetailContent>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
