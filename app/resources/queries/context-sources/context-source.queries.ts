import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'
import {
  ContextSourceType,
  CreateContextSourceData,
  UpdateContextSourceData,
} from './context-source.type'

const CONTEXT_SOURCES_ENDPOINT = '/context-sources'

export async function getContextSources(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<ContextSourceType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const contextSources = await fetchApi(`${apiUrl}${CONTEXT_SOURCES_ENDPOINT}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return contextSources as IPaging<ContextSourceType>
}

export async function getContextSource(
  config: IQueryConfig,
  id: string
): Promise<ContextSourceType> {
  const { apiUrl, token, nodeEnv } = config

  const contextSource = await fetchApi(
    `${apiUrl}${CONTEXT_SOURCES_ENDPOINT}/${id}`,
    token,
    nodeEnv,
    {
      method: 'GET',
    }
  )

  return contextSource as ContextSourceType
}

export async function createContextSource(
  config: IQueryConfig,
  data: CreateContextSourceData
): Promise<ContextSourceType> {
  const { apiUrl, token, nodeEnv } = config

  const contextSource = await fetchApi(`${apiUrl}${CONTEXT_SOURCES_ENDPOINT}`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return contextSource as ContextSourceType
}

export async function updateContextSource(
  config: IQueryConfig,
  id: string,
  data: UpdateContextSourceData
): Promise<ContextSourceType> {
  const { apiUrl, token, nodeEnv } = config

  const contextSource = await fetchApi(
    `${apiUrl}${CONTEXT_SOURCES_ENDPOINT}/${id}`,
    token,
    nodeEnv,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  )

  return contextSource as ContextSourceType
}

export async function deleteContextSource(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config

  await fetchApi(`${apiUrl}${CONTEXT_SOURCES_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })
}
