import { z } from 'zod'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

const contextSourceCapabilitiesSchema = z.object({
  supports_etag: z.boolean(),
  supports_since_cursor: z.boolean(),
})

/**
 * Base context source schema with common fields
 */
export const contextSourceBaseSchema = z.object({
  source_id: z.string(),
  display_name: z.string(),
  base_url: z.string(),
  credential_id: z.string().uuid(),
  capabilities: contextSourceCapabilitiesSchema,
  poll_interval_seconds: z.number().int().nonnegative(),
  enabled: z.boolean(),
})

/**
 * Schema for creating a context source (POST body)
 */
export const createContextSourceSchema = contextSourceBaseSchema

/**
 * Schema for updating a context source (PATCH body)
 */
export const updateContextSourceSchema = contextSourceBaseSchema.partial()

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================

/**
 * Context source form validation schema
 */
export const contextSourceFormSchema = z.object({
  id: z.string().optional(),
  source_id: z.string().min(1, 'Source ID is required'),
  display_name: z.string().min(1, 'Display name is required'),
  base_url: z.string().url('Base URL must be a valid URL'),
  credential_id: z.string().uuid('Credential is required'),
  capabilities: z.object({
    supports_etag: z.boolean(),
    supports_since_cursor: z.boolean(),
  }),
  poll_interval_seconds: z.coerce
    .number()
    .int()
    .positive('Poll interval must be greater than 0 seconds'),
  enabled: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type ContextSourceFormValue = z.infer<typeof contextSourceFormSchema>

/**
 * Default value for context source form
 */
export const contextSourceFormDefaultValue: ContextSourceFormValue = {
  source_id: '',
  display_name: '',
  base_url: '',
  credential_id: '',
  capabilities: {
    supports_etag: false,
    supports_since_cursor: false,
  },
  poll_interval_seconds: 3600,
  enabled: true,
}
