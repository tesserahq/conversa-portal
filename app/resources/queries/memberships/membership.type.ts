/**
 * Membership Type
 */

import { RoleType } from '../roles/role.type'
import { UserType } from '../users/user.type'

export type MembershipType = {
  user_id: string
  role_id: string
  domain: string
  domain_metadata: Record<string, unknown>
  id: string
  created_at: string
  updated_at: string
  user: UserType
  role: RoleType
}

/**
 * Create membership data
 */
export type CreateMembershipData = {
  user_id: string
  domain?: string
  domain_metadata?: Record<string, unknown>
}
