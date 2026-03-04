import { CredentialForm } from '@/components/crud-forms/credential-form'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useCredential, useUpdateCredential } from '@/resources/hooks/credentials/use-credential'
import { credentialToFormValues } from '@/resources/queries/credentials/credential.utils'
import { CredentialFormData } from '@/resources/queries/credentials/credential.type'
import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function EditCredential() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const { credentialID } = useParams()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const {
    data: credential,
    isLoading,
    error,
  } = useCredential(config, credentialID!, {
    enabled: !!credentialID && !!token,
  })

  const { mutateAsync: updateCredential } = useUpdateCredential(config, {
    onSuccess: (data) => {
      navigate(`/credentials/${data.id}`)
    },
  })

  const handleSubmit = async (data: CredentialFormData): Promise<void> => {
    if (!credentialID) return
    await updateCredential({ id: credentialID, data })
  }

  if (isLoading || !credential) {
    return <AppPreloader />
  }

  if (error) {
    return <div className="p-5 text-destructive">Failed to load credential: {error.message}</div>
  }

  return (
    <CredentialForm
      onSubmit={handleSubmit}
      defaultValues={credentialToFormValues(credential)}
      submitLabel="Update"
    />
  )
}
