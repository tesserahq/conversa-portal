/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  createRoleMembership,
  deleteMembership,
  getMembership,
  getRoleMemberships,
} from '@/resources/queries/memberships/membership.queries'
import {
  CreateMembershipData,
  MembershipType,
} from '@/resources/queries/memberships/membership.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'tessera-ui/components'

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
 * Membership query keys for React Query caching
 */
export const membershipQueryKeys = {
  all: ['memberships'] as const,
  lists: () => [...membershipQueryKeys.all, 'list'] as const,
  list: (roleId: string, config: IQueryConfig, params: IQueryParams) =>
    [...membershipQueryKeys.lists(), roleId, config, params] as const,
  details: () => [...membershipQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...membershipQueryKeys.details(), id] as const,
}

/**
 * Hook for fetching paginated memberships for a role
 * @param config - Membership query configuration
 * @param roleId - Role ID to fetch memberships for
 * @param params - Membership query parameters
 * @param options - Membership query options
 */
export function useRoleMemberships(
  config: IQueryConfig,
  roleId: string,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useQuery({
    queryKey: membershipQueryKeys.list(roleId, config, params),
    queryFn: async () => {
      try {
        return await getRoleMemberships(config, roleId, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!roleId,
  })
}

/**
 * Hook to fetch a single membership by ID
 */
export function useMembership(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useQuery({
    queryKey: membershipQueryKeys.detail(id),
    queryFn: async () => {
      try {
        return await getMembership(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!id,
  })
}

/**
 * Hook to create a new membership for a role
 */
export function useCreateRoleMembership(
  config: IQueryConfig,
  roleId: string,
  options?: {
    onSuccess?: (data: MembershipType) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()

  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useMutation({
    mutationFn: async (data: CreateMembershipData) => {
      try {
        return await createRoleMembership(config, roleId, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      // Invalidate list queries for this role to refetch
      queryClient.invalidateQueries({
        queryKey: ['memberships', 'list', roleId],
      })
      toast.success('Membership created successfully')
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to create membership', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to delete a membership
 */
export function useDeleteMembership(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await deleteMembership(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (_, id) => {
      // Remove the specific membership from cache
      queryClient.removeQueries({ queryKey: membershipQueryKeys.detail(id) })
      // Invalidate all list queries to refetch (since we don't know which role it belonged to)
      queryClient.invalidateQueries({ queryKey: membershipQueryKeys.lists() })
      toast.success('Membership deleted successfully')
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to delete membership', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}
