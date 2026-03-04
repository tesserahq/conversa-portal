import { CredentialForm } from '@/components/crud-forms/credential-form'
import { useCreateCredential } from '@/resources/hooks/credentials/use-credential'
import { credentialFormDefaultValue } from '@/resources/queries/credentials/credential.schema'
import { CredentialFormData } from '@/resources/queries/credentials/credential.type'
import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate } from 'react-router'
import { useApp } from 'tessera-ui'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function NewCredential() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const { mutateAsync: createCredential } = useCreateCredential(config, {
    onSuccess: (data) => {
      navigate(`/credentials/${data.id}`)
    },
  })

  const handleSubmit = async (data: CredentialFormData): Promise<void> => {
    await createCredential(data)
  }

  return <CredentialForm onSubmit={handleSubmit} defaultValues={credentialFormDefaultValue} />
}
