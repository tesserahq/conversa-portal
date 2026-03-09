import { McpServerForm } from '@/components/crud-forms/mcp-server-form'
import { useCreateMcpServer } from '@/resources/hooks/mcp-servers/use-mcp-server'
import { mcpServerFormDefaultValue } from '@/resources/queries/mcp-servers/mcp-server.schema'
import { McpServerFormData } from '@/resources/queries/mcp-servers/mcp-server.type'
import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate } from 'react-router'
import { useApp } from 'tessera-ui'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function NewMcpServer() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const { mutateAsync: createMcpServer } = useCreateMcpServer(config, {
    onSuccess: (data) => {
      navigate(`/mcp-servers/${data.id}`)
    },
  })

  const handleSubmit = async (data: McpServerFormData): Promise<void> => {
    await createMcpServer(data)
  }

  return (
    <McpServerForm
      config={config}
      onSubmit={handleSubmit}
      defaultValues={mcpServerFormDefaultValue}
    />
  )
}
