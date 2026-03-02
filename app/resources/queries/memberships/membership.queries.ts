import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { CreateMembershipData, MembershipType } from './membership.type'
import { IQueryConfig, IQueryParams } from '..'

const MEMBERSHIPS_ENDPOINT = '/memberships'
const ROLES_ENDPOINT = '/roles'

/**
 * Get paginated memberships for a role
 */
export async function getRoleMemberships(
  config: IQueryConfig,
  roleId: string,
  params: IQueryParams
): Promise<IPaging<MembershipType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const memberships = await fetchApi(
    `${apiUrl}${ROLES_ENDPOINT}/${roleId}/memberships`,
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
 * Get a single membership by ID
 */
export async function getMembership(config: IQueryConfig, id: string): Promise<MembershipType> {
  const { apiUrl, token, nodeEnv } = config

  const membership = await fetchApi(`${apiUrl}${MEMBERSHIPS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return membership as MembershipType
}

/**
 * Create a new membership for a role
 */
export async function createRoleMembership(
  config: IQueryConfig,
  roleId: string,
  data: CreateMembershipData
): Promise<MembershipType> {
  const { apiUrl, token, nodeEnv } = config

  const membership = await fetchApi(
    `${apiUrl}${ROLES_ENDPOINT}/${roleId}/memberships`,
    token,
    nodeEnv,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )

  return membership as MembershipType
}

/**
 * Delete a membership by ID
 */
export async function deleteMembership(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config

  await fetchApi(`${apiUrl}${MEMBERSHIPS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })
}
