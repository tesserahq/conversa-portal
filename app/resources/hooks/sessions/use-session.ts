/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  getSession,
  getSessionMessages,
  getSessions,
} from '@/resources/queries/sessions/session.queries'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

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

export const sessionQueryKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...sessionQueryKeys.lists(), config, params] as const,
  details: () => [...sessionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionQueryKeys.details(), id] as const,
  messages: (id: string, params: IQueryParams) =>
    [...sessionQueryKeys.detail(id), 'messages', params] as const,
}

export function useSessions(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: sessionQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await getSessions(config, params)
      } catch (error: any) {
        throw new QueryError(error?.message ?? String(error))
      }
    },
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useSession(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: sessionQueryKeys.detail(id),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await getSession(config, id)
      } catch (error: any) {
        throw new QueryError(error?.message ?? String(error))
      }
    },
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!id && !!config.token,
  })
}

/**
 * Paginated session messages backed by `useInfiniteQuery`, so the panel can
 * load additional pages on demand (e.g. when the user scrolls to the bottom).
 *
 * `getNextPageParam` returns `undefined` once the last loaded page is the final
 * page — including the single-page case — so `hasNextPage` is `false` and no
 * further fetch is triggered.
 */
export function useSessionMessagesInfinite(
  config: IQueryConfig,
  id: string,
  params: Omit<IQueryParams, 'page'>,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  const size = params.size ?? 50

  return useInfiniteQuery({
    queryKey: sessionQueryKeys.messages(id, { size }),
    queryFn: async ({ pageParam }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await getSessionMessages(config, id, { page: pageParam, size })
      } catch (error: any) {
        throw new QueryError(error?.message ?? String(error))
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!id && !!config.token,
  })
}
