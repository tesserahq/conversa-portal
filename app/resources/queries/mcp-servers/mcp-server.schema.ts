import { z } from 'zod'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

const extendedInfoSchema = z.record(z.string(), z.unknown()).optional()

export const mcpServerBaseSchema = z.object({
  server_id: z.string(),
  name: z.string(),
  url: z.string().url(),
  credential_id: z.string().uuid(),
  tool_prefix: z.string().optional(),
  tool_cache_ttl_seconds: z.number().int().nonnegative().optional(),
  enabled: z.boolean(),
  extended_info: extendedInfoSchema,
})

export const createMcpServerSchema = mcpServerBaseSchema

export const updateMcpServerSchema = mcpServerBaseSchema.partial()

// ============================================================================
// Form Schema (for client-side form validation)
// ============================================================================

export const mcpServerFormSchema = z.object({
  id: z.string().optional(),
  server_id: z.string().min(1, 'Server ID is required'),
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('URL must be a valid URL'),
  credential_id: z.string().uuid('Credential is required'),
  tool_prefix: z.string().optional(),
  tool_cache_ttl_seconds: z.coerce
    .number()
    .int()
    .nonnegative('Tool cache TTL must be 0 or greater')
    .optional(),
  enabled: z.boolean(),
  extended_info: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type McpServerFormValue = z.infer<typeof mcpServerFormSchema>

export const mcpServerFormDefaultValue: McpServerFormValue = {
  server_id: '',
  name: '',
  url: '',
  credential_id: '',
  tool_prefix: '',
  tool_cache_ttl_seconds: 300,
  enabled: true,
  extended_info: {},
}
