import { Form, useFormContext } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import { roleFormSchema, RoleFormValue } from '@/resources/queries/roles/role.schema'
import { Loader2 } from 'lucide-react'
import { RoleFormData } from '@/resources/queries/roles/role.type'
import { useState, useEffect } from 'react'
import { formValuesToRoleData } from '@/resources/queries/roles/role.utils'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'

interface RoleFormProps {
  defaultValues: RoleFormValue
  onSubmit: (data: RoleFormData) => void | Promise<void>
  submitLabel?: string
}

function RoleFormFields() {
  const { form } = useFormContext()
  const nameValue = form.watch('name')
  const [isAutoGenerating, setIsAutoGenerating] = useState(true)

  // Auto-generate identifier from name when name changes
  useEffect(() => {
    if (isAutoGenerating && nameValue) {
      const generatedIdentifier = nameValue
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '') // Remove invalid characters
      form.setValue('identifier', generatedIdentifier, { shouldValidate: true })
    }
  }, [nameValue, isAutoGenerating, form])

  // Handle identifier field changes - filter invalid characters and transform value
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoGenerating(false)

    // Get the raw input value
    const rawValue = e.target.value

    // Filter out invalid characters in real-time (only allow a-z, 0-9, -, _)
    // Convert to lowercase and remove any character that's not lowercase letter, number, hyphen, or underscore
    const filteredValue = rawValue.toLowerCase().replace(/[^a-z0-9-_]/g, '')

    // Update the input element value to reflect the filtered value
    // This will be picked up by React Hook Form's onChange handler
    e.target.value = filteredValue
  }

  return (
    <>
      <Form.Input field="name" label="Name" placeholder="Enter role name" autoFocus required />

      <Form.Input
        field="identifier"
        label="Identifier"
        placeholder="e.g., admin-role, user_manager"
        description="Only lowercase letters, numbers, hyphens (-), and underscores (_) are allowed. No spaces or special characters."
        onChange={handleIdentifierChange}
      />
    </>
  )
}

export function RoleForm({ defaultValues, onSubmit, submitLabel = 'Save' }: RoleFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const title = defaultValues?.id ? 'Edit Role' : 'New Role'

  const handleSubmit = async (data: RoleFormValue) => {
    setIsSubmitting(true)

    try {
      const roleListData = formValuesToRoleData(data)
      await onSubmit(roleListData)
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-5">
      <Form
        schema={roleFormSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout title={title}>
          <RoleFormFields />

          <Form.Textarea
            field="description"
            label="Description"
            placeholder="Enter role description"
            rows={4}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/roles')}>
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
