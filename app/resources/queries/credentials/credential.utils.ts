import { CredentialFormValue } from './credential.schema'
import { CreateCredentialData, CredentialType } from './credential.type'

/**
 * Convert API credential to form values
 */
export function credentialToFormValues(data: CredentialType): CredentialFormValue {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Convert form values to credential API data (POST/PATCH body)
 */
export function formValuesToCredentialData(formValues: CredentialFormValue): CreateCredentialData {
  return {
    name: formValues.name,
    type: formValues.type,
  }
}
