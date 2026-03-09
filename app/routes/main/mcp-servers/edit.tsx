import { McpServerForm } from '@/components/crud-forms/mcp-server-form'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useMcpServer, useUpdateMcpServer } from '@/resources/hooks/mcp-servers/use-mcp-server'
import { mcpServerToFormValues } from '@/resources/queries/mcp-servers/mcp-server.utils'
import { McpServerFormData } from '@/resources/queries/mcp-servers/mcp-server.type'
import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function EditMcpServer() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const { mcpServerID } = useParams()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const {
    data: server,
    isLoading,
    error,
  } = useMcpServer(config, mcpServerID!, {
    enabled: !!mcpServerID && !!token,
  })

  const { mutateAsync: updateMcpServer } = useUpdateMcpServer(config, {
    onSuccess: (data) => {
      navigate(`/mcp-servers/${data.id}`)
    },
  })

  const handleSubmit = async (data: McpServerFormData): Promise<void> => {
    if (!mcpServerID) return
    await updateMcpServer({ id: mcpServerID, data })
  }

  if (isLoading || !server) {
    return <AppPreloader />
  }

  if (error) {
    return <div className="p-5 text-destructive">Failed to load MCP server: {error.message}</div>
  }

  return (
    <McpServerForm
      config={config}
      onSubmit={handleSubmit}
      defaultValues={mcpServerToFormValues(server)}
      submitLabel="Update"
    />
  )
}
