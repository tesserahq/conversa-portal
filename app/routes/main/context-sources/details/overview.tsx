import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import {
  useContextSource,
  useDeleteContextSource,
} from '@/resources/hooks/context-sources/use-context-source'
import { Button } from '@shadcn/ui/button'
import { Edit, EllipsisVertical, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { ResourceID, useApp } from 'tessera-ui'
import { DateTime } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'

export async function loader({ params }: { params: { contextSourceID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.contextSourceID }
}

export default function ContextSourceOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data: contextSource, isLoading } = useContextSource(config, id)

  const { mutateAsync: deleteContextSource } = useDeleteContextSource(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
      navigate('/context-sources')
    },
  })

  const handleDelete = () => {
    if (!contextSource) return
    deleteConfirmationRef.current?.open({
      title: 'Delete Context Source',
      description: `Are you sure you want to delete "${contextSource.display_name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteContextSource(contextSource.id)
      },
    })
  }

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent
        title={contextSource?.display_name || ''}
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="px-0">
                <EllipsisVertical size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="left" className="w-40 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2"
                onClick={() => navigate(`/context-sources/${params.contextSourceID}/edit`)}>
                <Edit size={18} />
                <span>Edit</span>
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
          <div className="d-item pb-1! mt-1!">
            <dt className="d-label w-40">ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={contextSource?.id || ''} />
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-40">Source ID</dt>
            <dd className="d-content">{contextSource?.source_id || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-40">Display Name</dt>
            <dd className="d-content">{contextSource?.display_name || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-40">Base URL</dt>
            <dd className="d-content break-all">{contextSource?.base_url || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1! mt-1!">
            <dt className="d-label w-40">Credential ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={contextSource?.credential_id || ''} />
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-40">Poll Interval (seconds)</dt>
            <dd className="d-content">{contextSource?.poll_interval_seconds ?? 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-40">Enabled</dt>
            <dd className="d-content">{contextSource?.enabled ? 'Yes' : 'No'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-40">Supports ETag</dt>
            <dd className="d-content">
              {contextSource?.capabilities?.supports_etag ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-40">Supports Since Cursor</dt>
            <dd className="d-content">
              {contextSource?.capabilities?.supports_since_cursor ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-40">Created At</dt>
            <dd className="d-content">
              {contextSource?.created_at && <DateTime date={contextSource.created_at} />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label w-40">Updated At</dt>
            <dd className="d-content">
              {contextSource?.updated_at && <DateTime date={contextSource.updated_at} />}
            </dd>
          </div>
        </div>
      </DetailContent>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
