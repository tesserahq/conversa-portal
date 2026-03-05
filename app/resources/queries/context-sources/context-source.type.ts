export type ContextSourceCapabilities = {
  supports_etag: boolean
  supports_since_cursor: boolean
}

/**
 * Context source type (list/detail item from API)
 */
export type ContextSourceType = {
  id: string
  source_id: string
  display_name: string
  base_url: string
  credential_id: string
  capabilities: ContextSourceCapabilities
  poll_interval_seconds: number
  enabled: boolean
  created_at: string
  updated_at: string
}

/**
 * Create context source data (POST body)
 */
export type CreateContextSourceData = {
  source_id: string
  display_name: string
  base_url: string
  credential_id: string
  capabilities: ContextSourceCapabilities
  poll_interval_seconds: number
  enabled: boolean
}

/**
 * Update context source data (PATCH body, all fields optional)
 */
export type UpdateContextSourceData = Partial<CreateContextSourceData>

/**
 * Context source form data (for form submission)
 */
export type ContextSourceFormData = CreateContextSourceData
