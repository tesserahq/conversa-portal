import { z } from 'zod'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

/**
 * Permission schema with common fields
 */
export const permissionSchema = z.object({
  ob: z.string().min(1, 'Object is required'),
  action: z.string().min(1, 'Action is required'),
})

/**
 * Schema for creating a role (without id and timestamps)
 */
export const createPermissionSchema = permissionSchema

/**
 * Schema for updating a role
 */
export const updatePermissionSchema = permissionSchema.partial()

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================
export const permissinFormSchema = z.object({
  id: z.string().optional(),
  object: z.string().min(1, 'Object is required'),
  action: z.string().min(1, 'Action is required'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type permissionFormValue = z.infer<typeof permissinFormSchema>

/**
 * Default value for permission form
 */
export const permissionFormDefaultValue: permissionFormValue = {
  object: '',
  action: '',
}
