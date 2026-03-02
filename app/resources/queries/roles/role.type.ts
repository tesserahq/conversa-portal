/**
 * Role Type
 */

export type RoleType = {
  id: string
  name: string
  identifier: string
  description: string
  created_at: string
  updated_at: string
}

/**
 * Create contact data
 */
export type CreateRoleData = Omit<RoleType, 'id' | 'created_at' | 'updated_at'>

/**
 * Update contact data (all fields optional)
 */
export type UpdateRoleData = Partial<CreateRoleData>

/**
 * Contact form data (for form submission)
 */
export type RoleFormData = CreateRoleData
