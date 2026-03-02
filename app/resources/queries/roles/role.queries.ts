import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { CreateRoleData, RoleType, UpdateRoleData } from './role.type'
import { IQueryConfig, IQueryParams } from '..'

const ROLES_ENDPOINT = '/roles'

export async function getRoles(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<RoleType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const roles = await fetchApi(`${apiUrl}${ROLES_ENDPOINT}/`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return roles as IPaging<RoleType>
}

export async function getRole(config: IQueryConfig, id: string): Promise<RoleType> {
  const { apiUrl, token, nodeEnv } = config

  const role = await fetchApi(`${apiUrl}${ROLES_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return role as RoleType
}

export async function createRole(config: IQueryConfig, data: CreateRoleData): Promise<RoleType> {
  const { apiUrl, token, nodeEnv } = config

  const role = await fetchApi(`${apiUrl}${ROLES_ENDPOINT}/`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return role as RoleType
}

export async function updateRole(
  config: IQueryConfig,
  id: string,
  data: UpdateRoleData
): Promise<RoleType> {
  const { apiUrl, token, nodeEnv } = config

  const role = await fetchApi(`${apiUrl}${ROLES_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  return role as RoleType
}

export async function deleteRole(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config

  await fetchApi(`${apiUrl}${ROLES_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })
}
