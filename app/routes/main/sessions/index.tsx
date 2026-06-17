import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useSessions } from '@/resources/hooks/sessions/use-session'
import { SessionType } from '@/resources/queries/sessions/session.type'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { EyeIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router'
import { ResourceID, useApp } from 'tessera-ui'
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

export default function SessionsIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useSessions(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingIdenties }
  )

  const columns = useMemo<ColumnDef<SessionType>[]>(
    () => [
      {
        accessorKey: 'session_key',
        header: 'Session Key',
        size: 200,
        cell: ({ row }) => {
          const value = row.original.session_key
          return (
            <Link to={`/sessions/${row.original.id}`} className="button-link">
              <div className="max-w-[200px] truncate" title={value}>
                {value || '-'}
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'display_name',
        header: 'Display Name',
        size: 200,
        cell: ({ row }) => {
          const { display_name } = row.original
          return (
            <div className="max-w-[200px] truncate" title={display_name}>
              {display_name || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        size: 120,
        cell: ({ row }) => {
          const value = row.original.channel
          return value ? <Badge variant="secondary">{value}</Badge> : '-'
        },
      },
      {
        accessorKey: 'account_id',
        header: 'Account ID',
        size: 160,
        cell: ({ row }) => {
          const value = row.original.account_id
          return (
            <div className="max-w-[160px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'message_count',
        header: 'Messages',
        size: 100,
        cell: ({ row }) => row.original.message_count ?? 0,
      },
      {
        accessorKey: 'last_message_at',
        header: 'Last Message At',
        size: 180,
        cell: ({ row }) => {
          const date = row.original.last_message_at
          return date ? <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" /> : '-'
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 180,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 150,
        cell: ({ row }) => <ResourceID value={row.original.id} />,
      },
    ],
    [navigate]
  )

  if (isLoading || isLoadingIdenties) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/empty-session.png"
        title="Failed to get sessions"
        description={error.message}
      />
    )
  }

  if (data?.items.length === 0) {
    return (
      <EmptyContent
        image="/images/empty-session.png"
        title="No sessions found"
        description="Chat sessions will appear here once conversations start."
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
        <h1 className="page-title">Sessions</h1>
      </div>

      <div className="animate-slide-up">
        <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />
      </div>
    </div>
  )
}
