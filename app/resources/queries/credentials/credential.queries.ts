import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import {
  CreateCredentialData,
  CredentialType,
  CredentialTypes,
  UpdateCredentialData,
} from './credential.type'
import { IQueryConfig, IQueryParams } from '..'

const CREDENTIALS_ENDPOINT = '/credentials'

export async function getCredentials(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<CredentialType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const credentials = await fetchApi(`${apiUrl}${CREDENTIALS_ENDPOINT}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return credentials as IPaging<CredentialType>
}

export async function getCredential(config: IQueryConfig, id: string): Promise<CredentialType> {
  const { apiUrl, token, nodeEnv } = config

  const credential = await fetchApi(`${apiUrl}${CREDENTIALS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return credential as CredentialType
}

export async function createCredential(
  config: IQueryConfig,
  data: CreateCredentialData
): Promise<CredentialType> {
  const { apiUrl, token, nodeEnv } = config

  const credential = await fetchApi(`${apiUrl}${CREDENTIALS_ENDPOINT}`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return credential as CredentialType
}

export async function updateCredential(
  config: IQueryConfig,
  id: string,
  data: UpdateCredentialData
): Promise<CredentialType> {
  const { apiUrl, token, nodeEnv } = config

  const credential = await fetchApi(`${apiUrl}${CREDENTIALS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

  return credential as CredentialType
}

export async function deleteCredential(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config

  await fetchApi(`${apiUrl}${CREDENTIALS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })
}

export async function getCredentialTypes(config: IQueryConfig): Promise<CredentialTypes[]> {
  const { apiUrl, token, nodeEnv } = config

  const types = await fetchApi(`${apiUrl}${CREDENTIALS_ENDPOINT}/types`, token, nodeEnv, {
    method: 'GET',
  })

  return types as CredentialTypes[]
}
