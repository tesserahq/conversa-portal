/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  createRolePermission,
  deletePermission,
  getPermissions,
  getPermission,
  getRolePermissions,
  updatePermission,
} from '@/resources/queries/permissions/permission.queries'
import {
  CreatePermissionData,
  PermissionType,
  UpdateRoleData,
} from '@/resources/queries/permissions/permission.type'
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
 * Permission query keys for React Query caching
 */
export const permissionQueryKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionQueryKeys.all, 'list'] as const,
  list: (params: IQueryParams) => [...permissionQueryKeys.lists(), params] as const,
  rolePermissions: (roleId: string) => [...permissionQueryKeys.all, 'role', roleId] as const,
  details: () => [...permissionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...permissionQueryKeys.details(), id] as const,
}

/**
 * Hook for fetching permissions
 * @config - Permission query configuration
 * @params - Permission query parameters
 * @options - Permission query options
 */
export function usePermissions(
  config: IQueryConfig,
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
    queryKey: permissionQueryKeys.list(params),
    queryFn: async () => {
      try {
        return await getPermissions(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook for fetching permissions for a specific role
 * @config - Permission query configuration
 * @roleId - Role ID to fetch permissions for
 * @options - Permission query options
 */
export function useRolePermissions(
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
    queryKey: [...permissionQueryKeys.rolePermissions(roleId), params],
    queryFn: async () => {
      try {
        return await getRolePermissions(config, roleId, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!roleId,
  })
}

/**
 * Hook to fetch a single permission by ID
 */
export function usePermission(
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
    queryKey: permissionQueryKeys.detail(id),
    queryFn: async () => {
      try {
        return await getPermission(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!id,
  })
}

/**
 * Hook to create a new permission for a role
 */
export function useCreateRolePermission(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: PermissionType) => void
    onError?: (error: Error) => void
    showToast?: boolean
  }
) {
  const queryClient = useQueryClient()

  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useMutation({
    mutationFn: async ({ roleId, data }: { roleId: string; data: CreatePermissionData }) => {
      try {
        return await createRolePermission(config, roleId, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate role permissions list to refetch
      queryClient.invalidateQueries({
        queryKey: permissionQueryKeys.rolePermissions(variables.roleId),
      })
      if (options?.showToast !== false) {
        toast.success('Permission created successfully')
      }
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      if (options?.showToast !== false) {
        toast.error('Failed to create permission', {
          description: error.message,
        })
      }
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to update an existing permission
 */
export function useUpdatePermission(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: PermissionType) => void
    onError?: (error: QueryError) => void
  }
) {
  const client = useQueryClient()

  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleData }) => {
      try {
        return await updatePermission(config, id, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      // Update the specific permission cache
      client.setQueryData(permissionQueryKeys.detail(data.id), data)
      // Invalidate all role permissions queries (since permission might be associated with roles)
      client.invalidateQueries({ queryKey: permissionQueryKeys.all })
      toast.success('Permission updated successfully')
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to update permission', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to delete a permission
 */
export function useDeletePermission(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
    showToast?: boolean
  }
) {
  const queryClient = useQueryClient()

  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await deletePermission(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (_, id) => {
      // Remove the specific permission from cache
      queryClient.removeQueries({ queryKey: permissionQueryKeys.detail(id) })
      // Invalidate all role permissions queries
      queryClient.invalidateQueries({ queryKey: permissionQueryKeys.all })
      if (options?.showToast !== false) {
        toast.success('Permission deleted successfully')
      }
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      if (options?.showToast !== false) {
        toast.error('Failed to delete permission', {
          description: error.message,
        })
      }
      options?.onError?.(error)
    },
  })
}
