/**
 * Permission Type
 */

export type PermissionType = {
  id: string
  object: string
  action: string
  created_at: string
  updated_at: string
}

/**
 * Create contact data
 */
export type CreatePermissionData = Omit<PermissionType, 'id' | 'created_at' | 'updated_at'>

/**
 * Update contact data (all fields optional)
 */
export type UpdateRoleData = Partial<CreatePermissionData>

/**
 * Contact form data (for form submission)
 */
export type RoleFormData = CreatePermissionData
