/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from '@/resources/queries/roles/role.queries'
import { CreateRoleData, RoleType, UpdateRoleData } from '@/resources/queries/roles/role.type'
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
 * News query keys for React Query caching
 */
export const roleQueryKeys = {
  all: ['news'] as const,
  lists: () => [...roleQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...roleQueryKeys.lists(), config, params] as const,
  details: () => [...roleQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleQueryKeys.details(), id] as const,
}

/**
 * Hook for fetching paginated contacts
 * @config - Contact query configuration
 * @params - Contact query parameters
 * @options - Contact query options
 */
export function useRoles(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: roleQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getRoles(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!config.token,
  })
}

/**
 * Hook to fetch a single role by ID
 */
export function useRole(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: roleQueryKeys.detail(id),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getRole(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!id && !!config.token,
  })
}

/**
 * Hook to create a new role
 */
export function useCreateRole(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: RoleType) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRoleData) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await createRole(config, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() })
      toast.success('Role created successfully')
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to create role', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to update an existing role
 */
export function useUpdateRole(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: RoleType) => void
    onError?: (error: QueryError) => void
  }
) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleData }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await updateRole(config, id, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      // Update the specific role cache
      client.setQueryData(roleQueryKeys.detail(data.id), data)
      // Invalidate list queries to refetch
      client.invalidateQueries({ queryKey: roleQueryKeys.lists() })
      toast.success('Role updated successfully')
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to update role', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to delete a role
 */
export function useDeleteRole(
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

        return await deleteRole(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (_, id) => {
      // Remove the specific role from cache
      queryClient.removeQueries({ queryKey: roleQueryKeys.detail(id) })
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() })
      toast.success('Role deleted successfully')
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to delete role', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}
