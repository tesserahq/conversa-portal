import { McpServerFormValue } from './mcp-server.schema'
import { CreateMcpServerData, McpServerType } from './mcp-server.type'

/**
 * Convert API MCP server to form values
 */
export function mcpServerToFormValues(data: McpServerType): McpServerFormValue {
  return {
    id: data.id,
    server_id: data.server_id,
    name: data.name,
    url: data.url,
    credential_id: data.credential_id,
    tool_prefix: data.tool_prefix ?? '',
    tool_cache_ttl_seconds: data.tool_cache_ttl_seconds ?? 300,
    enabled: data.enabled,
    extended_info: data.extended_info ?? {},
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Convert form values to MCP server API data (POST/PUT body)
 */
export function formValuesToMcpServerData(formValues: McpServerFormValue): CreateMcpServerData {
  return {
    server_id: formValues.server_id,
    name: formValues.name,
    url: formValues.url,
    credential_id: formValues.credential_id,
    tool_prefix: formValues.tool_prefix || undefined,
    tool_cache_ttl_seconds: formValues.tool_cache_ttl_seconds ?? 300,
    enabled: formValues.enabled,
    extended_info: formValues.extended_info,
  }
}
