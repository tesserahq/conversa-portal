import { ContextSourceForm } from '@/components/crud-forms/context-source-form'
import { AppPreloader } from '@/components/loader/pre-loader'
import {
  useContextSource,
  useUpdateContextSource,
} from '@/resources/hooks/context-sources/use-context-source'
import { contextSourceToFormValues } from '@/resources/queries/context-sources/context-source.utils'
import { ContextSourceFormData } from '@/resources/queries/context-sources/context-source.type'
import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function EditContextSource() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const { contextSourceID } = useParams()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const {
    data: contextSource,
    isLoading,
    error,
  } = useContextSource(config, contextSourceID!, {
    enabled: !!contextSourceID && !!token,
  })

  const { mutateAsync: updateContextSource } = useUpdateContextSource(config, {
    onSuccess: (data) => {
      navigate(`/context-sources/${data.id}`)
    },
  })

  const handleSubmit = async (data: ContextSourceFormData): Promise<void> => {
    if (!contextSourceID) return
    await updateContextSource({ id: contextSourceID, data })
  }

  if (isLoading) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <div className="p-5 text-destructive">Failed to load context source: {error.message}</div>
    )
  }

  if (!contextSource) {
    return <AppPreloader />
  }

  return (
    <ContextSourceForm
      config={config}
      onSubmit={handleSubmit}
      defaultValues={contextSourceToFormValues(contextSource)}
      submitLabel="Update"
    />
  )
}
