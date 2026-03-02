import { z } from 'zod'

// ============================================================================
// API Schemas (for server-side validation)
// ============================================================================

/**
 * User schema with common fields
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  avatar_url: z.string(),
  avatar_asset_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  provider: z.string(),
  confirmed_at: z.string(),
  verified: z.boolean(),
  verified_at: z.string(),
  theme_preference: z.enum(['light', 'dark', 'system']),
  service_account: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})
