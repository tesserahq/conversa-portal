/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  getContextSourceSyncState,
  triggerContextSync,
} from '@/resources/queries/context-sources/context-source-sync-state.queries'
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

export const contextSourceSyncStateQueryKeys = {
  all: ['context-source-sync-state'] as const,
  lists: () => [...contextSourceSyncStateQueryKeys.all, 'list'] as const,
  list: (sourceID: string, config: IQueryConfig, params: IQueryParams & { search?: string }) =>
    [...contextSourceSyncStateQueryKeys.lists(), sourceID, config, params] as const,
}

export function useContextSourceSyncState(
  sourceID: string,
  config: IQueryConfig,
  params: IQueryParams & { search?: string },
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: contextSourceSyncStateQueryKeys.list(sourceID, config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getContextSourceSyncState(config, sourceID, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 60 * 1000,
    enabled: options?.enabled !== false && !!sourceID && !!config.token,
  })
}

export function useTriggerContextSync(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userID: string) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await triggerContextSync(config, userID)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contextSourceSyncStateQueryKeys.lists() })
      toast.success('Re-sync triggered', { duration: 3000 })
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to trigger re-sync', { description: error.message })
      options?.onError?.(error)
    },
  })
}
