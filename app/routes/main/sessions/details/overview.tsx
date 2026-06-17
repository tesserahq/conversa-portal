import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { SessionMessagesPanel } from '@/components/session-messages-panel'
import { useSession } from '@/resources/hooks/sessions/use-session'
import { Badge } from '@shadcn/ui/badge'
import { useLoaderData } from 'react-router'
import { ResourceID, useApp } from 'tessera-ui'
import { DateTime } from 'tessera-ui/components'

export async function loader({ params }: { params: { sessionID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.sessionID }
}

export default function SessionOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data: session, isLoading } = useSession(config, id)

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="animate-slide-up grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
      <DetailContent
        title={session?.display_name || session?.session_key || 'Session'}
        className="lg:col-span-1">
        <div className="d-list">
          <div className="d-item pb-1!">
            <dt className="d-label w-44">ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={session?.id || ''} />
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Session Key</dt>
            <dd className="d-content break-all">{session?.session_key || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Display Name</dt>
            <dd className="d-content">{session?.display_name || 'N/A'}</dd>
          </div>

          <div className="d-item">
            <dt className="d-label w-44">Channel</dt>
            <dd className="d-content">
              {session?.channel ? <Badge variant="secondary">{session.channel}</Badge> : 'N/A'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Account ID</dt>
            <dd className="d-content">{session?.account_id || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Chat ID</dt>
            <dd className="d-content break-all">{session?.chat_id || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Thread ID</dt>
            <dd className="d-content break-all">{session?.thread_id || '—'}</dd>
          </div>
          <div className="d-item pb-1! mt-1!">
            <dt className="d-label w-44">User ID</dt>
            <dd className="d-content break-all">
              {session?.user_id ? <ResourceID value={session.user_id} /> : 'N/A'}
            </dd>
          </div>
          {session?.origin && (
            <div className="d-item">
              <dt className="d-label w-44">Origin</dt>
              <dd className="d-content">
                {session.origin.label} ({session.origin.from} → {session.origin.to})
              </dd>
            </div>
          )}
          <div className="d-item">
            <dt className="d-label w-44">Message Count</dt>
            <dd className="d-content">{session?.message_count ?? 0}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Last Message At</dt>
            <dd className="d-content">
              {session?.last_message_at ? (
                <DateTime date={session.last_message_at} tooltipSide="left" />
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Created At</dt>
            <dd className="d-content">
              {session?.created_at && <DateTime date={session.created_at} tooltipSide="left" />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-44">Updated At</dt>
            <dd className="d-content">
              {session?.updated_at && <DateTime date={session.updated_at} tooltipSide="left" />}
            </dd>
          </div>
        </div>
      </DetailContent>

      <SessionMessagesPanel
        config={config}
        sessionId={id}
        enabled={!!token && !isLoadingIdenties}
        className="h-[calc(100vh-12rem)] lg:col-span-2"
      />
    </div>
  )
}
