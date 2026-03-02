/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import { getServiceAccounts } from '@/resources/queries/service-accounts/service-account.queries'
import { useQuery } from '@tanstack/react-query'

/**
 * Custom error class for query errors
 */
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

/**
 * Service account query keys for React Query caching
 */
export const serviceAccountQueryKeys = {
  all: ['service-accounts'] as const,
  lists: () => [...serviceAccountQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...serviceAccountQueryKeys.lists(), config, params] as const,
}

/**
 * Hook for fetching paginated service accounts
 * @param config - Service account query configuration
 * @param params - Service account query parameters
 * @param options - Service account query options
 */
export function useServiceAccounts(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: serviceAccountQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getServiceAccounts(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  })
}
