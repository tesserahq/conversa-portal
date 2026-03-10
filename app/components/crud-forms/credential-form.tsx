import { Form, useFormContext } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import {
  createCredentialFormSchema,
  credentialFormSchema,
  CredentialFormValue,
} from '@/resources/queries/credentials/credential.schema'
import { CircleUserRound, Key, Loader2, Lock } from 'lucide-react'
import {
  CredentialFormData,
  CredentialTypes,
} from '@/resources/queries/credentials/credential.type'
import { Activity, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { formValuesToCredentialData } from '@/resources/queries/credentials/credential.utils'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'
import { IQueryConfig } from '@/resources/queries'
import { useCredentialTypes } from '@/resources/hooks/credentials/use-credential'
import Separator from '@/modules/shadcn/ui/separator'

export interface CredentialTypeDisplay {
  icon: ReactNode
  displayName: string
}

const IdentiesLogo = () => <img src="/images/identies-logo.png" className="w-4 h-4" alt="" />

export function getCredentialTypeDisplay(type: string): CredentialTypeDisplay {
  switch (type) {
    case 'bearer_auth':
      return { icon: <CircleUserRound size={14} />, displayName: 'Bearer Auth' }
    case 'basic_auth':
      return { icon: <Lock size={14} />, displayName: 'Basic Auth' }
    case 'api_key':
      return { icon: <Key size={14} />, displayName: 'API Key' }
    case 'm2m_identies':
      return { icon: <IdentiesLogo />, displayName: 'M2M Identies' }
    case 'delegated_identies_exchange':
      return { icon: <IdentiesLogo />, displayName: 'Delegated Identies Exchange' }
    default:
      return { icon: null, displayName: 'Unknown' }
  }
}

function CustomFields({
  credentialTypes,
  defaultValues,
}: {
  credentialTypes: CredentialTypes[]
  defaultValues?: CredentialFormValue
}) {
  const { form } = useFormContext()
  const type = form.watch('type')
  const prevTypeRef = useRef<string | undefined>(undefined)

  const findType = credentialTypes.find((credentialType) => credentialType.type_name === type)

  // When type changes, clear dynamic fields that don't belong to the new type and reset the new type's fields
  useEffect(() => {
    if (!findType || type === undefined) return

    const typeChanged = prevTypeRef.current !== undefined && prevTypeRef.current !== type
    prevTypeRef.current = type

    if (!typeChanged) return

    const currentFieldNames = new Set(findType.fields.map((f) => f.name))
    const allDynamicFieldNames = new Set(
      credentialTypes.flatMap((ct) => ct.fields.map((f) => f.name))
    )

    for (const fieldName of allDynamicFieldNames) {
      if (currentFieldNames.has(fieldName)) {
        const field = findType.fields.find((f) => f.name === fieldName)
        form.setValue(fieldName, field?.type === 'array' ? [] : '')
      } else {
        form.setValue(fieldName, undefined)
      }
    }
  }, [type, findType, credentialTypes, form])

  if (!findType) return

  return (
    <>
      <Activity mode={findType.fields.length > 0 ? 'visible' : 'hidden'}>
        <Separator />
      </Activity>

      {findType?.fields.map((field) => {
        const isRedacted = (defaultValues as Record<string, unknown>)?.[field.name] === '[REDACTED]'

        if (field.type === 'string') {
          return (
            <Form.Input
              field={field.name}
              label={field.label}
              type={isRedacted ? 'password' : field.input_type}
              placeholder={
                isRedacted && field.input_type === 'text' ? '[REDACTED]' : 'Enter a value'
              }
              required={field.required}
              key={field.name}
              description={field.help}
            />
          )
        }
        if (field.type === 'array') {
          return (
            <Form.Array
              key={field.name}
              field={field.name}
              label={field.label}
              required={field.required}
              description={field.help}
              placeholder={isRedacted ? '[REDACTED]' : 'Enter a value and click Add'}
            />
          )
        }
      })}
    </>
  )
}

interface CredentialFormProps {
  config: IQueryConfig
  defaultValues: CredentialFormValue
  onSubmit: (data: CredentialFormData) => void | Promise<void>
  submitLabel?: string
}

export function CredentialForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  config,
}: CredentialFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const isEditMode = !!defaultValues?.id
  const title = isEditMode ? 'Edit Credential' : 'New Credential'

  const { data: credentialTypes, isLoading } = useCredentialTypes(config)

  const schema = useMemo(() => {
    return credentialTypes?.length
      ? createCredentialFormSchema(credentialTypes)
      : credentialFormSchema
  }, [credentialTypes])

  const credentialTypeOptions = credentialTypes
    ?.map((credentialType) => {
      const { icon, displayName } = getCredentialTypeDisplay(credentialType.type_name)
      return {
        value: credentialType.type_name,
        label: displayName,
        icon,
      }
    })
    ?.sort((a, b) => {
      if (a.value === 'm2m_identies') return -1
      if (b.value === 'm2m_identies') return 1
      return 0
    })

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
        schema={schema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout title={title}>
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
            disabled={isEditMode || credentialTypeOptions?.length === 0}
            options={credentialTypeOptions || []}
            isLoading={isLoading}
          />

          <CustomFields credentialTypes={credentialTypes || []} defaultValues={defaultValues} />

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
