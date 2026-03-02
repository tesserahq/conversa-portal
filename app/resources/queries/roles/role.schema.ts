import { z } from 'zod'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

/**
 * Base role schema with common fields
 */
export const roleBaseSchema = z.object({
  name: z.string(),
  identifier: z
    .string()
    .toLowerCase()
    .regex(/^[a-z0-9-_]+$/, {
      message: 'Identifier can only contain lowercase letters, numbers, hyphens, and underscores',
    }),
  description: z.string(),
})

/**
 * Schema for creating a role (without id and timestamps)
 */
export const createRoleSchema = roleBaseSchema

/**
 * Schema for updating a role
 */
export const updateRoleSchema = roleBaseSchema.partial()

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================

/**
 * Role form validation schema
 */
export const roleFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  identifier: z
    .string()
    .optional()
    .transform((val) => (val ? val.toLowerCase().trim() : val))
    .refine(
      (val) => {
        // Allow empty/undefined values (since it's optional)
        if (!val || val === '') return true
        // Check pattern: lowercase letters, numbers, hyphens, and underscores only
        return /^[a-z0-9-_]+$/.test(val)
      },
      {
        message:
          'Identifier can only contain lowercase letters, numbers, hyphens, and underscores. No spaces allowed.',
      }
    ),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type RoleFormValue = z.infer<typeof roleFormSchema>

/**
 * Default value for role form
 */
export const roleFormDefaultValue: RoleFormValue = {
  name: '',
  identifier: '',
  description: '',
}
