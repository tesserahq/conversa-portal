import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { MembershipType } from '@/resources/queries/memberships/membership.type'
import { IQueryConfig, IQueryParams } from '..'
import { PermissionCheckRequest, PermissionCheckResponse, UserType } from './user.type'

const USERS_ENDPOINT = '/users'
const USER_PERMISSION_CHECKS_ENDPOINT = 'permission-checks'

/**
 * Get paginated users
 */
export async function getUsers(
  config: IQueryConfig,
  params: IQueryParams,
  isIdenties?: boolean
): Promise<IPaging<UserType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size, q } = params

  const endpoint = isIdenties ? USERS_ENDPOINT : `${USERS_ENDPOINT}/`

  const users = await fetchApi(`${apiUrl}${endpoint}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
    params: { q },
  })

  return users as IPaging<UserType>
}

/**
 * Get a single user by ID
 */
export async function getUser(config: IQueryConfig, id: string): Promise<UserType> {
  const { apiUrl, token, nodeEnv } = config

  const user = await fetchApi(`${apiUrl}${USERS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return user as UserType
}

/**
 * Get paginated memberships for a user
 */
export async function getUserMemberships(
  config: IQueryConfig,
  userId: string,
  params: IQueryParams
): Promise<IPaging<MembershipType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const memberships = await fetchApi(
    `${apiUrl}${USERS_ENDPOINT}/${userId}/memberships`,
    token,
    nodeEnv,
    {
      method: 'GET',
      pagination: { page, size },
    }
  )

  return memberships as IPaging<MembershipType>
}

/**
 * Check if a user can execute a specific action
 */
export async function checkUserPermission(
  config: IQueryConfig,
  userId: string,
  data: PermissionCheckRequest
): Promise<PermissionCheckResponse> {
  const { apiUrl, token, nodeEnv } = config

  const response = await fetchApi(
    `${apiUrl}${USERS_ENDPOINT}/${userId}/${USER_PERMISSION_CHECKS_ENDPOINT}`,
    token,
    nodeEnv,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )

  return response as PermissionCheckResponse
}
