import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'
import {
  ContextSourceSyncStateType,
  TriggerContextSyncResponse,
} from './context-source-sync-state.type'

const CONTEXT_SOURCES_ENDPOINT = '/context-sources'

export async function getContextSourceSyncState(
  config: IQueryConfig,
  sourceID: string,
  params: IQueryParams & { search?: string }
): Promise<IPaging<ContextSourceSyncStateType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size, search } = params

  const syncState = await fetchApi(
    `${apiUrl}${CONTEXT_SOURCES_ENDPOINT}/${sourceID}/sync-state`,
    token,
    nodeEnv,
    {
      method: 'GET',
      pagination: { page, size },
      params: search ? { search } : undefined,
    }
  )

  return syncState as IPaging<ContextSourceSyncStateType>
}

export async function triggerContextSync(
  config: IQueryConfig,
  userID: string
): Promise<TriggerContextSyncResponse> {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(
    `${apiUrl}${CONTEXT_SOURCES_ENDPOINT}/sync/${userID}`,
    token,
    nodeEnv,
    {
      method: 'POST',
    }
  )

  return response as TriggerContextSyncResponse
}
