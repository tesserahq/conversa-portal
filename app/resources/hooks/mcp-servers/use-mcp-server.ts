/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  createMcpServer,
  deleteMcpServer,
  getMcpServer,
  getMcpServers,
  refreshMcpServerTools,
  updateMcpServer,
} from '@/resources/queries/mcp-servers/mcp-server.queries'
import {
  CreateMcpServerData,
  McpServerType,
  UpdateMcpServerData,
} from '@/resources/queries/mcp-servers/mcp-server.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'tessera-ui/components'

class QueryError extends Error {
  code?: string
  details?: unknown

  constructor(message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'QueryError'
    this.code = code
    this.details = details
  }
}

export const mcpServerQueryKeys = {
  all: ['mcp-servers'] as const,
  lists: () => [...mcpServerQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...mcpServerQueryKeys.lists(), config, params] as const,
  details: () => [...mcpServerQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...mcpServerQueryKeys.details(), id] as const,
}

export function useMcpServers(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: mcpServerQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await getMcpServers(config, params)
      } catch (error: any) {
        throw new QueryError(error?.message ?? String(error))
      }
    },
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useMcpServer(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: mcpServerQueryKeys.detail(id),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await getMcpServer(config, id)
      } catch (error: any) {
        throw new QueryError(error?.message ?? String(error))
      }
    },
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!id && !!config.token,
  })
}

export function useCreateMcpServer(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: McpServerType) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateMcpServerData) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await createMcpServer(config, data)
      } catch (error: any) {
        throw new QueryError(error?.message ?? String(error))
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mcpServerQueryKeys.lists() })
      toast.success('MCP server created successfully', { duration: 3000 })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to create MCP server', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useUpdateMcpServer(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: McpServerType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMcpServerData }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await updateMcpServer(config, id, data)
      } catch (error: any) {
        throw new QueryError(error?.message ?? String(error))
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(mcpServerQueryKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: mcpServerQueryKeys.lists() })
      toast.success('MCP server updated successfully', { duration: 3000 })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to update MCP server', { description: error.message })
      options?.onError?.(error as QueryError)
    },
  })
}

export function useDeleteMcpServer(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await deleteMcpServer(config, id)
      } catch (error: any) {
        throw new QueryError(error?.message ?? String(error))
      }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: mcpServerQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: mcpServerQueryKeys.lists() })
      toast.success('MCP server deleted successfully', { duration: 3000 })
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to delete MCP server', { description: error.message })
      options?.onError?.(error as QueryError)
    },
  })
}

/**
 * Refresh tools for an MCP server. Handles connection timeouts and unreachable servers
 * with meaningful error toasts.
 */
export function useRefreshMcpServerTools(
  config: IQueryConfig,
  options?: {
    onSuccess?: (id: string) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await refreshMcpServerTools(config, id)
      } catch (error: any) {
        throw new QueryError(error?.message ?? String(error))
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: mcpServerQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: mcpServerQueryKeys.lists() })
      toast.success('Tools refreshed successfully', { duration: 3000 })
      options?.onSuccess?.(id)
    },
    onError: (error: Error) => {
      toast.error('Refresh tools failed', { description: error.message })
      options?.onError?.(error)
    },
  })
}
