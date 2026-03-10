/**
 * Credential Type (list item from API)
 */

export type CredentialType = {
  id: string
  name: string
  type: string
  fields?: Record<string, unknown>
  created_by_id: string
  created_at: string
  updated_at: string
}

/**
 * Create credential data (POST body)
 * fields is optional and type-specific (dynamic key-value pairs per credential type)
 */
export type CreateCredentialData = {
  name: string
  type: string
  fields?: Record<string, unknown>
}

/**
 * Update credential data (PATCH body, all fields optional)
 */
export type UpdateCredentialData = Partial<CreateCredentialData>

/**
 * Credential form data (for form submission)
 */
export type CredentialFormData = CreateCredentialData

/**
 * Credential Types
 */
export type CredentialTypes = {
  type_name: string
  display_name: string
  fields: [
    {
      name: string
      label: string
      type: string
      input_type: string
      help: string
      required: boolean
    },
  ]
}
