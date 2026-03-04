/**
 * Credential Type (list item from API)
 */

export type CredentialType = {
  id: string
  name: string
  type: string
  created_by_id: string
  created_at: string
  updated_at: string
}

/**
 * Create credential data (POST body)
 */
export type CreateCredentialData = {
  name: string
  type: string
}

/**
 * Update credential data (PATCH body, all fields optional)
 */
export type UpdateCredentialData = Partial<CreateCredentialData>

/**
 * Credential form data (for form submission)
 */
export type CredentialFormData = CreateCredentialData
