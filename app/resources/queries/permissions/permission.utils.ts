import { permissionFormValue } from './permission.schema'
import { CreatePermissionData, PermissionType } from './permission.type'

/**
 * Convert form data to API data
 */
export function permissionToFormValues(data: PermissionType): permissionFormValue {
  return {
    id: data.id,
    object: data.object,
    action: data.action,
    updated_at: data.updated_at,
    created_at: data.created_at,
  }
}

/**
 * Convert form values to permission API data
 */
export function formValuesToPermissionData(
  formValues: permissionFormValue
): Omit<PermissionType, 'id' | 'created_at' | 'updated_at'> {
  return {
    object: formValues.object,
    action: formValues.action,
  }
}
