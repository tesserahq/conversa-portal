import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { ResourceID, useApp } from 'tessera-ui'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { useCredential, useDeleteCredential } from '@/resources/hooks/credentials/use-credential'
import { Button } from '@shadcn/ui/button'
import { Edit, EllipsisVertical, Trash2 } from 'lucide-react'
import { Activity, useRef } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { DateTime } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'
import { getCredentialTypeDisplay } from '@/components/crud-forms/credential-form'
import Markdown from '@/components/makrdown/markdown'
import { fieldsForDisplay } from '@/resources/queries/credentials/credential.utils'

export async function loader({ params }: { params: { credentialID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.credentialID }
}

export default function CredentialOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data: credential, isLoading } = useCredential(config, id)

  const { mutateAsync: deleteCredential } = useDeleteCredential(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
      navigate('/credentials')
    },
  })

  const handleDelete = () => {
    if (!credential) return
    deleteConfirmationRef.current?.open({
      title: 'Delete Credential',
      description: `Are you sure you want to delete "${credential.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteCredential(credential.id)
      },
    })
  }

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent
        title={credential?.name || ''}
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
                onClick={() => navigate(`/credentials/${params.credentialID}/edit`)}>
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
          <div className="d-item pb-1!">
            <dt className="d-label">ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={credential?.id || ''} />
            </dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Type</dt>
            <dd className="d-content">
              {credential?.type ? (
                <div className="flex items-center gap-1">
                  {getCredentialTypeDisplay(credential.type).icon}
                  <span>{getCredentialTypeDisplay(credential.type).displayName}</span>
                </div>
              ) : (
                'N/A'
              )}
            </dd>
          </div>
          <Activity mode={credential?.fields ? 'visible' : 'hidden'}>
            <div className="d-item items-start! pb-0! mt-3!">
              <dt className="d-label">Fields</dt>
              <dd className="d-content">
                <Markdown>{`\`\`\`json\n${JSON.stringify(fieldsForDisplay(credential?.fields), null, 2)}\n\`\`\``}</Markdown>
              </dd>
            </div>
          </Activity>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">
              {credential?.created_at && <DateTime date={credential?.created_at} />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">
              {credential?.updated_at && <DateTime date={credential?.updated_at} />}
            </dd>
          </div>
        </div>
      </DetailContent>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
