import { ContextSourceFormValue } from './context-source.schema'
import { ContextSourceType, CreateContextSourceData } from './context-source.type'

/**
 * Convert API context source to form values
 */
export function contextSourceToFormValues(data: ContextSourceType): ContextSourceFormValue {
  return {
    id: data.id,
    source_id: data.source_id,
    display_name: data.display_name,
    base_url: data.base_url,
    credential_id: data.credential_id,
    capabilities: {
      supports_etag: data.capabilities.supports_etag,
      supports_since_cursor: data.capabilities.supports_since_cursor,
    },
    poll_interval_seconds: data.poll_interval_seconds,
    enabled: data.enabled,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Convert form values to context source API data (POST/PATCH body)
 */
export function formValuesToContextSourceData(
  formValues: ContextSourceFormValue
): CreateContextSourceData {
  return {
    source_id: formValues.source_id,
    display_name: formValues.display_name,
    base_url: formValues.base_url,
    credential_id: formValues.credential_id,
    capabilities: {
      supports_etag: formValues.capabilities.supports_etag,
      supports_since_cursor: formValues.capabilities.supports_since_cursor,
    },
    poll_interval_seconds: formValues.poll_interval_seconds,
    enabled: formValues.enabled,
  }
}
