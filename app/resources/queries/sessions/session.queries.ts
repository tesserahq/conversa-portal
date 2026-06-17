import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { SessionMessageType, SessionType } from './session.type'
import { IQueryConfig, IQueryParams } from '..'

const SESSIONS_ENDPOINT = '/sessions'

export async function getSessions(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<SessionType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const result = await fetchApi(`${apiUrl}${SESSIONS_ENDPOINT}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return result as IPaging<SessionType>
}

export async function getSession(config: IQueryConfig, id: string): Promise<SessionType> {
  const { apiUrl, token, nodeEnv } = config

  const session = await fetchApi(`${apiUrl}${SESSIONS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return session as SessionType
}

export async function getSessionMessages(
  config: IQueryConfig,
  id: string,
  params: IQueryParams
): Promise<IPaging<SessionMessageType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const result = await fetchApi(`${apiUrl}${SESSIONS_ENDPOINT}/${id}/messages`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return result as IPaging<SessionMessageType>
}
