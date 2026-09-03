import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import {
  useContextSourceSyncState,
  useTriggerContextSync,
} from '@/resources/hooks/context-sources/use-context-source-sync-state'
import { ContextSourceSyncStateType } from '@/resources/queries/context-sources/context-source-sync-state.type'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { ColumnDef } from '@tanstack/react-table'
import { RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLoaderData, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { DateTime, EmptyContent } from 'tessera-ui/components'

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

export default function ContextSourceSyncState() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const params = useParams()
  const sourceID = params.contextSourceID as string

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [syncingUserId, setSyncingUserId] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useContextSourceSyncState(
    sourceID,
    config,
    { page: pagination.page, size: pagination.size, search: search || undefined },
    { enabled: !!token && !isLoadingIdenties && !!sourceID }
  )

  const { mutateAsync: triggerContextSync } = useTriggerContextSync(config, {
    onSuccess: () => setSyncingUserId(null),
    onError: () => setSyncingUserId(null),
  })

  const handleResync = async (userId: string) => {
    setSyncingUserId(userId)
    await triggerContextSync(userId)
  }

  const columns = useMemo<ColumnDef<ContextSourceSyncStateType>[]>(
    () => [
      {
        accessorKey: 'user_email',
        header: 'User',
        size: 220,
        cell: ({ row }) => {
          const { user_email, user_id } = row.original
          return (
            <div className="max-w-[220px] truncate" title={user_email || user_id}>
              {user_email || user_id}
            </div>
          )
        },
      },
      {
        accessorKey: 'last_success_at',
        header: 'Last Success',
        size: 180,
        cell: ({ row }) => {
          const date = row.original.last_success_at
          return date ? <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" /> : '-'
        },
      },
      {
        accessorKey: 'last_attempt_at',
        header: 'Last Attempt',
        size: 180,
        cell: ({ row }) => {
          const date = row.original.last_attempt_at
          return date ? <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" /> : '-'
        },
      },
      {
        accessorKey: 'last_error',
        header: 'Last Error',
        size: 260,
        cell: ({ row }) => {
          const value = row.original.last_error
          if (!value) return '-'
          return (
            <div className="max-w-[260px] truncate text-red-600 dark:text-red-400" title={value}>
              {value}
            </div>
          )
        },
      },
      {
        accessorKey: 'next_run_at',
        header: 'Next Run',
        size: 180,
        cell: ({ row }) => {
          const date = row.original.next_run_at
          return date ? <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" /> : '-'
        },
      },
      {
        id: 'actions',
        header: '',
        size: 140,
        cell: ({ row }) => {
          const userId = row.original.user_id
          return (
            <Button
              variant="outline"
              size="sm"
              disabled={syncingUserId === userId}
              onClick={() => handleResync(userId)}>
              <RefreshCw
                className={`mr-1 h-3.5 w-3.5 ${syncingUserId === userId ? 'animate-spin' : ''}`}
              />
              Re-sync user
            </Button>
          )
        },
      },
    ],
    [syncingUserId]
  )

  if (isLoading || isLoadingIdenties) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/empty-context-source.png"
        title="Failed to get sync state"
        description={error.message}
      />
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
      <div className="mb-5 animate-slide-up flex items-center justify-between">
        <h1 className="page-title">Sync State</h1>
        <Input
          placeholder="Search by user email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="animate-slide-up">
        <DataTable
          columns={columns}
          data={data?.items || []}
          meta={meta}
          isLoading={isLoading}
          hasFilter
          empty={
            <span className="text-navy-500 dark:text-navy-300 text-sm">
              {search ? 'No user matches this search.' : 'No user has synced from this source yet.'}
            </span>
          }
        />
      </div>
    </div>
  )
}
