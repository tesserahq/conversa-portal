import { z } from 'zod'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

/**
 * Base credential schema with common fields
 */
export const credentialBaseSchema = z.object({
  name: z.string(),
  type: z.string(),
})

/**
 * Schema for creating a credential (POST body)
 */
export const createCredentialSchema = credentialBaseSchema

/**
 * Schema for updating a credential (PATCH body)
 */
export const updateCredentialSchema = credentialBaseSchema.partial()

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================

/**
 * Credential form validation schema
 */
export const credentialFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  created_by_id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type CredentialFormValue = z.infer<typeof credentialFormSchema>

/**
 * Default value for credential form
 */
export const credentialFormDefaultValue: CredentialFormValue = {
  name: '',
  type: 'm2m_identies',
}
