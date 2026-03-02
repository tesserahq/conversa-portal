import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { CreatePermissionData, PermissionType, UpdateRoleData } from './permission.type'
import { IQueryConfig, IQueryParams } from '..'

const PERMISSIONS_ENDPOINT = '/permissions'
const ROLES_ENDPOINT = '/roles'

/**
 * Get all permissions
 */
export async function getPermissions(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<PermissionType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size, q } = params

  const permissions = await fetchApi(`${apiUrl}${PERMISSIONS_ENDPOINT}`, token, nodeEnv, {
    method: 'GET',
    params: { q },
    pagination: { page, size },
  })

  return permissions as IPaging<PermissionType>
}

/**
 * Get all permissions for a specific role
 */
export async function getRolePermissions(
  config: IQueryConfig,
  roleId: string,
  params: IQueryParams
): Promise<IPaging<PermissionType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size, q } = params

  const permissions = await fetchApi(
    `${apiUrl}${ROLES_ENDPOINT}/${roleId}${PERMISSIONS_ENDPOINT}`,
    token,
    nodeEnv,
    {
      method: 'GET',
      params: { q },
      pagination: { page, size },
    }
  )

  return permissions as IPaging<PermissionType>
}

/**
 * Create a permission for a specific role
 */
export async function createRolePermission(
  config: IQueryConfig,
  roleId: string,
  data: CreatePermissionData
): Promise<PermissionType> {
  const { apiUrl, token, nodeEnv } = config

  const permission = await fetchApi(
    `${apiUrl}${ROLES_ENDPOINT}/${roleId}${PERMISSIONS_ENDPOINT}`,
    token,
    nodeEnv,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )

  return permission as PermissionType
}

/**
 * Get a single permission by ID
 */
export async function getPermission(config: IQueryConfig, id: string): Promise<PermissionType> {
  const { apiUrl, token, nodeEnv } = config

  const permission = await fetchApi(`${apiUrl}${PERMISSIONS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return permission as PermissionType
}

/**
 * Update a permission by ID
 */
export async function updatePermission(
  config: IQueryConfig,
  id: string,
  data: UpdateRoleData
): Promise<PermissionType> {
  const { apiUrl, token, nodeEnv } = config

  const permission = await fetchApi(`${apiUrl}${PERMISSIONS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  return permission as PermissionType
}

/**
 * Delete a permission by ID
 */
export async function deletePermission(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config

  await fetchApi(`${apiUrl}${PERMISSIONS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })
}
