import { Form } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import {
  credentialFormSchema,
  CredentialFormValue,
} from '@/resources/queries/credentials/credential.schema'
import { Loader2 } from 'lucide-react'
import { CredentialFormData } from '@/resources/queries/credentials/credential.type'
import { useState } from 'react'
import { formValuesToCredentialData } from '@/resources/queries/credentials/credential.utils'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'

const CREDENTIAL_TYPE_OPTIONS = [
  { value: 'bearer_auth', label: 'Bearer Authentication' },
  { value: 'basic_auth', label: 'Basic Authentication' },
  { value: 'api_key', label: 'API Key' },
  { value: 'm2m_identies', label: 'M2M Identies' },
  { value: 'delegated_identies_exchange', label: 'Delegated Identies Exchange' },
]

interface CredentialFormProps {
  defaultValues: CredentialFormValue
  onSubmit: (data: CredentialFormData) => void | Promise<void>
  submitLabel?: string
}

function CredentialFormFields() {
  return (
    <>
      <Form.Input
        field="name"
        label="Name"
        placeholder="Enter credential name"
        autoFocus
        required
      />

      <Form.Select
        field="type"
        label="Type"
        placeholder="Select credential type"
        required
        disabled
        options={CREDENTIAL_TYPE_OPTIONS}
      />
    </>
  )
}

export function CredentialForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
}: CredentialFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const title = defaultValues?.id ? 'Edit Credential' : 'New Credential'

  const handleSubmit = async (data: CredentialFormValue) => {
    setIsSubmitting(true)

    try {
      const credentialData = formValuesToCredentialData(data)
      await onSubmit(credentialData)
    } catch {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-5">
      <Form
        schema={credentialFormSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout title={title}>
          <CredentialFormFields />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/credentials')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </FormLayout>
      </Form>
    </div>
  )
}
