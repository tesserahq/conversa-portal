import { RoleFormValue } from './role.schema'
import { CreateRoleData, RoleType } from './role.type'

/**
 * Convert form data to API data
 */
export function roleToFormValues(data: RoleType): RoleFormValue {
  return {
    id: data.id,
    name: data.name,
    identifier: data.identifier,
    description: data.description || '',
    updated_at: data.updated_at,
    created_at: data.created_at,
  }
}

/**
 * Convert form values to contact API data
 */
export function formValuesToRoleData(
  formValues: RoleFormValue
): Omit<RoleType, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: formValues.name,
    identifier: formValues.identifier || '',
    description: formValues.description || '',
  }
}
