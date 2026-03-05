import { ContextSourceForm } from '@/components/crud-forms/context-source-form'
import { useCreateContextSource } from '@/resources/hooks/context-sources/use-context-source'
import { contextSourceFormDefaultValue } from '@/resources/queries/context-sources/context-source.schema'
import { ContextSourceFormData } from '@/resources/queries/context-sources/context-source.type'
import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate } from 'react-router'
import { useApp } from 'tessera-ui'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function NewContextSource() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const { mutateAsync: createContextSource } = useCreateContextSource(config, {
    onSuccess: (data) => {
      navigate(`/context-sources/${data.id}`)
    },
  })

  const handleSubmit = async (data: ContextSourceFormData): Promise<void> => {
    await createContextSource(data)
  }

  return (
    <ContextSourceForm
      config={config}
      onSubmit={handleSubmit}
      defaultValues={contextSourceFormDefaultValue}
    />
  )
}
