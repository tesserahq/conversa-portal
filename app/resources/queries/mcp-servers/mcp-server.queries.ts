import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { CreateMcpServerData, McpServerType, UpdateMcpServerData } from './mcp-server.type'
import { IQueryConfig, IQueryParams } from '..'

const MCP_SERVERS_ENDPOINT = '/mcp-servers'

const REFRESH_TOOLS_TIMEOUT_MS = 30_000

export async function getMcpServers(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<McpServerType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const result = await fetchApi(`${apiUrl}${MCP_SERVERS_ENDPOINT}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return result as IPaging<McpServerType>
}

export async function getMcpServer(config: IQueryConfig, id: string): Promise<McpServerType> {
  const { apiUrl, token, nodeEnv } = config

  const server = await fetchApi(`${apiUrl}${MCP_SERVERS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return server as McpServerType
}

export async function createMcpServer(
  config: IQueryConfig,
  data: CreateMcpServerData
): Promise<McpServerType> {
  const { apiUrl, token, nodeEnv } = config

  const server = await fetchApi(`${apiUrl}${MCP_SERVERS_ENDPOINT}`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return server as McpServerType
}

export async function updateMcpServer(
  config: IQueryConfig,
  id: string,
  data: UpdateMcpServerData
): Promise<McpServerType> {
  const { apiUrl, token, nodeEnv } = config

  const server = await fetchApi(`${apiUrl}${MCP_SERVERS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  return server as McpServerType
}

export async function deleteMcpServer(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config

  await fetchApi(`${apiUrl}${MCP_SERVERS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })
}

/**
 * Trigger refresh of tools for an MCP server.
 * Uses AbortController to handle connection timeouts and returns a meaningful error
 * if the MCP server is unreachable.
 */
export async function refreshMcpServerTools(
  config: IQueryConfig,
  id: string
): Promise<{ message?: string }> {
  const { apiUrl, token, nodeEnv } = config

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REFRESH_TOOLS_TIMEOUT_MS)

  try {
    const result = await fetchApi(
      `${apiUrl}${MCP_SERVERS_ENDPOINT}/${id}/refresh-tools`,
      token,
      nodeEnv,
      {
        method: 'POST',
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)
    return (result as { message?: string }) ?? {}
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(
          `Refresh timed out after ${REFRESH_TOOLS_TIMEOUT_MS / 1000} seconds. The MCP server may be unreachable or slow to respond.`
        )
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error(
          'Unable to reach the MCP server. Please check the server URL and that the server is running.'
        )
      }
      throw error
    }
    throw error
  }
}
