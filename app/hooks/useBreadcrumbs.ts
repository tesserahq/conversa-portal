/* eslint-disable @typescript-eslint/no-explicit-any */
import { type QueryKey, useQueries } from '@tanstack/react-query'
import { NodeENVType } from '@/libraries/fetch'
import { BreadcrumbItemData } from 'tessera-ui'
import { IQueryConfig } from '@/resources/queries'
import { generateBreadcrumbs } from '@/utils/helpers/breadcumb.helper'
import { getCredential } from '@/resources/queries/credentials/credential.queries'
import { getContextSource } from '@/resources/queries/context-sources/context-source.queries'
import { getSession } from '@/resources/queries/sessions/session.queries'
import { credentialQueryKeys } from '@/resources/hooks/credentials/use-credential'
import { contextSourceQueryKeys } from '@/resources/hooks/context-sources/use-context-source'
import { sessionQueryKeys } from '@/resources/hooks/sessions/use-session'

/**
 * Resource state per breadcrumb
 */
export type BreadcrumbResourceState<T = any> = {
  data?: T
  isLoading: boolean
  error?: Error | null
}

/**
 * Breadcrumb hook config
 */
interface BreadcrumbConfigType {
  pathname: string
  params: Record<string, string | undefined>
  token: string
  apiUrl: string
  nodeEnv: NodeENVType
}

/**
 * Internal query config
 */
type BreadcrumbQueryConfig = {
  paramKey: string
  queryKey: QueryKey
  queryFn: () => Promise<any>
  enabled: boolean
  staleTime: number
}

/**
 * Fetcher registry (NO HOOKS)
 */
const breadcrumbFetchers = {
  credentialID: {
    queryKey: credentialQueryKeys.detail,
    fetch: (config: IQueryConfig, id: string) => getCredential(config, id),
  },
  contextSourceID: {
    queryKey: contextSourceQueryKeys.detail,
    fetch: (config: IQueryConfig, id: string) => getContextSource(config, id),
  },
  sessionID: {
    queryKey: sessionQueryKeys.detail,
    fetch: (config: IQueryConfig, id: string) => getSession(config, id),
  },
}

export default function useBreadcrumb(config: BreadcrumbConfigType): BreadcrumbItemData[] {
  const { pathname, params, apiUrl, nodeEnv, token } = config

  const pathParts = pathname.split('/').filter(Boolean)

  const queriesConfig = pathParts
    .map((part) => {
      const matched = Object.entries(params).find(([, value]) => value === part)

      if (!matched) return null

      const [paramKey] = matched
      const id = part
      const resolver = breadcrumbFetchers[paramKey as keyof typeof breadcrumbFetchers]

      if (!resolver) return null

      return {
        paramKey,
        queryKey: resolver.queryKey(id) as QueryKey,
        queryFn: () => resolver.fetch({ apiUrl, token, nodeEnv }, id),
        enabled: Boolean(token),
        staleTime: 5 * 60 * 1000,
      }
    })
    .filter((q): q is BreadcrumbQueryConfig => q !== null)

  const queryResults = useQueries({
    queries: queriesConfig.map(({ paramKey, ...q }) => q),
  })

  /**
   * Build resource map WITH loading state
   */
  const resourceData = queriesConfig.reduce<Record<string, BreadcrumbResourceState>>(
    (acc, config, index) => {
      const result = queryResults[index]

      acc[config.paramKey] = {
        data: result?.data,
        isLoading: result?.isFetching ?? false,
        error: result?.error as Error | null,
      }

      return acc
    },
    {}
  )

  return generateBreadcrumbs({
    pathname,
    params,
    resourceData,
  })
}
