/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  createCredential,
  deleteCredential,
  getCredential,
  getCredentials,
  getCredentialTypes,
  updateCredential,
} from '@/resources/queries/credentials/credential.queries'
import {
  CreateCredentialData,
  CredentialType,
  UpdateCredentialData,
} from '@/resources/queries/credentials/credential.type'
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
 * Credential query keys for React Query caching
 */
export const credentialQueryKeys = {
  all: ['credentials'] as const,
  lists: () => [...credentialQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...credentialQueryKeys.lists(), config, params] as const,
  details: () => [...credentialQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...credentialQueryKeys.details(), id] as const,
  types: () => [...credentialQueryKeys.all, 'types'] as const,
}

/**
 * Hook for fetching paginated credentials
 */
export function useCredentials(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: credentialQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getCredentials(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!config.token,
  })
}

/**
 * Hook to fetch a single credential by ID
 */
export function useCredential(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: credentialQueryKeys.detail(id),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getCredential(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!id && !!config.token,
  })
}

/**
 * Hook to create a new credential
 */
export function useCreateCredential(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: CredentialType) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCredentialData) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await createCredential(config, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: credentialQueryKeys.lists() })
      toast.success('Credential created successfully', {
        duration: 3000,
      })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to create credential', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to update an existing credential (PATCH)
 */
export function useUpdateCredential(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: CredentialType) => void
    onError?: (error: QueryError) => void
  }
) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCredentialData }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await updateCredential(config, id, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      client.setQueryData(credentialQueryKeys.detail(data.id), data)
      client.invalidateQueries({ queryKey: credentialQueryKeys.lists() })
      toast.success('Credential updated successfully', {
        duration: 3000,
      })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to update credential', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to delete a credential
 */
export function useDeleteCredential(
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

        return await deleteCredential(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: credentialQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: credentialQueryKeys.lists() })
      toast.success('Credential deleted successfully', {
        duration: 3000,
      })
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to delete credential', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to get credential types
 */
export function useCredentialTypes(
  config: IQueryConfig,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: credentialQueryKeys.types(),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getCredentialTypes(config)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!config.token,
  })
}
