import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import {
  useDeleteMcpServer,
  useMcpServers,
  useRefreshMcpServerTools,
} from '@/resources/hooks/mcp-servers/use-mcp-server'
import { McpServerType } from '@/resources/queries/mcp-servers/mcp-server.type'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Button } from '@shadcn/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, EllipsisVertical, EyeIcon, RefreshCw, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router'
import { ResourceID, useApp } from 'tessera-ui'
import { DateTime, EmptyContent, NewButton } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'

export async function loader({ request }: { request: Request }) {
  const pagination = ensureCanonicalPagination(request, {
    defaultSize: 25,
    defaultPage: 1,
  })

  if (pagination instanceof Response) {
    return pagination
  }

  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, pagination }
}

export default function McpServersIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [refreshingIds, setRefreshingIds] = useState<Record<string, boolean>>({})

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useMcpServers(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingIdenties }
  )

  const { mutateAsync: deleteMcpServer } = useDeleteMcpServer(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef?.current?.updateConfig({ isLoading: false })
    },
  })

  const { mutateAsync: refreshTools } = useRefreshMcpServerTools(config)

  const handleDelete = (server: McpServerType) => {
    deleteConfirmationRef.current?.open({
      title: 'Delete MCP Server',
      description: `Are you sure you want to delete "${server.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteMcpServer(server.id)
      },
    })
  }

  const handleRefreshTools = async (server: McpServerType) => {
    setRefreshingIds((prev) => ({ ...prev, [server.id]: true }))
    try {
      await refreshTools(server.id)
    } finally {
      setRefreshingIds((prev) => ({ ...prev, [server.id]: false }))
    }
  }

  const columns = useMemo<ColumnDef<McpServerType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        cell: ({ row }) => {
          const { name } = row.original
          return (
            <Link to={`/mcp-servers/${row.original.id}`} className="button-link">
              <div className="max-w-[200px] truncate" title={name}>
                {name || '-'}
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'server_id',
        header: 'Server ID',
        size: 180,
        cell: ({ row }) => {
          const value = row.original.server_id
          return (
            <div className="max-w-[180px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'url',
        header: 'URL',
        size: 240,
        cell: ({ row }) => {
          const value = row.original.url
          return (
            <div className="max-w-[240px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'enabled',
        header: 'Enabled',
        size: 100,
        cell: ({ row }) => (row.original.enabled ? 'Yes' : 'No'),
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 200,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        size: 200,
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 150,
        cell: ({ row }) => <ResourceID value={row.original.id} />,
      },
      {
        accessorKey: 'id',
        header: 'Refresh Tools',
        size: 150,
        cell: ({ row }) => {
          const server = row.original
          const isRefreshing = !!refreshingIds[server.id]

          return (
            <Button
              variant="ghost"
              className="flex w-full justify-center gap-2 hover:bg-transparent"
              onClick={() => handleRefreshTools(server)}
              disabled={isRefreshing}
              aria-label="Refresh tools">
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : undefined} />
            </Button>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        size: 20,
        cell: ({ row }) => {
          const server = row.original

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="px-0 hover:bg-transparent"
                  aria-label="Open actions"
                  tabIndex={0}>
                  <EllipsisVertical size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="left" className="w-40 p-2">
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/mcp-servers/${server.id}`)}>
                  <EyeIcon size={18} />
                  <span>Overview</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/mcp-servers/${server.id}/edit`)}
                  aria-label="Edit MCP server"
                  tabIndex={0}>
                  <Edit size={18} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                    justify-start gap-2"
                  onClick={() => handleDelete(server)}
                  aria-label="Delete MCP server"
                  tabIndex={0}>
                  <Trash2 size={18} />
                  <span>Delete</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    [navigate, refreshingIds]
  )

  if (isLoading || isLoadingIdenties) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/empty-mcp-server.png"
        title="Failed to get MCP servers"
        description={error.message}
      />
    )
  }

  if (data?.items.length === 0) {
    return (
      <EmptyContent
        image="/images/empty-mcp-server.png"
        title="No MCP servers found"
        description="Get started by registering your first MCP server.">
        <Button onClick={() => navigate('/mcp-servers/new')} variant="black">
          Start Creating
        </Button>
      </EmptyContent>
    )
  }

  const meta = data
    ? {
        page: data.page,
        pages: data.pages,
        size: data.size,
        total: data.total,
      }
    : undefined

  return (
    <div className="h-full page-content">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="page-title">MCP Servers</h1>
        <NewButton
          label="New MCP Server"
          onClick={() => navigate('/mcp-servers/new')}
          disabled={isLoading}
        />
      </div>

      <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
