import { Form } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import {
  contextSourceFormSchema,
  ContextSourceFormValue,
} from '@/resources/queries/context-sources/context-source.schema'
import { Loader2 } from 'lucide-react'
import { ContextSourceFormData } from '@/resources/queries/context-sources/context-source.type'
import { useState } from 'react'
import { formValuesToContextSourceData } from '@/resources/queries/context-sources/context-source.utils'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'
import { IQueryConfig } from '@/resources/queries'
import { useCredentials } from '@/resources/hooks/credentials/use-credential'

interface ContextSourceFormProps {
  config: IQueryConfig
  defaultValues: ContextSourceFormValue
  onSubmit: (data: ContextSourceFormData) => void | Promise<void>
  submitLabel?: string
}

function ContextSourceFormFields({
  credentialOptions,
  isCredentialLoading,
}: {
  credentialOptions: { value: string; label: string }[]
  isCredentialLoading: boolean
}) {
  return (
    <>
      <Form.Input
        field="source_id"
        label="Source ID"
        placeholder="Enter source ID"
        autoFocus
        required
      />
      <Form.Input
        field="display_name"
        label="Display Name"
        placeholder="Enter display name"
        required
      />
      <Form.Input field="base_url" label="Base URL" placeholder="https://example.com" required />
      <Form.Select
        field="credential_id"
        label="Credential"
        placeholder="Select credential"
        options={credentialOptions}
        isLoading={isCredentialLoading}
        required
      />
      <Form.Input
        field="poll_interval_seconds"
        label="Poll Interval (seconds)"
        type="number"
        min={1}
        required
      />
      <Form.Switch field="enabled" label="Enabled" />
      <Form.Switch field="capabilities.supports_etag" label="Supports ETag" />
      <Form.Switch field="capabilities.supports_since_cursor" label="Supports Since Cursor" />
    </>
  )
}

export function ContextSourceForm({
  config,
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
}: ContextSourceFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const title = defaultValues?.id ? 'Edit Context Source' : 'New Context Source'

  const { data: credentials, isLoading: isCredentialLoading } = useCredentials(
    config,
    { page: 1, size: 100 },
    { enabled: !!config.token }
  )

  const credentialOptions = (credentials?.items || []).map((credential) => ({
    value: credential.id,
    label: credential.name,
  }))

  const handleSubmit = async (data: ContextSourceFormValue) => {
    setIsSubmitting(true)

    try {
      const contextSourceData = formValuesToContextSourceData(data)
      await onSubmit(contextSourceData)
    } catch {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-5">
      <Form
        schema={contextSourceFormSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout title={title}>
          <ContextSourceFormFields
            credentialOptions={credentialOptions}
            isCredentialLoading={isCredentialLoading}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/context-sources')}>
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
