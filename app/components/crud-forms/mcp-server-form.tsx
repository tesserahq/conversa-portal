import { Form } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import {
  mcpServerFormSchema,
  McpServerFormValue,
} from '@/resources/queries/mcp-servers/mcp-server.schema'
import { McpServerFormData } from '@/resources/queries/mcp-servers/mcp-server.type'
import { formValuesToMcpServerData } from '@/resources/queries/mcp-servers/mcp-server.utils'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'
import { IQueryConfig } from '@/resources/queries'
import { useCredentials } from '@/resources/hooks/credentials/use-credential'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

interface McpServerFormProps {
  config: IQueryConfig
  defaultValues: McpServerFormValue
  onSubmit: (data: McpServerFormData) => void | Promise<void>
  submitLabel?: string
}

function McpServerFormFields({
  credentialOptions,
  isCredentialLoading,
}: {
  credentialOptions: { value: string; label: string }[]
  isCredentialLoading: boolean
}) {
  return (
    <>
      <Form.Input
        field="server_id"
        label="Server ID"
        placeholder="Enter server ID"
        autoFocus
        required
      />
      <Form.Input field="name" label="Name" placeholder="Enter name" required />
      <Form.Input field="url" label="URL" placeholder="https://example.com/mcp" required />
      <Form.Select
        field="credential_id"
        label="Credential"
        placeholder="Select credential"
        options={credentialOptions}
        isLoading={isCredentialLoading}
        required
      />
      <Form.Input field="tool_prefix" label="Tool Prefix" placeholder="Optional tool prefix" />
      <Form.Input
        field="tool_cache_ttl_seconds"
        label="Tool cache TTL (seconds)"
        type="number"
        min={0}
      />
      <Form.Switch field="enabled" label="Enabled" />
    </>
  )
}

export function McpServerForm({
  config,
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
}: McpServerFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const title = defaultValues?.id ? 'Edit MCP Server' : 'New MCP Server'

  const { data: credentials, isLoading: isCredentialLoading } = useCredentials(
    config,
    { page: 1, size: 100 },
    { enabled: !!config.token }
  )

  const credentialOptions = (credentials?.items || []).map((credential) => ({
    value: credential.id,
    label: credential.name,
  }))

  const handleSubmit = async (data: McpServerFormValue) => {
    setIsSubmitting(true)
    try {
      const payload = formValuesToMcpServerData(data)
      await onSubmit(payload)
    } catch {
      // Error handling is done by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-5">
      <Form
        schema={mcpServerFormSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout title={title}>
          <McpServerFormFields
            credentialOptions={credentialOptions}
            isCredentialLoading={isCredentialLoading}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/mcp-servers')}>
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
