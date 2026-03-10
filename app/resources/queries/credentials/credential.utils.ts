import { CredentialFormValue } from './credential.schema'
import { CreateCredentialData, CredentialType, UpdateCredentialData } from './credential.type'

const REDACTED_PLACEHOLDER = '[REDACTED]'
const REDACTED_DISPLAY = '****'

/**
 * Recursively replace "[REDACTED]" values with "****" for display.
 * Use when showing credential fields in the UI without revealing that a value was redacted.
 */
export function fieldsForDisplay(
  fields: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!fields || typeof fields !== 'object') return {}
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (value === REDACTED_PLACEHOLDER) {
      result[key] = REDACTED_DISPLAY
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = fieldsForDisplay(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Convert API credential to form values.
 * Flattens fields into top-level form keys so CustomFields are pre-filled when editing.
 */
export function credentialToFormValues(data: CredentialType): CredentialFormValue {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    created_at: data.created_at,
    updated_at: data.updated_at,
    ...(data.fields && typeof data.fields === 'object' ? data.fields : {}),
  }
}

const FORM_META_KEYS = ['name', 'type', 'id', 'created_at', 'updated_at', 'created_by_id'] as const

/**
 * Convert form values to credential API data (POST/PATCH body).
 * Dynamic type-specific fields (from CustomFields) are collected into `fields`.
 */
export function formValuesToCredentialData(formValues: CredentialFormValue): CreateCredentialData {
  const { name, type } = formValues
  const fieldsEntries = Object.entries(formValues).filter(
    ([key, value]) =>
      !FORM_META_KEYS.includes(key as (typeof FORM_META_KEYS)[number]) && value !== undefined
  )
  const fields = fieldsEntries.length > 0 ? Object.fromEntries(fieldsEntries) : undefined
  return {
    name,
    type: type ?? '',
    ...(fields !== undefined && Object.keys(fields).length > 0 ? { fields } : {}),
  }
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((v, i) => isEqual(v, b[i]))
  }
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
  return false
}

/**
 * Build PATCH payload with only changed values compared to the original credential.
 * Omits name, type, and fields (or individual field keys) that are unchanged.
 */
export function getChangedCredentialUpdateData(
  original: CredentialType,
  formData: CreateCredentialData
): UpdateCredentialData {
  const result: UpdateCredentialData = {}

  if (formData.name !== undefined && formData.name !== original.name) {
    result.name = formData.name
  }
  if (formData.type !== undefined && formData.type !== original.type) {
    result.type = formData.type
  }

  const originalFields = (
    original.fields && typeof original.fields === 'object' ? original.fields : {}
  ) as Record<string, unknown>
  const newFields = (
    formData.fields && typeof formData.fields === 'object' ? formData.fields : {}
  ) as Record<string, unknown>

  const allFieldKeys = new Set([...Object.keys(originalFields), ...Object.keys(newFields)])
  const changedFields: Record<string, unknown> = {}
  for (const key of allFieldKeys) {
    const newVal = newFields[key]
    const oldVal = originalFields[key]
    if (!isEqual(newVal, oldVal)) {
      changedFields[key] = newVal
    }
  }
  if (Object.keys(changedFields).length > 0) {
    result.fields = changedFields
  }

  return result
}
