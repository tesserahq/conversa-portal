import { z } from 'zod'
import type { CredentialTypes } from './credential.type'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

/**
 * Base credential schema with common fields
 */
export const credentialBaseSchema = z.object({
  name: z.string(),
  type: z.string(),
  fields: z.record(z.string(), z.unknown()).optional(),
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

const credentialFormBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  created_by_id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

/**
 * Static credential form schema (no dynamic fields).
 * Use when credential types are not loaded yet.
 */
export const credentialFormSchema = credentialFormBaseSchema

/**
 * Creates a credential form schema that validates dynamic fields based on the
 * selected credential type. Use when credential types are available.
 * Validation in superRefine runs at validate time using current form values,
 * so the correct type's required/optional rules apply when user changes type.
 */
export function createCredentialFormSchema(credentialTypes: CredentialTypes[]) {
  return credentialFormBaseSchema.passthrough().superRefine((data, ctx) => {
    const type = data.type
    if (!type) return

    const credentialType = credentialTypes.find((ct) => ct.type_name === type)
    if (!credentialType?.fields) return

    for (const field of credentialType.fields) {
      const value = data[field.name as keyof typeof data]
      if (field.required) {
        if (value === undefined || value === null || String(value).trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: field.label ? `${field.label} is required` : `${field.name} is required`,
            path: [field.name],
          })
        }
      }
    }
  })
}

export type CredentialFormValue = z.infer<typeof credentialFormSchema> & Record<string, unknown>

/**
 * Default value for credential form
 */
export const credentialFormDefaultValue: CredentialFormValue = {
  name: '',
  type: 'm2m_identies',
}
