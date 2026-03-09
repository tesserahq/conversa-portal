import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { Switch } from '@/modules/shadcn/ui/switch'
import {
  useContextSources,
  useDeleteContextSource,
  useUpdateContextSource,
} from '@/resources/hooks/context-sources/use-context-source'
import { ContextSourceType } from '@/resources/queries/context-sources/context-source.type'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Button } from '@shadcn/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, EllipsisVertical, EyeIcon, Trash2 } from 'lucide-react'
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

export default function ContextSourcesIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({})

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useContextSources(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingIdenties }
  )

  const { mutateAsync: deleteContextSource } = useDeleteContextSource(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef?.current?.updateConfig({ isLoading: false })
    },
  })

  const { mutateAsync: updateContextSource } = useUpdateContextSource(config)

  const handleDelete = (contextSource: ContextSourceType) => {
    deleteConfirmationRef.current?.open({
      title: 'Delete Context Source',
      description: `Are you sure you want to delete "${contextSource.display_name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteContextSource(contextSource.id)
      },
    })
  }

  const handleToggleEnabled = async (contextSource: ContextSourceType, enabled: boolean) => {
    setTogglingIds((prev) => ({ ...prev, [contextSource.id]: true }))
    try {
      await updateContextSource({
        id: contextSource.id,
        data: { enabled },
      })
    } finally {
      setTogglingIds((prev) => ({ ...prev, [contextSource.id]: false }))
    }
  }

  const columns = useMemo<ColumnDef<ContextSourceType>[]>(
    () => [
      {
        accessorKey: 'display_name',
        header: 'Display Name',
        size: 220,
        cell: ({ row }) => {
          const value = row.original.display_name
          return (
            <Link to={`/context-sources/${row.original.id}`} className="button-link">
              <div className="max-w-[220px] truncate" title={value}>
                {value || '-'}
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'source_id',
        header: 'Source ID',
        size: 200,
        cell: ({ row }) => {
          const value = row.original.source_id
          return (
            <div className="max-w-[200px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'base_url',
        header: 'Base URL',
        size: 240,
        cell: ({ row }) => {
          const value = row.original.base_url
          return (
            <div className="max-w-[240px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
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
        size: 160,
        cell: ({ row }) => <ResourceID value={row.original.id} />,
      },
      {
        accessorKey: 'enabled',
        header: 'Enabled',
        size: 110,
        cell: ({ row }) => {
          const contextSource = row.original
          const isToggling = !!togglingIds[contextSource.id]
          return (
            <div className="flex items-center justify-center">
              <Switch
                checked={contextSource.enabled}
                disabled={isToggling}
                onCheckedChange={(checked) => handleToggleEnabled(contextSource, checked)}
                aria-label={`Toggle ${contextSource.display_name} enabled`}
              />
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        size: 20,
        cell: ({ row }) => {
          const contextSource = row.original
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
                  onClick={() => navigate(`/context-sources/${contextSource.id}`)}>
                  <EyeIcon size={18} />
                  <span>Overview</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/context-sources/${contextSource.id}/edit`)}>
                  <Edit size={18} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                    justify-start gap-2"
                  onClick={() => handleDelete(contextSource)}>
                  <Trash2 size={18} />
                  <span>Delete</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    [navigate, togglingIds]
  )

  if (isLoading || isLoadingIdenties) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/empty-credential.png"
        title="Failed to get context sources"
        description={error.message}
      />
    )
  }

  if (data?.items.length === 0) {
    return (
      <EmptyContent
        image="/images/empty-context-source.png"
        title="No context sources found"
        description="Get started by creating your first context source.">
        <Button onClick={() => navigate('/context-sources/new')} variant="black">
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
        <h1 className="page-title">Context Sources</h1>
        <NewButton
          label="New Context Source"
          onClick={() => navigate('/context-sources/new')}
          disabled={isLoading}
        />
      </div>

      <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
